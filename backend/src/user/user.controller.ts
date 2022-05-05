import { Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import GetUser from 'src/auth/decorator/get-user.decorator';
import JwtGuard from '../auth/guard/jwt.guard';
import User from './user.entity';

@UseGuards(JwtGuard)
@Controller('user')
export class UserController {
	@Get('me')
	getMe(@GetUser() user: User) {
		return user;
	}

	@Patch()
	editUser() {}
}
