import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as session from 'express-session';
import * as passport from 'passport';
import * as crypto from 'crypto';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Protection des en-têtes HTTP
  app.use(helmet());

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

  // 4. Configuration de session sécurisée
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      name: cookieName,
      cookie: {
        maxAge: 3600000, // 1 heure en millisecondes
        secure: process.env.COOKIE_SECURE === 'true', // Utiliser HTTPS en production
        httpOnly: true,
        sameSite: 'lax',
      },
    })
  );

  // 5. Configuration de Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // 6. Configuration CORS sécurisée
  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // 7. Configuration Swagger
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
