import { Logger, UsePipes, ValidationPipe } from '@nestjs/common';
import {
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { UserI } from 'src/user/user.interface';
import { AuthService } from '../auth/auth.service';
import { RoomService } from '../chat/room/room.service';
import { MessageI } from '../chat/message/message.interface';
import { MessageService } from '../chat/message/message.service';
import { WsExceptionFilter } from '../exceptions/WsExceptionFilter';
import { UseFilters } from '@nestjs/common';
import { RoomEntity } from 'src/chat/room/entities/room.entity';

import { UserService } from 'src/user/user.service';
import { createRoomDto } from '../chat/room/dto';
import { GameService } from '../game/game.service';
import { GameStatus, PaddleUpdateDto } from 'src/game/game.dto';
import { directMessageDto } from 'src/chat/room/dto/direct.message.room.dto';
import { UserRole } from 'src/chat/room/enums/user.role.enum';
import { AddMessageDto } from 'src/chat/message/dto/add.message.dto';
import { SetRoomRoleDto } from 'src/chat/room/dto/set.room.role.dto';
import { MuteUserDto } from 'src/chat/room/dto/mute.user.dto';
import { RoomVisibilityType } from 'src/chat/room/enums/room.visibility.enum';
import { UserIdDto } from 'src/user/dto';
import { BlockedUsersService } from 'src/user/blocked/blocked.service';
import { RoomAndUserDTO } from 'src/chat/room/dto/room.and.user.dto';
import { PlayerGameStatusType } from 'src/game/playergamestatus.enum';
import { GameEntity } from 'src/game/game.entity';
import { FriendService } from 'src/user/friend/friend.service';
import { IntegerDto } from './util/integer.dto';
import { RoomPasswordDto } from 'src/chat/room/dto/room.password.dto';

async function gameLoop(server: Server, gameService: GameService) {
	const games = await gameService.tick();
	for (const game of games) {
		const frame = game.getFrame();

		if (
			game.status == GameStatus.PLAYING ||
			game.status == GameStatus.COMPLETED
		)
			server.in(frame.socketRoomID).emit('gameFrame', frame);

		if (game.status == GameStatus.COMPLETED) {
			// step 1: inform players & watchers game is finished
			server
				.in(game.socketRoomID)
				.emit('gameFinished', game.getWinnerID());
			// step 2: remove game from database, change player game status
			gameService.endGame(game.id);
			// step 3: remove players/watchers from game socket room
			const sockets = await server.in(game.socketRoomID).fetchSockets();
			for (const socket of sockets) {
				socket.leave(game.socketRoomID);
			}
		}

		// send update game list to all connected socket
		const gameList = await gameService.getGameList();
		server.emit('getGameList', gameList);
	}
}

@WebSocketGateway({
	cors: { origin: 'http://localhost:8080', credentials: true },
}) //allows us to make use of any WebSockets library (in our case socket.io)
export class MainGateway implements OnGatewayConnection, OnGatewayDisconnect {
	constructor(
		private readonly authService: AuthService,
		private readonly roomService: RoomService,
		private readonly messageService: MessageService,
		private readonly userService: UserService,
		private readonly blockedUsersService: BlockedUsersService,
		private readonly gameService: GameService,
		private readonly friendService: FriendService,
	) {
		setInterval(() => gameLoop(this.server, this.gameService), 1000 / 60); // TODO: something better than this, handling server lag
	}
	@WebSocketServer() server: Server; //gives access to the server instance to use for triggering events
	private logger: Logger = new Logger('ChatGateway');

	async handleConnection(client: Socket) {
		this.logger.log('Client connected');
		const user: UserI = await this.authService.getUserFromCookie(
			client.handshake.headers.cookie,
		);
		if (user) {
			console.log(user);
			const roomEntities: RoomEntity[] =
				await this.roomService.getRoomsForUser(user.id); //TODO get only room names from room service
			roomEntities.forEach((room) => {
				client.join(room.name);
			}); //each new socket connection joins the room that the user is already a part of
			client.join(user.id.toString()); //all clients join a unique room called by their ids. this is needed to fetch all sockets of that user
		} else {
			console.log('user not authorized.\n'); //FIXME throw an exception
		}
		client.data.user = user;

		client.emit('clientConnected'); // this event needed to prevent rendering frontend components before connection is set
	}

	async handleDisconnect(client: Socket) {
		client.disconnect(); //manually disconnects the socket
		this.logger.log('Client disconnected');
	}

	// if user logs out from one window, all other window will be logged out immediately
	@SubscribeMessage('exitUserSocketRoom')
	async exitUserSocketRoom(socket: Socket) {
		const socketRoom = socket.data.user.id.toString();
		const sockets = await this.server.in(socketRoom).fetchSockets();
		for (const socket_iterator of sockets) {
			if (socket_iterator.id !== socket.id) {
				socket_iterator.emit('logOutFromAnotherSocket');
			}
			socket_iterator.leave(socketRoom);
		}
	}

	/***** Retrieving rooms list events  *****/

	@SubscribeMessage('getPublicRoomsList')
	async handleGetPublicRoomsList(socket) {
		if (!socket.data.user) {
			// if requests were not on time to get user info
			const user: UserI = await this.authService.getUserFromCookie(
				socket.handshake.headers.cookie,
			);
			socket.data.user = user;
		}

		const roomsList = await this.roomService.getPublicRoomsList(
			socket.data.user.id,
		);
		socket.emit('postPublicRoomsList', roomsList);
	}

	@UsePipes(new ValidationPipe({ transform: true }))
	@SubscribeMessage('getOneRoomWithUserToRoomRelations')
	async getOneRoomWithUserToRoomRelations(
		client: Socket,
		dataDto: RoomAndUserDTO,
	) {
		const room: RoomEntity =
			await this.roomService.getSpecificRoomWithUserToRoomRelations(
				dataDto.roomName,
			);
		client.emit('getOneRoomWithUserToRoomRelations', room);
	}

	/***** Messages events  *****/

	@UsePipes(new ValidationPipe({ transform: true }))
	@SubscribeMessage('addMessage') //allows to listen to incoming messages
	async handleMessage(client: Socket, addMessageDto: AddMessageDto) {
		const selectedRoom: RoomEntity = await this.roomService.findRoomByName(
			addMessageDto.roomName,
		);
		const user: UserI = await this.userService.findByID(
			client.data.user.id,
		);
		const isNotMutedOrDeadlinePassed =
			await this.roomService.checkIfMutedAndMuteDeadlineAndRemoveMute(
				user.id,
				selectedRoom.name,
			);
		if (selectedRoom.isDirectMessage) {
			const secondParticipant =
				await this.roomService.getSecondUserInDMRoom(
					client.data.user.id,
					selectedRoom.id,
				);
			if (
				await this.blockedUsersService.isDirectMessagingBlocked(
					client.data.user.id,
					secondParticipant?.id,
				)
			) {
				this.server.emit('NoPermissionToAddMessage');
				return;
			}
		}
		if (isNotMutedOrDeadlinePassed) {
			//saves msg and emits to frontend if not muted
			const message: MessageI = {
				text: addMessageDto.text,
				user: undefined,
				room: undefined,
				created_at: undefined,
				updated_at: undefined,
			};
			const createdMessage: MessageI = await this.messageService.create(
				message,
				user,
				selectedRoom,
			);
			this.server
				.to(selectedRoom.name)
				.emit('messageAdded', createdMessage); //server socket emits to all clients
		}
	}

	@UsePipes(new ValidationPipe({ transform: true }))
	@SubscribeMessage('getMessagesForRoom')
	async getMessagesForRoom(socket: Socket, dataDto: RoomAndUserDTO) {
		if (!socket.data.user) {
			// if requests were not on time to get user info
			const user: UserI = await this.authService.getUserFromCookie(
				socket.handshake.headers.cookie,
			);
			socket.data.user = user;
		}
		if (
			!(await this.roomService.isUserAllowedToViewContent(
				socket.data.user.id,
				dataDto.roomName,
			))
		) {
			socket.emit('noPermissionToViewContent');
			return;
		}
		const response: MessageI[] =
			await this.messageService.findMessagesForRoom(dataDto.roomName);
		// if (response)
		socket.emit('getMessagesForRoom', response); // adding check for the case the passed from the client roomName is invalid and messages are not found
	}

	/***** Retrieving users list event  *****/

	@UsePipes(new ValidationPipe({ transform: true }))
	@SubscribeMessage('getAllRegisteredUsersExceptYourselfAndAdmin')
	async getAllRegisteredUsersExceptYourselfAndAdmin(client: Socket) {
		const user: UserI = await this.userService.findByID(
			client.data.user.id,
		);
		const response: UserI[] =
			await this.userService.getAllRegisteredUsersExceptYourselfAndAdmin(
				user.username,
			);
		client.emit('getAllRegisteredUsersExceptYourselfAndAdmin', response);
	}

	/***** Create room events  *****/

	@UseFilters(new WsExceptionFilter())
	//ValidationPipe provides a convenient approach to enforce validation rules for all incoming client payloads,
	// where the specific rules are declared with simple annotations in local class/DTO declarations in each module.
	@UsePipes(new ValidationPipe({ transform: true })) // transform can automatically transform JS object payloads to be objects typed according to their DTO classes.
	@SubscribeMessage('createRoom')
	async handleCreateRoom(
		@MessageBody() room: createRoomDto,
		@ConnectedSocket() client: Socket,
	) {
		const response: { status: string; data: string } =
			await this.roomService.createRoom(room, client.data.user.id);
		client.emit('createRoom', response);
		client.join(response.data);
	}

	@UsePipes(new ValidationPipe({ transform: true }))
	@SubscribeMessage('createDirectMessageRoom')
	async handleCreateDirectMessageRoom(
		@MessageBody() dMRoom: directMessageDto,
		@ConnectedSocket() socket: Socket,
	) {
		if (
			await this.blockedUsersService.isDirectMessagingBlocked(
				socket.data.user.id,
				dMRoom.userIds[0],
			)
		) {
			const user = await this.userService.findByID(dMRoom.userIds[0]);
			socket.emit('CannotSendDirectMessage', {
				id: user.id,
				username: user.username,
			});
			return;
		}
		const createdDMRoom = await this.roomService.createDirectMessageRoom(
			dMRoom,
			socket.data.user.id,
		);
		socket.emit('postPrivateChatRoom', createdDMRoom);
		// fetching sockets of both users inside the private room
		const secondUserId = dMRoom.userIds[0];
		const sockets = await this.server
			.in(socket.data.user.id.toString())
			.in(secondUserId.toString())
			.fetchSockets();
		for (const socket of sockets) {
			socket.join(createdDMRoom.name);
		}
		// both users in the room will have their roomlists updated:
		const roomsList = await this.roomService.getPublicRoomsList(
			secondUserId,
		);
		this.server
			.to(secondUserId.toString())
			.emit('postPublicRoomsList', roomsList);
		await this.handleGetPublicRoomsList(socket);
	}

	/***** Set a user role events  *****/

	@UsePipes(new ValidationPipe({ transform: true }))
	@SubscribeMessage('setNewUserRole')
	async handleSetNewUserRole(socket: Socket, setRoleDto: SetRoomRoleDto) {
		const room: RoomEntity = await this.roomService.findRoomByName(
			setRoleDto.roomName,
		);
		const user = await this.userService.findByID(
			setRoleDto.userToGetNewRoleId,
		);
		// getting username to notify the admin that setNewUserRole either failed or succedded
		if (!user || !room) {
			socket.emit(
				'setUserRoleFail',
				setRoleDto.newRole,
				setRoleDto.roomName,
			);
			return;
		}
		if (
			await this.roomService.IsUserEligibleToSetRole(
				socket.data.user.id,
				room.id,
				setRoleDto.newRole,
			)
		) {
			const userRoleUpdateResult = await this.roomService.setUserRole(
				setRoleDto.userToGetNewRoleId,
				room.id,
				setRoleDto.newRole,
			);

			if (!userRoleUpdateResult) {
				socket.emit(
					'setUserRoleFail',
					setRoleDto.newRole,
					setRoleDto.roomName,
				);
				return;
			}
			const roomsList = await this.roomService.getPublicRoomsList(
				setRoleDto.userToGetNewRoleId,
			);
			this.server
				.to(setRoleDto.userToGetNewRoleId.toString())
				.emit('postPublicRoomsList', roomsList);
		}
		socket.emit(
			'userRoleChanged',
			setRoleDto.newRole,
			user.username,
			room.name,
		);
	}

	/***** Adding to/removing from room events  *****/

	@UsePipes(new ValidationPipe({ transform: true }))
	@SubscribeMessage('addUserToRoom')
	async handleAddUserToRoom(
		@MessageBody() dataDto: RoomAndUserDTO,
		@ConnectedSocket() socket: Socket,
	) {
		const room: RoomEntity = await this.roomService.findRoomByName(
			dataDto.roomName,
		);
		if (
			await this.roomService.isUserBannedFromRoom(
				socket.data.user.id,
				room,
			)
		) {
			socket.emit('noPermissionToViewContent');
			return;
		}
		await this.roomService.addUserToRoom(
			socket.data.user.id,
			room,
			UserRole.VISITOR,
		);
		socket.join(room.name);
		await this.handleGetPublicRoomsList(socket);
	}

	@UsePipes(new ValidationPipe({ transform: true }))
	@SubscribeMessage('removeUserFromRoom')
	async handleRemoveUserFromRoom(
		@MessageBody() dataDto: RoomAndUserDTO,
		@ConnectedSocket() socket: Socket,
	) {
		const room: RoomEntity = await this.roomService.findRoomByName(
			dataDto.roomName,
		);
		const userToRemove = await this.roomService.findUserToRoomRelationship(
			socket.data.user.id,
			room.id,
		);
		if (!userToRemove) {
			return;
		}
		let potentialNewOwner;
		// // if the leaving user is the owner of the room his the ownership will be reassigned to a room admin
		if ((userToRemove.role = UserRole.OWNER)) {
			const admin = await this.roomService.setAdminAsOwner(room);
			potentialNewOwner = admin;
		}
		await this.roomService.deleteUserRoomRelationship(
			userToRemove.userId,
			room,
		);
		const userLeftInRoom = await this.roomService.getOneUserLeftInRoom(
			room,
		);
		// if the room is empty
		if (!userLeftInRoom) {
			await this.roomService.deleteRoom(room);
			if (room.visibility === RoomVisibilityType.PUBLIC) {
				this.server.sockets.emit('room deleted', dataDto.roomName); // emitting to all the users that have public room in their list(they are not in the room themselves)
			} else {
				socket.emit('room deleted', dataDto.roomName);
			}
		} else {
			// if the owner has left the room and no admin has been found the random user in list will be assigned as a room owner
			if (userToRemove.role === UserRole.OWNER && !potentialNewOwner) {
				await this.roomService.setUserRole(
					userLeftInRoom.userId,
					room.id,
					UserRole.OWNER,
				);
			}
			await this.handleGetPublicRoomsList(socket);
		}
	}

	@UsePipes(new ValidationPipe({ transform: true }))
	@SubscribeMessage('userAddsAnotherUserToRoom')
	async userAddsAnotherUserToRoom(@MessageBody() dataDto: RoomAndUserDTO) {
		const room: RoomEntity = await this.roomService.findRoomByName(
			dataDto.roomName,
		);
		const user: UserI = await this.userService.findByID(dataDto.userId);
		await this.roomService.addUserToRoom(user.id, room, UserRole.VISITOR);
		const sockets = await this.server.in(user.id.toString()).fetchSockets(); //fetches all connected sockets for this specific user
		for (const socket of sockets) {
			socket.join(room.name); //joins each socket of the added user to this room
			await this.handleGetPublicRoomsList(socket); //to refresh rooms in added users page
		}
	}

	/***** Muting events  *****/

	@UsePipes(new ValidationPipe({ transform: true }))
	@SubscribeMessage('muteUserInRoom')
	async muteUserInRoom(
		@MessageBody() muteUser: MuteUserDto,
		@ConnectedSocket() socket: Socket,
	) {
		if (!socket.data.user) {
			// if requests were not on time to get user info
			const user: UserI = await this.authService.getUserFromCookie(
				socket.handshake.headers.cookie,
			);
			socket.data.user = user;
		}
		const userToBeMuted: UserI = await this.userService.findByID(
			muteUser.id,
		);
		const room = await this.roomService.findRoomByName(muteUser.roomName);
		if (!userToBeMuted || !room) {
			socket.emit('setUserRoleFail', UserRole.MUTED, muteUser.roomName);
		}
		await this.roomService.muteUserInRoom(
			userToBeMuted.id,
			room.name,
			muteUser.durationMinute,
			socket.data.user.id,
		);
		// event-notification emitted to the muted user:
		this.server
			.to(userToBeMuted.id.toString())
			.emit('newRoleAcquired', UserRole.MUTED, room.name);
		// event-confirmation emitted to the owner/admin:
		socket.emit(
			'userRoleChanged',
			UserRole.MUTED,
			userToBeMuted.username,
			room.name,
		);
	}

	/***** Blocking(user won't be able to send DM) events  *****/

	@UsePipes(new ValidationPipe({ transform: true }))
	@SubscribeMessage('getBlockedList')
	async handleGetBlockedUsersList(@ConnectedSocket() socket: Socket) {
		const blockedUsers = await this.blockedUsersService.getBlockedUsersList(
			socket.data.user.id,
		);
		socket.emit('postBlockedList', blockedUsers);
	}

	@UsePipes(new ValidationPipe({ transform: true }))
	@SubscribeMessage('blockUser')
	async handleblockUser(
		@MessageBody() userToBlockIdDto: UserIdDto,
		@ConnectedSocket() socket: Socket,
	) {
		if (!socket.data.user) {
			// if requests were not on time to get user info
			const user: UserI = await this.authService.getUserFromCookie(
				socket.handshake.headers.cookie,
			);
			socket.data.user = user;
		}

		const userToBlock: UserI = await this.userService.findByID(
			userToBlockIdDto.id,
		);
		if (!userToBlock) {
			socket.emit('blockUserResult', undefined);
		}

		const response = await this.blockedUsersService.blockUser(
			userToBlock,
			socket.data.user,
		);
		const directMessageRoom =
			await this.unsubscribeUsersFromDirectMessageRoom(
				userToBlockIdDto.id,
				socket.data.user.id,
			);
		// if a user is blocked after dm room has been created it will live but users' roles will be reset for better UX
		// if it hasn't been created before this step is skipped
		if (directMessageRoom) {
			await this.roomService.setUserRole(
				userToBlock.id,
				directMessageRoom.id,
				UserRole.BLOCKED,
			);
			await this.roomService.setUserRole(
				socket.data.user.id,
				directMessageRoom.id,
				UserRole.BLOCKING,
			);
		}
		// response will be either with blocked user data or undefined if the user is already in the blocked list
		socket.emit('blockUserResult', response);
		await this.handleGetPublicRoomsList(socket);
	}

	@UsePipes(new ValidationPipe({ transform: true }))
	@SubscribeMessage('unblockUser')
	async handleUnblock(
		@MessageBody() userDto: UserIdDto,
		@ConnectedSocket() socket: Socket,
	) {
		const userToUnblock: UserI = await this.userService.findByID(
			userDto.id,
		);
		if (!userToUnblock) {
			socket.emit('unblockUserResult', undefined);
		}
		const response = await this.blockedUsersService.unblockUser(
			userToUnblock,
			socket.data.user,
		);
		if (response) {
			this.handleGetBlockedUsersList(socket);
			const directMessageRoom =
				await this.subscribeUsersToDirectMessageRoom(
					userDto.id,
					socket.data.user.id,
				);
			if (directMessageRoom) {
				await this.roomService.setUserRole(
					userToUnblock.id,
					directMessageRoom.id,
					UserRole.VISITOR,
				);
				await this.roomService.setUserRole(
					socket.data.user.id,
					directMessageRoom.id,
					UserRole.VISITOR,
				);
			}
			socket.emit('unblockUserResult', response);
		}
	}

	async unsubscribeUsersFromDirectMessageRoom(
		user1Id: number,
		user2Id: number,
	) {
		const dmRoom = await this.roomService.findDMRoom(user1Id, user2Id);
		if (dmRoom) {
			this.server.socketsLeave(dmRoom.name);
		}
		return dmRoom;
	}

	async subscribeUsersToDirectMessageRoom(
		user1Id: number,
		user2Id: number,
	): Promise<RoomEntity> {
		const dmRoom = await this.roomService.findDMRoom(user1Id, user2Id);
		if (dmRoom) {
			// sockets that are subscribed th the channels having their id name will also subscribe to the new roomname
			this.server
				.in(user1Id.toString())
				.in(user2Id.toString())
				.socketsJoin(dmRoom.name);
		}
		return dmRoom;
	}

	/***** Ban/Unban events  *****/
	@UsePipes(new ValidationPipe({ transform: true }))
	@SubscribeMessage('banUserFromRoom')
	async banUserFromRoom(
		@MessageBody() roomAndUser: RoomAndUserDTO,
		@ConnectedSocket() socket: Socket,
	) {
		const user: UserI = await this.userService.findByID(roomAndUser.userId);
		const room = await this.roomService.findRoomByName(
			roomAndUser.roomName,
		);
		if (!user || !room) {
			socket.emit(
				'setUserRoleFail',
				UserRole.BANNED,
				roomAndUser.roomName,
			);
		}
		await this.roomService.banUserFromRoom(
			user.id,
			room,
			socket.data.user.id,
		);
		const sockets = await this.server.in(user.id.toString()).fetchSockets(); //fetches all connected sockets for this specific user
		for (const socket of sockets) {
			socket.leave(room.name);
		}
		//update roomslist for the banned user:
		const roomsList = await this.roomService.getPublicRoomsList(user.id);
		this.server
			.to(user.id.toString())
			.emit('postPublicRoomsList', roomsList);
		// event-notification emitted to the banned user:
		this.server
			.to(user.id.toString())
			.emit('newRoleAcquired', UserRole.BANNED, room.name);
		// event-confirmation emitted to the owner/admin:
		socket.emit(
			'userRoleChanged',
			UserRole.BANNED,
			user.username,
			room.name,
		);
	}

	@UsePipes(new ValidationPipe({ transform: true }))
	@SubscribeMessage('unBanUserFromRoom')
	async unBanUserFromRoom(
		@MessageBody() roomAndUser: RoomAndUserDTO,
		@ConnectedSocket() socket: Socket,
	) {
		const user: UserI = await this.userService.findByID(roomAndUser.userId);
		const room = await this.roomService.findRoomByName(
			roomAndUser.roomName,
		);

		if (!user || !room)
			socket.emit(
				'setUserRoleFail',
				UserRole.VISITOR,
				roomAndUser.roomName,
			);
		await this.roomService.unBanUserFromRoom(
			user.id,
			room,
			socket.data.user.id,
		);
		const roomsList = await this.roomService.getPublicRoomsList(user.id);
		this.server
			.to(user.id.toString())
			.emit('postPublicRoomsList', roomsList);
		this.server.in(user.id.toString()).socketsJoin(room.name);
		socket.emit(
			'userRoleChanged',
			UserRole.VISITOR,
			user.username,
			room.name,
		); // event-confirmation emitted to the owner/admin
	}

	@UsePipes(new ValidationPipe({ transform: true }))
	@SubscribeMessage('isUserBanned')
	async isUserBanned(
		@MessageBody() roomAndUser: RoomAndUserDTO,
		@ConnectedSocket() client: Socket,
	) {
		const room = await this.roomService.findRoomByName(
			roomAndUser.roomName,
		);
		const isBanned = await this.roomService.isUserBannedFromRoom(
			roomAndUser.userId,
			room,
		);
		client.emit('userBanFromRoomResult', isBanned);
	}

	/***** Password events  *****/

	@UsePipes(new ValidationPipe({ transform: true }))
	@SubscribeMessage('checkRoomPasswordMatch')
	async checkRoomPasswordMatch(
		client: Socket,
		roomPasswordDto: RoomPasswordDto,
	) {
		const room: RoomEntity = await this.roomService.findRoomByName(
			roomPasswordDto.roomName,
		);
		const isMatched = await this.roomService.compareRoomPassword(
			roomPasswordDto.password,
			room.password,
		);
		client.emit('isRoomPasswordMatched', isMatched);
	}

	@UsePipes(new ValidationPipe({ transform: true }))
	@SubscribeMessage('updateRoomPassword')
	async updateRoomPassword(
		@ConnectedSocket() client: Socket,
		@MessageBody() roomToUpdateDto: RoomPasswordDto,
	) {
		const room: RoomEntity = await this.roomService.findRoomByName(
			roomToUpdateDto.roomName,
		);
		await this.roomService.updateRoomPassword(
			room,
			roomToUpdateDto.password,
		);
		await this.handleGetPublicRoomsList(client);
	}

	async broadcastGameList() {
		const gameList = await this.gameService.getGameList();
		this.server.emit('getGameList', gameList);
	}

	@SubscribeMessage('getGameList')
	async getGameList(@ConnectedSocket() client: Socket) {
		const gameList = await this.gameService.getGameList();
		client.emit('getGameList', gameList);
	}

	@UsePipes(new ValidationPipe({ transform: true }))
	@SubscribeMessage('getUserProfile')
	async getUser(
		@MessageBody() id: IntegerDto,
		@ConnectedSocket() client: Socket,
	) {
		const user = await this.userService.getUserByID(id.data);
		if (!user) {
			client.emit('errorGetUserProfile', 'User does not exist.');
		} else {
			const isFriend = await this.friendService.isFriends(
				id.data,
				client.data.user.id,
			);
			client.emit('getUserProfile', user, isFriend);
		}
	}

	@UsePipes(new ValidationPipe({ transform: true }))
	@SubscribeMessage('getUserConnectedSocketCount')
	async getUserConnectedSocketCount(
		@MessageBody() id: IntegerDto,
		@ConnectedSocket() client: Socket,
	) {
		const isSafe: boolean =
			id.data === client.data.user.id
				? true
				: await this.friendService.isFriends(
						id.data,
						client.data.user.id,
				  );
		const socketCount = (
			await this.server.in(id.data.toString()).fetchSockets()
		).length;
		client.emit('getUserConnectedSocketCount', socketCount, isSafe);
	}

	@UsePipes(new ValidationPipe({ transform: true }))
	@SubscribeMessage('sendGameInvite')
	async sendGameInvite(
		@MessageBody() receiverId: IntegerDto,
		@ConnectedSocket() client: Socket,
	) {
		const sender = await this.userService.getUserByID(client.data.user.id);
		const receiver = await this.userService.getUserByID(receiverId.data);
		if (!sender || !receiver) {
			client.emit('errorGameInvite', 'User does not exist.');
		} else {
			await this.gameService.addGameInvite(sender, receiver);
			const updatedInviteList =
				await this.gameService.getReceivedGameInvites(receiverId.data);
			this.server
				.to(receiverId.data.toString())
				.emit('getReceivedGameInvites', updatedInviteList);
		}
	}

	@UsePipes(new ValidationPipe({ transform: true }))
	@SubscribeMessage('getReceivedGameInvites')
	async getReceivedGameInvites(
		@MessageBody() userId: IntegerDto,
		@ConnectedSocket() client: Socket,
	) {
		const response = await this.gameService.getReceivedGameInvites(
			userId.data,
		);
		client.emit('getReceivedGameInvites', response);
	}

	@UsePipes(new ValidationPipe({ transform: true }))
	@SubscribeMessage('removeGameInvite')
	async removeGameInvite(
		@MessageBody() senderId: IntegerDto,
		@ConnectedSocket() client: Socket,
	) {
		const sender = await this.userService.getUserByID(senderId.data);
		const receiver = await this.userService.getUserByID(
			client.data.user.id,
		);
		if (!sender || !receiver) {
			client.emit('errorGameInvite', 'User does not exist.');
		} else {
			await this.gameService.removeGameInvite(sender, receiver);
			const updatedInviteList =
				await this.gameService.getReceivedGameInvites(
					client.data.user.id,
				);
			this.server
				.to(client.data.user.id.toString())
				.emit('getReceivedGameInvites', updatedInviteList);
		}
	}

	async createGame(user1Id: number, user2Id: number): Promise<GameEntity> {
		const user1 = await this.userService.getUserByID(user1Id);
		const user2 = await this.userService.getUserByID(user2Id);
		// step 1: to check if any user is already in a game
		if (!user1 || !user2) {
			throw new Error('User does not exist.');
		} else if (
			user1.gameStatus === PlayerGameStatusType.PLAYING ||
			user2.gameStatus === PlayerGameStatusType.PLAYING
		) {
			throw new Error('User is already in a game.');
		} else {
			// step 2: create game
			const createdGame = await this.gameService.createGame(user1, user2);
			// step 3: refresh WatchGame list (for all clients)
			await this.broadcastGameList();
			return createdGame;
		}
	}

	@UsePipes(new ValidationPipe({ transform: true }))
	@SubscribeMessage('acceptGameInvite')
	async acceptGameInvite(
		@MessageBody() senderId: IntegerDto,
		@ConnectedSocket() client: Socket,
	) {
		this.removeGameInvite(senderId, client);
		const sender = await this.userService.getUserByID(senderId.data);
		if (sender.gameStatus === PlayerGameStatusType.PLAYING) {
			client.emit(
				'errorMatchMaking',
				'The other player is already in a game.',
			);
		} else {
			this.server
				.to(senderId.data.toString())
				.emit(
					'matchGameInvite',
					client.data.user.id,
					client.data.user.username,
				);
		}
	}

	@UsePipes(new ValidationPipe({ transform: true }))
	@SubscribeMessage('matchGameInviteSuccess')
	async matchGameInviteSuccess(
		@MessageBody() receiverId: IntegerDto,
		@ConnectedSocket() client: Socket,
	) {
		try {
			// step 1: create game
			const createdGame = await this.createGame(
				client.data.user.id,
				receiverId.data,
			);
			// step 2: refresh Invite list (for receiver)
			const updateInviteList =
				await this.gameService.getReceivedGameInvites(receiverId.data);
			this.server
				.to(receiverId.data.toString())
				.emit('getReceivedGameInvites', updateInviteList);
			// step 3: notify the both user game is ready
			this.server
				.to(receiverId.data.toString())
				.to(client.data.user.id.toString())
				.emit('startGame', createdGame.id);
		} catch (error) {
			client.emit('errorMatchMaking', error.message);
		}
	}

	@UsePipes(new ValidationPipe({ transform: true }))
	@SubscribeMessage('matchGameInviteFail')
	async matchGameInviteFail(@MessageBody() receiverId: IntegerDto) {
		this.server
			.to(receiverId.data.toString())
			.emit('errorMatchMaking', 'The other player quit the game.');
	}

	@UsePipes(new ValidationPipe({ transform: true }))
	@SubscribeMessage('getGame')
	async getGame(client: Socket, id: IntegerDto) {
		const game = this.gameService.findInPlayByID(id.data);
		if (!game) return;
		client.emit('getGame', game.getInPlay());
		client.join(game.socketRoomID);
		console.log('getGame', id.data, game.socketRoomID);
	}

	// @SubscribeMessage('getUserType')
	// async getUserType(client: Socket, id: string) {
	// 	const type = await this.gameService.getUserType(
	// 		id,
	// 		client.data.user.id,
	// 	);
	// 	client.emit('getUserType', type);
	// }

	// TODO: to uncomment the valiadation?
	// @UseFilters(new WsExceptionFilter())
	// @UsePipes(new ValidationPipe({ transform: true }))
	@SubscribeMessage('paddleUpdate')
	async paddleUpdate(socket: Socket, pos: PaddleUpdateDto) {
		await this.gameService.playerUpdate(socket.data.user.id, pos);
	}

	@SubscribeMessage('quitQueue')
	async quitQueue(client: Socket) {
		const user = await this.userService.getUserByID(client.data.user.id);
		switch (user.gameStatus) {
			case PlayerGameStatusType.IDLE:
				client.emit('errorMatchMaking', 'User is not in queue.');
				return;
			case PlayerGameStatusType.QUEUE:
				await this.gameService.quitQueue(user.id);
				return;
			case PlayerGameStatusType.PLAYING:
				client.emit('errorMatchMaking', 'User is already in a game.');
				return;
		}
	}

	@SubscribeMessage('matchPlayer')
	async matchPlayer(client: Socket) {
		// if user is already in queue
		const user = await this.userService.getUserByID(client.data.user.id);
		if (user.gameStatus === PlayerGameStatusType.QUEUE) {
			return;
		}
		// if user is not in quee
		const queue = await this.gameService.getGameQueue();
		if (queue.length === 0) {
			// if no one is waiting, user will join the queue
			await this.gameService.joinQueue(client.data.user.id);
		} else {
			// if there is already someone waiting, pick the first player in queue
			const component = queue[0];
			try {
				// step 1: create game
				const createdGame = await this.createGame(
					client.data.user.id,
					component.id,
				);
				// step 2: notify current user in waiting room
				client.emit('startGame', createdGame.id);
				// step 5: notify the other user in waiting room
				this.server
					.to(component.id.toString())
					.emit('startGame', createdGame.id);
			} catch (error) {
				client.emit('errorMatchMaking', error.message);
			}
		}
	}
}
