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
import e, { Express } from 'express';
import { UploadFileHelper } from './util/uploadfile.helper';
import { UpdateUserProfileDto } from './dto';
import { FriendDto } from './dto/Friend.dto';
import { EditFriendActionType } from './enum/edit.friend.enum';

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

	@Get('friend-request?')
	async getFriendRequest(@Query('id', ParseIntPipe) id: number) {
		return await this.userService.getFriendRequests(id);
	}

	@Get('friend-list?')
	async getFriendList(@Query('id', ParseIntPipe) id: number) {
		return await this.userService.getFriends(id);
	}

	@Post('edit-friend')
	async editFriend(@Body() dto: FriendDto) {
		// check if both users exist
		const user: UserI | undefined = await this.userService.findByID(
			dto.userId,
		);
		const friend: UserI | undefined = await this.userService.findByID(
			dto.friendId,
		);
		if (!user || !friend) {
			throw new HttpException(
				'User or friend does not exist',
				HttpStatus.BAD_REQUEST,
			);
		}
		// check current friend status between two users
		const isFriend = await this.userService.isFriends(
			dto.userId,
			dto.friendId,
		);
		// if they are friend, the request can only be REMOVE_FRIEND
		if (isFriend) {
			if (dto.action === EditFriendActionType.REMOVE_FRIEND) {
				await this.userService.removeFriend(user, friend);
			} else {
				throw new HttpException(
					'User and requested user is not friend.',
					HttpStatus.BAD_REQUEST,
				);
			}
		} else {
			const isUserBeingRequested = await this.userService.isUserRequested(
				dto.userId,
				dto.friendId,
			);
			// if user has been requested, the user can approve (ADD_FRIEND) or reject (REMOVE_REQUEST)
			if (isUserBeingRequested) {
				if (dto.action === EditFriendActionType.ADD_FRIEND) {
					await this.userService.removeFriendRequest(
						dto.friendId,
						dto.userId,
					);
					await this.userService.addFriend(user, friend);
				} else if (dto.action === EditFriendActionType.REJECT_REQUEST) {
					await this.userService.removeFriendRequest(
						dto.friendId,
						dto.userId,
					);
				} else if (dto.action === EditFriendActionType.REMOVE_FRIEND) {
					throw new HttpException(
						'User has no authorization',
						HttpStatus.BAD_REQUEST,
					);
				}
			}
			// the user can always send a reques, but it will only be processed if request does not exist
			if (dto.action === EditFriendActionType.SEND_REQUEST) {
				const isFriendBeingRequested =
					await this.userService.isUserRequested(
						dto.friendId,
						dto.userId,
					);
				if (!isFriendBeingRequested) {
					await this.userService.addFriendRequest(
						dto.userId,
						dto.friendId,
					);
				}
			}
		}
		return friend.username;
	}
}
