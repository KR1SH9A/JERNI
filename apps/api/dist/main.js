"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const domain_error_filter_1 = require("./shared-kernel/errors/domain-error.filter");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    // Global validation pipe — rejects any request with invalid payload shapes
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true, // strip unknown fields (no extra payload sneaking through)
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    // Map DomainErrors to correct HTTP status codes
    app.useGlobalFilters(new domain_error_filter_1.DomainErrorFilter());
    // Swagger (dev/staging only)
    if (process.env.NODE_ENV !== 'production') {
        const config = new swagger_1.DocumentBuilder()
            .setTitle('JERNI API')
            .setDescription('JERNI backend — Journeys, Tasks, Execution, Stats')
            .setVersion('0.1')
            .addBearerAuth()
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup('api/docs', app, document);
    }
    const port = process.env.PORT ?? 3001;
    await app.listen(port);
    console.log(`🚀 JERNI API running on http://localhost:${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map