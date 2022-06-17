import {
	Controller,
	Get,
	Post,
	Body,
	Res,
	UseGuards,
	UseInterceptors,
	UploadedFile,
	Query,
	ParseIntPipe,
	HttpStatus,
	HttpException,
} from '@nestjs/common';
import { AuthenticatedGuard } from '../auth/oauth/oauth.guard';
import { UserI } from './user.interface';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Express, Response } from 'express';
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
		return await this.userService.getReceivedFriendRequests(id);
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
		if (dto.action === EditFriendActionType.REMOVE_FRIEND) {
			if (isFriend) {
				await this.userService.removeFriend(user, friend);
			} else {
				throw new HttpException(
					'User and requested user are not friends.',
					HttpStatus.UNAUTHORIZED,
				);
			}
		} else {
			if (isFriend) {
				throw new HttpException(
					'User and requested user are already friends.',
					HttpStatus.UNAUTHORIZED,
				);
			} else {
				// check current request status between two users
				const isUserReceivedRequest =
					await this.userService.isUserRequested(
						dto.userId,
						dto.friendId,
					);
				const isUserSendRequest =
					await this.userService.isUserRequested(
						dto.friendId,
						dto.userId,
					);
				if (dto.action === EditFriendActionType.SEND_REQUEST) {
					if (isUserSendRequest) {
						throw new HttpException(
							'Request has already sent by this user.',
							HttpStatus.BAD_REQUEST,
						);
					} else if (isUserReceivedRequest) {
						throw new HttpException(
							'Request has arealdy been sent by the other user.',
							HttpStatus.BAD_REQUEST,
						);
					} else {
						await this.userService.addFriendRequest(user, friend);
					}
				} else {
					if (isUserReceivedRequest) {
						// for either ADD_FRIEND or REJECT_REQUEST, need to remove request
						await this.userService.removeFriendRequest(
							friend,
							user,
						);
						if (dto.action === EditFriendActionType.ADD_FRIEND) {
							await this.userService.addFriend(user, friend);
						}
					} else {
						throw new HttpException(
							'User is not authorization',
							HttpStatus.UNAUTHORIZED,
						);
					}
				}
			}
		}
	}
}
