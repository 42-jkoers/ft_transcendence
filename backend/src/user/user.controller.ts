import {
	Controller,
	Get,
	Post,
	Body,
	UseGuards,
	UseInterceptors,
	UploadedFile,
	Query,
	ParseIntPipe,
	HttpException,
	HttpStatus,
} from '@nestjs/common';
import { AuthenticatedGuard } from '../auth/oauth/oauth.guard';
import { UserI } from './user.interface';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Express } from 'express';
import { UploadFileHelper } from './util/uploadfile.helper';
import { UpdateUserProfileDto } from './dto';
import { FriendDto } from './dto/Friend.dto';
import { EditFriend } from './enum/edit.friend.enum';

@UseGuards(AuthenticatedGuard)
@Controller('user')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Post('profile/update-userprofile')
	async updateUserProfile(@Body() userDto: UpdateUserProfileDto) {
		if (!(await this.userService.updateUserProfile(userDto))) {
			return undefined;
		} else {
			const user: UserI = await this.userService.findByID(userDto.id);
			return user;
		}
	}

	@Post('avatar')
	@UseInterceptors(
		FileInterceptor('file', {
			storage: diskStorage({
				destination: '../upload',
				filename: UploadFileHelper.customFileName,
			}),
		}),
	)
	async uploadAvatar(@UploadedFile() file: Express.Multer.File) {
		return file.filename;
	}

	@Get('find-by-id?')
	async findUser(@Query('id', ParseIntPipe) id: number) {
		const user: UserI = await this.userService.findByID(id);
		return user;
	}

	@Get('is-friend?')
	async isFriend(
		@Query('id1', ParseIntPipe) id1: number,
		@Query('id2', ParseIntPipe) id2: number,
	) {
		return await this.userService.isFriends(id1, id2);
	}

	@Post('edit-friend')
	async editFriend(@Body() friendDto: FriendDto) {
		const user: UserI | undefined = await this.userService.findByID(
			friendDto.userId,
		);
		const friend: UserI | undefined = await this.userService.findByID(
			friendDto.friendId,
		);
		if (!user || !friend) {
			throw new HttpException(
				'User or friend does not exist',
				HttpStatus.BAD_REQUEST,
			);
		}
		console.log('edit-friend request: ', friendDto);
		console.log('user: ', user.id, ' | friend: ', friend.id);
		if (friendDto.action === EditFriend.REMOVE_FRIEND) {
			await this.userService.removeFriend(user, friend);
		} else if (friendDto.action === EditFriend.ADD_FRIEND) {
			await this.userService.removeFriendRequest(friend, user);
			await this.userService.removeFriendRequest(user, friend); // prevent duplicate request from the other side
			await this.userService.addFriend(user, friend);
		} else {
			await this.userService.removeFriendRequest(friend, user);
			await this.userService.removeFriendRequest(user, friend); // prevent duplicate request from the other side
		}
		return friend.username;
	}
}
