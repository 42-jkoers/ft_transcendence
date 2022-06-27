import {
	Body,
	Controller,
	Get,
	Res,
	Req,
	UseGuards,
	Post,
	UnauthorizedException,
	HttpCode,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { UserService } from 'src/user/user.service';
import { AuthenticatedGuard, OAuthGuard } from './oauth/oauth.guard';
import { TwoFactorAuthService } from './two-factor-auth/two-factor-auth.service';
import { RequestWithUser } from './interface/requestWithUser.interface';
import { TwoFactorAuthCodeDto } from './dto/twoFactorAuthCode.dto';
import { HttpService } from '@nestjs/axios';

@Controller('auth')
export class AuthController {
	constructor(
		private userService: UserService, //TODO should be readonly? @Aileen
		private readonly twoFactorAuthService: TwoFactorAuthService,
		private readonly httpService: HttpService,
	) {}

	@Get('login')
	@UseGuards(OAuthGuard)
	login() {
		return;
	}

	@Get('redirect')
	@UseGuards(OAuthGuard)
	redirect(@Res() res: Response, @Req() req: RequestWithUser) {
		if (req.user.isTwoFactorAuthEnabled === true) {
			res.redirect('http://localhost:8080/2fAuthenticate');
		} else res.redirect('http://localhost:8080/userhome');
		// res.redirect('http://localhost:8080/userhome');
	}

	//TODO why this route is not entered? I checked the return value of the Auth guard, it is true.. @Aileen
	@Post('2f')
	@UseGuards(AuthenticatedGuard)
	@HttpCode(200) //TODO double check the return code if still valid
	async authentication(
		@Req() req: RequestWithUser, //TODO why can only be RWU instead of Request
		@Body() twoFactorAuthCode: TwoFactorAuthCodeDto,
		// @Res() res: Response,
	) {
		console.log('check!!!');
		console.log('input validation code is', twoFactorAuthCode);
		if (req.user.isTwoFactorAuthEnabled) {
			const isCodeValid =
				this.twoFactorAuthService.VerifyTwoFactorAuthCode(
					twoFactorAuthCode.twoFactorAuthCode,
					req.user,
				);
			if (!isCodeValid) {
				// console.log('input code is', twoFactorAuthCode);
				// console.log('the code is invalid');
				// res.redirect('http://localhost:8080/2fAuthenticate');
				throw new UnauthorizedException('Wrong authentication code'); //TODO add error page to request reinput of the code later
			}
		}
	}

	@Get('status')
	@UseGuards(AuthenticatedGuard)
	async status(@Req() req: RequestWithUser) {
		// if (req.user.isTwoFactorAuthEnabled === true) {
		// 	await this.httpService.get('http://localhost:8080/2fAuthenticate', {
		// 		withCredentials: true,
		// 	});
		// }
		return req.user;
	}

	@Get('logout')
	@UseGuards(AuthenticatedGuard)
	logout(@Req() req: Request) {
		req.logOut();
		return 'User has logged out. Goodbye!';
	}
}
