import { Controller, Get, Res, Req, UseGuards, Post } from '@nestjs/common';
import { Request, Response } from 'express';
import { UserService } from 'src/user/user.service';
import { AuthenticatedGuard, OAuthGuard } from './oauth/oauth.guard';

@Controller('auth')
export class AuthController {
	constructor(private userService: UserService) {}

	@Get('login')
	@UseGuards(OAuthGuard)
	login() {
		return;
	}

	@Get('redirect')
	@UseGuards(OAuthGuard)
	// redirect(@Res() res: Response) {
	redirect(@Res() res: Response, @Req() req: Request) {
		res.redirect('http://localhost:8080/userhome');
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
