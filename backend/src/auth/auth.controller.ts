import { Controller, Post, Body, ParseIntPipe, HttpCode, HttpStatus, Get, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import RegisterDto from './dto/register.dto';
import { OAuthGuard } from './oauth/oauth.guard';

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
	redirect(@Res() res: Response) {
		res.sendStatus(200);
	}

	@Get('status')
	status() {}

	@Get('logout')
	logout() {}
}
