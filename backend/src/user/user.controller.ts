import { Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { AuthenticatedGuard } from '../auth/oauth/oauth.guard';

@UseGuards(AuthenticatedGuard)
@Controller('user')
export class UserController {
	@Get('me')
	getMe() {}

	@Patch()
	editUser() {}
}
