import { Controller, Post, Body, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import LoginDto from './dto/login.dto';
import RegisterDto from './dto/register.dto';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}

	@Post('register')
	register(@Body() dto: RegisterDto) {
		return this.authService.register(dto);
	}

	@Post('login')
	@HttpCode(HttpStatus.OK)
	login(@Body() dto: LoginDto) {
		return this.authService.login(dto);
	}
}
