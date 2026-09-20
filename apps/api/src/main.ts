import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { DomainErrorFilter } from './shared-kernel/errors/domain-error.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // Enable CORS so the Next.js frontend (port 3000) can hit this API and
    // establish Socket.io WebSocket connections. Credentials are needed so
    // cookies / Authorization headers pass through correctly.
    cors: {
      origin: process.env.WEB_ORIGIN ?? 'http://localhost:3000',
      credentials: true,
    },
  });


  // Global validation pipe — rejects any request with invalid payload shapes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,         // strip unknown fields (no extra payload sneaking through)
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Map DomainErrors to correct HTTP status codes
  app.useGlobalFilters(new DomainErrorFilter());

  // Swagger (dev/staging only)
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('JERNI API')
      .setDescription('JERNI backend — Journeys, Tasks, Execution, Stats')
      .setVersion('0.1')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`🚀 JERNI API running on http://localhost:${port}`);
}

bootstrap();
