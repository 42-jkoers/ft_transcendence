import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';
import * as passport from 'passport';


async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const sessionRepository = getRepository(TypeORMSession);

	// general setting
	const configService = app.get(ConfigService);
	app.useGlobalPipes(
		new ValidationPipe({
			transform: true, // automatically transform payloads to be objects typed according to their DTO classes
		}),
	);

	// to enable session cookie pass to frontend (authenticate user)
	app.enableCors({
		origin: ['http://localhost:8080'],
		credentials: true,
		exposedHeaders: ['set-cookie'],
	});

	app.use(
		session({
			cookie: {
				maxAge: 6000 * 60 * 24, // login cookie is 24 hours valid
			},
			secret: configService.get('SESSION_SECRET'),
			resave: false,
			saveUninitialized: false,
			// store: new RedisStore({ client: redisClient }),
		}),
	);
	app.use(passport.initialize());
	app.use(passport.session());

	// listen to port
	const port = configService.get('PORT') ?? 3000;
	await app.listen(port);
}
bootstrap();
