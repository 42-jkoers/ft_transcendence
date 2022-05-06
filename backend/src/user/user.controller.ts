import { Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import GetUser from 'src/auth/decorator/get-user.decorator';
import { OAuthGuard } from '../auth/oauth/oauth.guard';
import User from './user.entity';

@UseGuards(OAuthGuard)
@Controller('user')
export class UserController {
	@Get('me')
	getMe(@GetUser() user: User) {
		return user;
	}

	@Patch()
	editUser() {}
}
