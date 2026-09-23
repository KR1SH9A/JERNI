import { Controller, Get } from '@nestjs/common';
import { Public } from './contexts/identity/infrastructure/decorators/public.decorator';

@Controller('health')
export class AppController {
  @Public()
  @Get()
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: '@jerni/api',
    };
  }
}
