import { Controller, Get, Post, Body, Res, Req, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { UserI } from 'src/user/user.interface';
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

	@Post('register')
	@UseGuards(AuthenticatedGuard)
	async register(@Body() body: { id: number, username: string, avatar: string}) {
		await this.userService.updateUserName(body.id, body.username);
		await this.userService.updateAvatar(body.id, body.avatar);
		const user: UserI = await this.userService.findByID(body.id);
		return user;
	}

	@Get('logout')
	@UseGuards(AuthenticatedGuard)
	logout(@Req() req: Request) {
		req.logOut();
		return "User has logged out. Goodbye!";
	}
}
