import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

import { AppModule } from './app.module';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe);
  const port: number = +process.env.PORT || 3000;
  await app.listen(port, () => {
    console.log('Hola estamos en el puerto:',port);
    
  });
}
bootstrap();
