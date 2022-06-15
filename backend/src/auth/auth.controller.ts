import { Body, Controller, Get, Res, Req, UseGuards, Post, UnauthorizedException, HttpCode } from '@nestjs/common';
import { Request, Response } from 'express';
import { UserService } from 'src/user/user.service';
import { AuthenticatedGuard, OAuthGuard } from './oauth/oauth.guard';
import { TwoFactorAuthService } from './two-factor-auth/two-factor-auth.service';
import { RequestWithUser } from './interface/requestWithUser.interface';
import { TwoFactorAuthCodeDto } from './dto/twoFactorAuthCode.dto';
import { request } from 'http';

@Controller('auth')
export class AuthController {
	constructor(
		private userService: UserService,//TODO should be readonly? @Aileen
		private readonly twoFactorAuthService: TwoFactorAuthService
	) {}

	@Get('login')
	@UseGuards(OAuthGuard)
	login() {
		return;
	}

	@Get('redirect')//TODO @Aileen, how does this redirect work in the login flow. is it possible to change to POST? 
	@UseGuards(OAuthGuard)
	redirect(@Res() res: Response) {
		// console.log('cookies in redirect',res.cookie);
		res.redirect('http://localhost:8080/userhome');
	}

	//TODO cookies are not captured
	//TODO build a frontend to test
	@Post('2f')
	@UseGuards(AuthenticatedGuard)
	@HttpCode(200)//TODO double check the return code if still valid
	async authentication(
		@Req() req: RequestWithUser,//TODO why can only be RWU instead of Request
		@Res({passthrough: true}) res: Response,
		@Body() { twoFactorAuthCode }: TwoFactorAuthCodeDto
	){
		if(req.user.isTwoFactorAuthEnabled) {
			const isCodeValid = await this.twoFactorAuthService.VerifyTwoFactorAuthCode(twoFactorAuthCode, req.user);
			if(!isCodeValid)
				throw new UnauthorizedException('Wrong authentication code'); //TODO add error page to request reinput of the code later
		}
		// return 'hello hello';//This need to be replaced by
		// res.redirect('http://localhost:8080/userhome'); //however need to re-login via 42 @Aileen
		res.redirect('redirect');
	}


	@Get('status')
	@UseGuards(AuthenticatedGuard)
	status(@Req() req: Request) {
		return req.user;
	}

	@Get('logout')
	@UseGuards(AuthenticatedGuard)
	logout(@Req() req: Request) {
		req.logOut();
		return 'User has logged out. Goodbye!';
	}
}
