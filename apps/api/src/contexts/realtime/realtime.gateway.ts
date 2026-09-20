import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Inject, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';
import * as jwksClient from 'jwks-rsa';
import { RealtimeService } from './realtime.service';
import { MembershipRepository, MEMBERSHIP_REPOSITORY } from '../participation/application/ports/membership.repository';
import { JourneyId } from '../../shared-kernel/value-objects/journey-id.vo';
import { UserId } from '../../shared-kernel/value-objects/user-id.vo';

/** Shape stored on socket.data after successful JWT verification. */
interface SocketUser {
  id: string;
  email?: string;
}

/**
 * RealtimeGateway — Socket.io WebSocket gateway for the /journeys namespace.
 *
 * Architecture: pure delivery layer (no business logic, no DB writes).
 * - Authenticates connections via the Supabase JWT in handshake.auth.token
 * - Manages room membership (join / observe) for journey rooms
 * - Delegates event emission to RealtimeService (called by domain event handlers)
 *
 * Room convention:
 *   `journey:{journeyId}`         — active members (and curator)
 *   `journey:{journeyId}:observe` — authenticated but non-member viewers
 */
@WebSocketGateway({
  namespace: '/journeys',
  cors: {
    origin: process.env.WEB_ORIGIN ?? 'http://localhost:3000',
    credentials: true,
  },
})
export class RealtimeGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private readonly server!: Server;

  private readonly logger = new Logger(RealtimeGateway.name);

  /** JWKS client — reused across connections (caches public keys). */
  private readonly jwksRsaClient = jwksClient.default({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri:
      process.env.SUPABASE_JWKS_URI ??
      `${process.env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`,
  });

  constructor(
    private readonly realtimeService: RealtimeService,
    @Inject(MEMBERSHIP_REPOSITORY)
    private readonly membershipRepo: MembershipRepository,
  ) {}

  // ── Lifecycle ────────────────────────────────────────────────────────────────

  afterInit(server: Server): void {
    this.realtimeService.setServer(server);
    this.logger.log('RealtimeGateway initialised — /journeys namespace ready');
  }

  async handleConnection(client: Socket): Promise<void> {
    const token = client.handshake.auth?.token as string | undefined;

    if (!token) {
      this.logger.warn(`[${client.id}] No token provided — disconnecting`);
      client.disconnect(true);
      return;
    }

    try {
      const user = await this.verifyJwt(token);
      client.data.user = user;
      this.logger.debug(`[${client.id}] Connected as user ${user.id}`);
    } catch (err) {
      this.logger.warn(`[${client.id}] Invalid JWT — disconnecting: ${(err as Error).message}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket): void {
    const userId = (client.data.user as SocketUser | undefined)?.id ?? 'anonymous';
    this.logger.debug(`[${client.id}] Disconnected (user: ${userId})`);
  }

  // ── Message handlers ─────────────────────────────────────────────────────────

  /**
   * join — client emits `{ journeyId }` after connecting.
   *
   * Members join `journey:{journeyId}` (receive all events).
   * Non-members join `journey:{journeyId}:observe` (receive stats.updated only).
   */
  @SubscribeMessage('join')
  async handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { journeyId: string },
  ): Promise<void> {
    const user = client.data.user as SocketUser | undefined;
    if (!user) {
      client.disconnect(true);
      return;
    }

    const { journeyId } = data;
    if (!journeyId || typeof journeyId !== 'string') {
      client.emit('error', { code: 'INVALID_PAYLOAD', message: 'journeyId required' });
      return;
    }

    // Check membership server-side — client cannot claim their own room
    let isMember = false;
    try {
      const membership = await this.membershipRepo.findActive(
        JourneyId.of(journeyId),
        UserId.of(user.id),
      );
      isMember = membership !== null;
    } catch {
      // On error, default to observer only
    }

    const room = isMember
      ? `journey:${journeyId}`
      : `journey:${journeyId}:observe`;

    await client.join(room);
    client.emit('joined', { journeyId, role: isMember ? 'member' : 'observer' });
    this.logger.debug(`[${client.id}] User ${user.id} joined room "${room}"`);
  }

  // ── Private ─────────────────────────────────────────────────────────────────

  /** Verify a Supabase-issued JWT via JWKS and return the user identity. */
  private verifyJwt(token: string): Promise<SocketUser> {
    return new Promise((resolve, reject) => {
      // Decode without verification first to get the key ID (kid)
      const decoded = jwt.decode(token, { complete: true });
      if (!decoded || typeof decoded === 'string' || !decoded.header?.kid) {
        return reject(new Error('Malformed JWT'));
      }

      this.jwksRsaClient.getSigningKey(decoded.header.kid, (err, key) => {
        if (err || !key) {
          return reject(err ?? new Error('Could not fetch signing key'));
        }

        const signingKey = key.getPublicKey();
        const supabaseUrl = process.env.SUPABASE_URL ?? '';

        jwt.verify(
          token,
          signingKey,
          {
            algorithms: ['RS256', 'ES256'],
            audience: 'authenticated',
            issuer: `${supabaseUrl}/auth/v1`,
          },
          (verifyErr: jwt.VerifyErrors | null, payload: jwt.JwtPayload | string | undefined) => {
            if (verifyErr || !payload || typeof payload === 'string') {
              return reject(verifyErr ?? new Error('Invalid token'));
            }
            resolve({
              id: payload.sub as string,
              email: (payload as { email?: string }).email,
            });
          },
        );
      });
    });
  }
}
