import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from "express-session";
import * as passport from "passport";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.enableCors();

	app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

	const configService = app.get(ConfigService);

	app.use(
		session({
			cookie: {
				maxAge: 6000 * 60 * 24,
			},
			secret: configService.get('SESSION_SECRET'),
			resave: false,
			saveUninitialized: false,
		}),
	);
	app.use(passport.initialize());
	app.use(passport.session());

	const port = configService.get('PORT') ?? 3000;
	await app.listen(port);
}
bootstrap();
