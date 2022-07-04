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
		private userService: UserService,
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
	}

	@Post('2f')
	@UseGuards(AuthenticatedGuard)
	@HttpCode(200)
	async authentication(
		@Req() req: RequestWithUser,
		@Body() twoFactorAuthCode: TwoFactorAuthCodeDto,
	) {
		if (req.user.isTwoFactorAuthEnabled) {
			const isCodeValid =
				this.twoFactorAuthService.VerifyTwoFactorAuthCode(
					twoFactorAuthCode.twoFactorAuthCode,
					req.user,
				);
			if (!isCodeValid) {
				this.userService.updateTwoFactorAuth(req.user.id, false);
				throw new UnauthorizedException('Wrong authentication code'); //TODO add error page to request reinput of the code later
			} else {
				this.userService.updateTwoFactorAuth(req.user.id, true);
			}
		}
	}

	@Get('status')
	@UseGuards(AuthenticatedGuard)
	async status(@Req() req: RequestWithUser) {
		return req.user;
	}

	@Get('logout')
	@UseGuards(AuthenticatedGuard)
	logout(@Req() req: Request, @Req() request: RequestWithUser) {
		this.userService.updateTwoFactorAuth(request.user.id, false);
		req.logOut();
		return 'User has logged out. Goodbye!';
	}
}
