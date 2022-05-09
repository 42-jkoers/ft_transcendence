import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { OAuthStrategy } from './oauth/oauth.strategy';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [HttpModule, JwtModule.register({})],
  providers: [
    OAuthStrategy,
    AuthService,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
