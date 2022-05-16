import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';
import * as passport from 'passport';
import * as redis from 'redis';
import * as connectRedis from 'connect-redis';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	
	// general setting
	const configService = app.get(ConfigService);
	app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
	
	// front end
	app.enableCors();
	
	// login sessions
	let RedisStore = connectRedis(session);
	let redisClient = redis.createClient({ url: configService.get('REDIS_URI')});
	redisClient.on('connect', () => console.log('Connected to Redis'));
	app.use(
		session({
			cookie: {
				maxAge: 6000 * 60 * 24,
			},
			secret: configService.get('SESSION_SECRET'),
			resave: false,
			saveUninitialized: false,
			store: new RedisStore({ client: redisClient }),
		}),
	);
	app.use(passport.initialize());
	app.use(passport.session());
	
	// listen to port
	const port = configService.get('PORT') ?? 3000;
	await app.listen(port);
}
bootstrap();
