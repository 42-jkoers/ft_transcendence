import { Controller, Post, Body, ParseIntPipe, HttpCode, HttpStatus, Get, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import LoginDto from './dto/login.dto';
import RegisterDto from './dto/register.dto';
import { OAuthGuard } from './oauth/oauth.guard';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}

	@Post('register')
	register(@Body() dto: RegisterDto) {
		return this.authService.register(dto);
	}

	@Post('login')
	@HttpCode(HttpStatus.OK)
	login_origin(@Body() dto: LoginDto) {
		return this.authService.login(dto);
	}

	@Get('login')
	@UseGuards(OAuthGuard)
	login() {
		return;
	}

	@Get('redirect')
	redirect(@Res() res: Response) {
		res.sendStatus(200);
	}

	@Get('status')
	status() {}

	@Get('logout')
	logout() {}
}
