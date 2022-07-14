import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import * as CookieParser from 'cookie-parser';
import * as session from 'express-session';
import * as passport from 'passport';
import * as redis from 'redis';
import * as connectRedis from 'connect-redis';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

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

	// login sessions
	const RedisStore = connectRedis(session);
	const redisClient = redis.createClient({
		url: configService.get('REDIS_URI'),
	});
	redisClient.on('connect', () => console.log('Connected to Redis'));
	app.use(
		session({
			cookie: {
				maxAge: 60000 * 60 * 24, // login cookie is 24 hours valid
			},
			secret: configService.get('SESSION_SECRET'),
			resave: false,
			saveUninitialized: false,
			store: new RedisStore({ client: redisClient }),
		}),
	);
	app.use(passport.initialize());
	app.use(passport.session());
	app.useGlobalPipes(new ValidationPipe()); //for validator and transformer
	app.useGlobalInterceptors(
		new ClassSerializerInterceptor(app.get(Reflector)),
	); //for validator and transformer
	app.use(CookieParser());

	//add error handler, to understand where the error is from
	// app.use(require('body-parser').json());
	// app.use(require('body-parser').urlencoded({ extended: true }));

	// app.use((err, req, res, next) => {
	// // This check makes sure this is a JSON parsing issue, but it might be
	// // coming from any middleware, not just body-parser:
	// 	if (err instanceof SyntaxError && 'body' in err) {
	// 		console.error(err);
	// 		return res.sendStatus(400); // Bad request
	// 	}
	// 	next();
	// });

	// listen to port
	const port = configService.get('PORT') ?? 3000;
	await app.listen(port);
}
bootstrap();
