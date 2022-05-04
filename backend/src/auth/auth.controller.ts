import { Controller, Post, Body, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import RegisterDto from './dto/register.dto';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}

	@Post('register')
	register(@Body() dto: RegisterDto) {
		console.log({ dto });
		return this.authService.register(dto);
	}
}
