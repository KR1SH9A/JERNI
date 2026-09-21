import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';

/**
 * RealtimeService — thin wrapper around the Socket.io Server instance.
 *
 * The gateway sets the server reference via `setServer()` in `afterInit()`.
 * Event-listener handlers inject this service and call `emitToJourneyRoom()`
 * so the gateway class itself stays free of domain logic.
 */
@Injectable()
export class RealtimeService {
  private readonly logger = new Logger(RealtimeService.name);
  private server: Server | null = null;

  /** Called by the gateway's afterInit lifecycle hook. */
  setServer(server: Server): void {
    this.server = server;
  }

  /**
   * Emit `event` with `payload` to:
   *  - `journey:{journeyId}` (members)
   *  - `journey:{journeyId}:observe` (non-member observers — e.g. public stats viewers)
   */
  emitToJourneyRoom(journeyId: string, event: string, payload: unknown): void {
    if (!this.server) {
      this.logger.warn('Server not initialised — cannot emit realtime event');
      return;
    }

    const memberRoom = `journey:${journeyId}`;
    const observerRoom = `journey:${journeyId}:observe`;

    // this.server is already the /journeys namespace (injected by @WebSocketServer()
    // inside a @WebSocketGateway({ namespace: '/journeys' }) class). Calling .of()
    // on a namespace returns undefined and throws. Emit directly on this.server.
    this.server.to(memberRoom).to(observerRoom).emit(event, payload);
    this.logger.debug(`Emitted "${event}" to rooms [${memberRoom}, ${observerRoom}]`);
  }
}
