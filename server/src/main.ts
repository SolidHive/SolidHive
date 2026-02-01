import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as session from 'express-session';
import * as passport from 'passport';
import * as crypto from 'crypto';
import helmet from 'helmet';
import { RedisStore } from 'connect-redis';
import { createClient } from 'redis';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Servir les fichiers statiques du dossier uploads (avant les autres middlewares)
  console.log('Setting up static files for uploads at:', join(process.cwd(), 'uploads'));
  app.use(
    '/uploads',
    (req, res, next) => {
      console.log('Request to /uploads:', req.path);
      next();
    },
    express.static(join(process.cwd(), 'uploads'))
  );

  // 2. Protection des en-têtes HTTP
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https:'],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:', 'http:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'", 'https:', 'data:'],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'self'"],
        },
      },
    })
  );

  // 2. Validation des entrées améliorée
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: false,
      },
    })
  );

  // 3. Génération sécurisée du nom de cookie
  const cookieName = `ca_sid_${crypto.createHash('sha256').update('solidhive-salt').digest('hex').substring(0, 8)}`;

  // Vérification de la variable d'environnement SESSION_SECRET
  if (!process.env.SESSION_SECRET) {
    console.error("ATTENTION: La variable SESSION_SECRET n'est pas définie");
    process.exit(1);
  }

  // 5. Configuration Redis pour les sessions
  const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    password: process.env.REDIS_PASSWORD,
  });

  redisClient.on('error', (err) => console.error('Redis Client Error', err));
  await redisClient.connect();

  const redisStore = new RedisStore({
    client: redisClient,
    prefix: 'solidhive:sess:',
    ttl: 3600, // 1 heure en secondes
  });

  // 6. Configuration de session sécurisée avec Redis
  app.use(
    session({
      store: redisStore,
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      name: cookieName,
      cookie: {
        maxAge: 3600000, // 1 heure en millisecondes
        secure: process.env.COOKIE_SECURE === 'true', // Utiliser HTTPS en production
        httpOnly: true,
        sameSite: process.env.COOKIE_SECURE === 'true' ? 'none' : 'lax', // 'none' requis pour HTTPS cross-origin
      },
    })
  );

  // 7. Configuration de Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // 8. Configuration CORS sécurisée
  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // 9. Configuration Swagger
  const config = new DocumentBuilder()
    .setTitle('solidhive API')
    .setDescription('The solidhive API documentation')
    .setVersion('1.0')
    .addCookieAuth(cookieName, {
      type: 'apiKey',
      in: 'cookie',
      name: cookieName,
      description: 'Session cookie for authentication',
    })
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);

  console.log(`Application démarrée sur le port ${process.env.PORT ?? 3000}`);
}

void bootstrap();
