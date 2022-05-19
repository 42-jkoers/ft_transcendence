import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { OAuthStrategy } from './oauth/oauth.strategy';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/user/user.module';
import { SessionSerializer } from './utils/serializer';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    HttpModule,
    JwtModule.register({}),
    UserModule,
    PassportModule.register({ session: true }),
  ],
  providers: [
    OAuthStrategy,
    AuthService,
    SessionSerializer,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
