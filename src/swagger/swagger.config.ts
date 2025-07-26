import {
  SwaggerModule as NestSwaggerModule,
  DocumentBuilder,
} from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export class SwaggerConfig {
  static setup(app: INestApplication) {
    const config = new DocumentBuilder()
      .setTitle('UsersCenter')
      .setDescription('用户中心API')
      .setVersion('1.0')
      // .setBasePath('v1') 已移除，因为NestJS现在会自动填充全局前缀
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'access-token',
      )
      .addCookieAuth(
        'refresh_token',
        {
          type: 'apiKey',
          in: 'cookie',
          name: 'refresh_token',
        },
        'refresh-token',
      )
      .build();

    const documentFactory = () => NestSwaggerModule.createDocument(app, config);
    NestSwaggerModule.setup('api', app, documentFactory);
  }
}
