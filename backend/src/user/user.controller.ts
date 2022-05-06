import { Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { OAuthGuard } from '../auth/oauth/oauth.guard';
import User from './user.entity';

@UseGuards(OAuthGuard)
@Controller('user')
export class UserController {
	@Get('me')
	getMe() {}

	@Patch()
	editUser() {}
}
