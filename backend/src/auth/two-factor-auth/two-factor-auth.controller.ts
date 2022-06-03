import { ClassSerializerInterceptor, Controller, Get, Injectable, Post, Req, Res, UseGuards, UseInterceptors } from '@nestjs/common';
import { Request } from 'express';
import { UserService } from 'src/user/user.service';
import { RequestWithUser } from '../interface/requestWithUser.interface';
import { TwoFactorAuthService } from './two-factor-auth.service';
import { AuthenticatedGuard } from '../oauth/oauth.guard';

@Controller('two-factor-auth')
// @UseInterceptors(ClassSerializerInterceptor)
// @Injectable()
export class TwoFactorAuthController {
	constructor(
		private readonly twoFactorAuthenticationService: TwoFactorAuthService,
		private readonly usersService: UserService
	) {}

	// @Post('generate')
	@Get('generate')
	@UseGuards(AuthenticatedGuard)
	//which guard should I use. if not JwtAuthenticationGuard
	async register(@Res() response: Response, @Req() request: RequestWithUser) {//TODO in tutorial, it is an interface of RequestWithUser, why?
		const { otpauthUrl } = await this.twoFactorAuthenticationService.generateTwoFactorAuthSecret(request.user);
		return this.twoFactorAuthenticationService.pipeQrCodeStream(response, otpauthUrl);
	}
	
}
