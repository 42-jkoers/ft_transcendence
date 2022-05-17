import { Controller, Get, Res, Req, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { UserI } from 'src/user/user.interface';
import { AuthService } from './auth.service';
import { AuthenticatedGuard, OAuthGuard } from './oauth/oauth.guard';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}

	@Get('login')
	@UseGuards(OAuthGuard)
	login() {
		return;
	}

	@Get('redirect')
	@UseGuards(OAuthGuard)
	redirect(@Req() req: Request, @Res() res: Response) {
		const user: UserI = req.user;
		if (user.username) {
			res.redirect("http://localhost:8080");
		}
		else {
			res.redirect("http://localhost:8080/register");
		}
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
		return "User has logged out. Goodbye!";
	}
}
