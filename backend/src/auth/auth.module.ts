import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { OAuthStrategy } from './oauth/oauth.strategy';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/user/user.module';
import { SessionSerializer } from './utils/Serializer';

@Module({
  imports: [
    HttpModule,
    JwtModule.register({}),
    UserModule
  ],
  providers: [
    OAuthStrategy,
    AuthService,
    SessionSerializer,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
