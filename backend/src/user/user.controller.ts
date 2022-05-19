import { Controller, Get, Post, Body, Patch, Req, UseGuards } from '@nestjs/common';
import { AuthenticatedGuard } from '../auth/oauth/oauth.guard';
import { UserI } from './user.interface';
import { UserService } from './user.service';

@UseGuards(AuthenticatedGuard)
@Controller('user')
export class UserController {
	constructor(
		private readonly userService: UserService,
	) {}
	@Get('me')
	getMe() {}

	@Post('profile/update-username')
	async updateUserName(
		@Body() body: { id: number, username: string},
	) {
		if (!await this.userService.updateUserName(body.id, body.username)) {
			return undefined;
		}
		else {
			const user: UserI = await this.userService.findByID(body.id);
			return user;
		}
	}

	@Post('profile/update-avatar')
	async updateAvatar(
		@Body() body: { id: number, avatar: string},
	) {
		if (!await this.userService.updateAvatar(body.id, body.avatar)) {
			return undefined;
		}
		else {
			const user: UserI = await this.userService.findByID(body.id);
			return user;
		}
	}


	@Patch()
	editUser() {}
}
