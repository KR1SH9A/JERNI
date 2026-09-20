import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';

import { RealtimeGateway } from './realtime.gateway';
import { RealtimeService } from './realtime.service';
import { REALTIME_EVENT_HANDLERS } from './realtime.event-listener';

// Needs the membership ORM entity + repository to verify room membership
import { ParticipationModule } from '../participation/participation.module';

/**
 * RealtimeModule — Socket.io WebSocket gateway for the /journeys namespace.
 *
 * Imports:
 *  - ParticipationModule: exports MEMBERSHIP_REPOSITORY so the gateway can
 *    verify server-side whether a connecting user is an active member before
 *    placing them in the member (vs. observer) room.
 *
 * Providers:
 *  - RealtimeGateway: the @WebSocketGateway class
 *  - RealtimeService: holds the Server ref + emitToJourneyRoom() helper
 *  - REALTIME_EVENT_HANDLERS: @EventsHandler classes subscribed to the CQRS EventBus
 */
@Module({
  imports: [
    ParticipationModule,
  ],
  providers: [
    RealtimeGateway,
    RealtimeService,
    ...REALTIME_EVENT_HANDLERS,
  ],
})
export class RealtimeModule {}
