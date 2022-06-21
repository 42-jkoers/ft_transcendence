import {
	Controller,
	Get,
	Post,
	Body,
	UseGuards,
	Query,
	ParseIntPipe,
	HttpStatus,
	HttpException,
} from '@nestjs/common';
import { AuthenticatedGuard } from '../../auth/oauth/oauth.guard';
import { UserI } from '../user.interface';
import { UserService } from '../user.service';
import { FriendDto } from './dto/Friend.dto';
import { EditFriendActionType } from './edit.friend.enum';
import { FriendService } from './friend.service';

@UseGuards(AuthenticatedGuard)
@Controller('friend')
export class FriendController {
	constructor(
		private readonly friendService: FriendService,
		private readonly userService: UserService,
	) {}

	@Get('is-friend?')
	async isFriend(
		@Query('id1', ParseIntPipe) id1: number,
		@Query('id2', ParseIntPipe) id2: number,
	) {
		return await this.friendService.isFriends(id1, id2);
	}

	@Get('friend-request?')
	async getFriendRequest(@Query('id', ParseIntPipe) id: number) {
		return await this.friendService.getReceivedFriendRequests(id);
	}

	@Get('friend-list?')
	async getFriendList(@Query('id', ParseIntPipe) id: number) {
		return await this.friendService.getFriends(id);
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
		const isFriend = await this.friendService.isFriends(
			dto.userId,
			dto.friendId,
		);
		if (dto.action === EditFriendActionType.REMOVE_FRIEND) {
			if (isFriend) {
				await this.friendService.removeFriend(user, friend);
				await this.friendService.removeFriend(friend, user);
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
					await this.friendService.isUserRequested(
						dto.userId,
						dto.friendId,
					);
				const isUserSendRequest =
					await this.friendService.isUserRequested(
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
						await this.friendService.addFriendRequest(user, friend);
					}
				} else {
					if (isUserReceivedRequest) {
						// for either ADD_FRIEND or REJECT_REQUEST, need to remove request
						await this.friendService.removeFriendRequest(
							friend,
							user,
						);
						if (dto.action === EditFriendActionType.ADD_FRIEND) {
							await this.friendService.addFriend(user, friend);
							await this.friendService.addFriend(friend, user);
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
