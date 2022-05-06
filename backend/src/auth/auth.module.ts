import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { OAuthStrategy } from './oauth/oauth.strategy';

@Module({
  imports: [UserModule, JwtModule.register({})],
  providers: [AuthService, OAuthStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
