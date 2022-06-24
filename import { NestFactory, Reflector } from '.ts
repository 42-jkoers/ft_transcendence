import { NestFactory, Reflector } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, INestApplication } from '@nestjs/common';
import * as session from 'express-session';
import * as passport from 'passport';
import { TypeORMSession } from './orm/entities/session.entity';
import { getRepository } from 'typeorm';
import { TypeormStore } from 'connect-typeorm';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AchievementService } from './achievements/achievements.service';

// Swagger = automatic API documentation
async function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Ping Pong')
    .setDescription('Ping Pong API')
    .setVersion('1.0')
    .addTag('Pong')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
}

// Session for authorization, staying logged in
async function setupSession(app: INestApplication) {
  const sessionRepository = getRepository(TypeORMSession);
  const configService = app.get(ConfigService);
  app.use(
    session({
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        sameSite: 'strict',
      },
      name: configService.get('cookie.NAME'),
      secret: configService.get('cookie.SECRET'),
      resave: false,
      rolling: true,
      saveUninitialized: false, // Only save the session if the user is logged in
      store: new TypeormStore().connect(sessionRepository), // session store
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());
}

async function seed(app: INestApplication) {
  const achievementService = app.get(AchievementService);
  await achievementService.seedDatabase();
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await setupSwagger(app);
  await setupSession(app);
  app.enableCors(); // For frontend API connection
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  await seed(app);
  await app.listen(3000);
}
bootstrap();
