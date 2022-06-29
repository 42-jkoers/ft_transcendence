import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ChatModule } from './chat/chat.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { PassportModule } from '@nestjs/passport';

@Module({
	imports: [
		UserModule,
		ChatModule,
		AuthModule,
		PassportModule.register({ session: true }),
		ConfigModule.forRoot({ isGlobal: true }),
		DatabaseModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
