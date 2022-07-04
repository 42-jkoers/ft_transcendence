import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { OAuthStrategy } from './oauth/oauth.strategy';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/user/user.module';
import { SessionSerializer } from './utils/serializer';
import { PassportModule } from '@nestjs/passport';
import { TwoFactorAuthController } from './two-factor-auth/two-factor-auth.controller';
import { TwoFactorAuthService } from './two-factor-auth/two-factor-auth.service';

@Module({
	imports: [
		HttpModule,
		JwtModule.register({}),
		forwardRef(() => UserModule),
		PassportModule.register({ session: true }),
	],
	providers: [OAuthStrategy, AuthService, SessionSerializer, TwoFactorAuthService],
	controllers: [AuthController, TwoFactorAuthController],
	exports: [AuthService],
})
export class AuthModule {}
