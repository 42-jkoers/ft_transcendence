import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

	const configService = app.get(ConfigService);
	const port = configService.get('PORT') ?? 3000;
	await app.listen(port);
}
bootstrap();
