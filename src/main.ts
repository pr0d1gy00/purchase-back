import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ACTIVAR VALIDACIÓN Y TRANSFORMACIÓN GLOBAL
  app.useGlobalPipes(new ValidationPipe({
    transform: true, // Esto es CRUCIAL para que @Type() funcione
    whitelist: true,
  }));
  app.setGlobalPrefix('purchase/api/v1')
  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
