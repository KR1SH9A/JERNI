import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from '../../../identity/infrastructure/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../identity/infrastructure/auth/jwt.strategy';
import { CompleteTaskUseCase, UncompleteTaskUseCase } from '../../application/use-cases/execution.commands';
import { GetMyProgressQuery } from '../../application/use-cases/execution.queries';

@ApiTags('Execution')
@Controller('journeys/:id')
@ApiBearerAuth()
export class ExecutionController {
  constructor(
    private readonly completeTask: CompleteTaskUseCase,
    private readonly uncompleteTask: UncompleteTaskUseCase,
    private readonly myProgress: GetMyProgressQuery,
  ) {}

  /**
   * POST /journeys/:id/tasks/:taskId/complete — Mark a task as complete.
   * MILESTONE tasks: idempotent constraint via DB unique index (forDate = NULL).
   * RECURRING tasks: forDate = today (UTC). Can be done again tomorrow.
   */
  @Post('tasks/:taskId/complete')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Complete a task (milestone or recurring)' })
  async complete(
    @Param('id', ParseUUIDPipe) journeyId: string,
    @Param('taskId', ParseUUIDPipe) taskDefinitionId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const completion = await this.completeTask.execute({
      journeyId,
      taskDefinitionId,
      userId: user.id,
    });
    return {
      id: completion.id,
      taskDefinitionId: completion.taskDefinitionId,
      taskKindSnapshot: completion.taskKindSnapshot,
      forDate: completion.forDate,
      completedAt: completion.completedAt,
    };
  }

  /**
   * DELETE /journeys/:id/tasks/:taskId/complete — Uncomplete (soft-revoke) a task.
   * For recurring tasks, this only revokes today's completion.
   */
  @Delete('tasks/:taskId/complete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Uncomplete a task (soft revoke)' })
  async uncomplete(
    @Param('id', ParseUUIDPipe) journeyId: string,
    @Param('taskId', ParseUUIDPipe) taskDefinitionId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.uncompleteTask.execute({
      journeyId,
      taskDefinitionId,
      userId: user.id,
    });
  }

  /**
   * GET /journeys/:id/progress/me — Get my completion progress for this journey.
   * Used by the frontend Server Component to seed task checkbox state.
   */
  @Get('progress/me')
  @ApiOperation({ summary: 'Get my task completion progress for this journey' })
  async progress(
    @Param('id', ParseUUIDPipe) journeyId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.myProgress.execute(journeyId, user.id);
  }
}
