import {
	Controller,
	Req,
	Post,
	Body,
	UseGuards,
	UseInterceptors,
	UploadedFile,
} from '@nestjs/common';
import { AuthenticatedGuard } from '../auth/oauth/oauth.guard';
import { UserI } from './user.interface';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Request, Express } from 'express';

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

	@Post('avatar')
	@UseInterceptors(
		FileInterceptor('image', {
			storage: diskStorage({
				destination: './uploadedFiles/avatars',
			}),
		}),
	)
	async uploadAvatar(
		@Req() req: Request,
		@UploadedFile() file: Express.Multer.File,
	) {
		console.log('>> user: ', req.user);
		console.log('>> file: ', file);
	}
}
