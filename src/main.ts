import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { json } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Important: set raw body ONLY for the Stripe webhook route
  app.use(
    '/payments/webhook', // Must match your controller route
    json({
      verify: (req: any, res, buf: Buffer) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        req.rawBody = buf; // Stripe needs this to verify the signature
      },
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  app.use(cookieParser());
  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
