import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerConfig } from './swagger/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  // 设置全局路由前缀
  app.setGlobalPrefix('v1');
  
  // 允许来自 http://localhost:3000 的请求
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true, // 允许发送 Cookie
  });

  // 设置Swagger文档
  SwaggerConfig.setup(app);
  await app.listen(8001);
}
bootstrap();
