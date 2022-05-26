import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthenticatedGuard } from '../auth/oauth/oauth.guard';
import { UserI } from './user.interface';
import { UserService } from './user.service';

@UseGuards(AuthenticatedGuard)
@Controller('user')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Post('profile/update-userprofile')
	async updateUserProfile(
		@Body() body: { id: number; username: string; avatar: string },
	) {
		if (
			!(await this.userService.updateUserProfile(
				body.id,
				body.username,
				body.avatar,
			))
		) {
			return undefined;
		} else {
			const user: UserI = await this.userService.findByID(body.id);
			return user;
		}
	}
}
