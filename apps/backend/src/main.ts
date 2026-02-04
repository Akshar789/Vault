import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';

/**
 * Bootstrap the Zero-Knowledge Vault API
 * 
 * SECURITY:
 * - Helmet for security headers
 * - CORS with strict origin checking
 * - Global validation pipe
 * - TLS enforcement in production
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  // Security headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    }),
  );

  // CORS configuration
  const corsOrigins = process.env.CORS_ORIGINS?.split(',') || [
    'http://localhost:3000',
  ];

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global prefix
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`
  ╔═══════════════════════════════════════════════════════════╗
  ║                                                           ║
  ║   🔐 Zero-Knowledge Vault API Server                     ║
  ║                                                           ║
  ║   Status: Running                                         ║
  ║   Port: ${port}                                              ║
  ║   Environment: ${process.env.NODE_ENV || 'development'}                                  ║
  ║   API: http://localhost:${port}/api                          ║
  ║                                                           ║
  ║   Security Features:                                      ║
  ║   ✓ Zero-knowledge architecture                          ║
  ║   ✓ Client-side encryption only                          ║
  ║   ✓ Rate limiting enabled                                ║
  ║   ✓ Helmet security headers                              ║
  ║   ✓ CORS protection                                      ║
  ║   ✓ JWT authentication                                   ║
  ║                                                           ║
  ╚═══════════════════════════════════════════════════════════╝
  `);
}

bootstrap();
