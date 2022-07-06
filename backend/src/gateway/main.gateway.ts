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
import { ConnectedUserService } from '../chat/connected-user/connected-user.service';
import { RoomService } from '../chat/room/room.service';
import { MessageI } from '../chat/message/message.interface';
import { MessageService } from '../chat/message/message.service';
import { WsExceptionFilter } from '../exceptions/WsExceptionFilter';
import { UseFilters } from '@nestjs/common';
import { RoomEntity } from 'src/chat/room/entities/room.entity';

import { UserService } from 'src/user/user.service';
import { createRoomDto } from '../chat/room/dto';
import { GameService, tick } from '../game/game.service';
import { PaddleUpdateDto } from 'src/game/game.dto';
import { directMessageDto } from 'src/chat/room/dto/direct.message.room.dto';
import { UserRole } from 'src/chat/room/enums/user.role.enum';
import { AddMessageDto } from 'src/chat/message/dto/add.message.dto';
import { SetRoomRoleDto } from 'src/chat/room/dto/set.room.role.dto';
import { MuteUserDto } from 'src/chat/room/dto/mute.user.dto';
import { RoomVisibilityType } from 'src/chat/room/enums/room.visibility.enum';
import { UserIdDto } from 'src/user/dto';
import { BlockedUsersService } from 'src/user/blocked/blocked.service';
import { RoomAndUserDTO } from 'src/chat/room/dto/room.and.user.dto';

@WebSocketGateway({
	cors: { origin: 'http://localhost:8080', credentials: true },
}) //allows us to make use of any WebSockets library (in our case socket.io)
export class MainGateway implements OnGatewayConnection, OnGatewayDisconnect {
	constructor(
		private readonly authService: AuthService,
		private readonly roomService: RoomService,
		private readonly connectedUserService: ConnectedUserService,
		private readonly messageService: MessageService,
		private readonly userService: UserService,
		private readonly blockedUsersService: BlockedUsersService,
		private readonly gameService: GameService,
	) {
		// console.log('constructor');
		setInterval(() => {
			for (const update of tick()) {
				this.server.in(update.socketRoomID).emit('gameFrame', update);
			}
		}, 1000 / 60); // TODO: something better than this, handling server lag
	}
	@WebSocketServer() server: Server; //gives access to the server instance to use for triggering events
	private logger: Logger = new Logger('ChatGateway');

	async handleConnection(client: Socket) {
		this.logger.log('Client connected');
		let user: UserI = await this.authService.getUserFromCookie(
			client.handshake.headers.cookie,
		);
		if (user) {
			user = await this.userService.increaseSocketCount(user.id);
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

		await this.connectedUserService.createConnectedUser({
			socketID: client.id,
			user,
		}); // save connection to DB
		client.emit('clientConnected'); // this event needed to prevent rendering frontend components before connection is set
	}

	async handleDisconnect(client: Socket) {
		const userId = client.data?.user?.id;
		if (userId) {
			const user = await this.userService.findByID(userId);
			if (user) {
				await this.userService.decreaseSocketCount(client.data.user.id);
			}
		}
		this.connectedUserService.deleteBySocketId(client.id);
		client.disconnect(); //manually disconnects the socket
		this.logger.log('Client disconnected');
	}

	@SubscribeMessage('addMessage') //allows to listen to incoming messages
	async handleMessage(client: Socket, addMessageDto: AddMessageDto) {
		const selectedRoom: RoomEntity = await this.roomService.findRoomByName(
			addMessageDto.room.name,
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

	@SubscribeMessage('getMessagesForRoom')
	async getMessagesForRoom(socket: Socket, roomName: string) {
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
				roomName,
			))
		) {
			socket.emit('noPermissionToViewContent');
			return;
		}
		const response: MessageI[] =
			await this.messageService.findMessagesForRoom(roomName);
		socket.emit('getMessagesForRoom', response);
	}

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
	@SubscribeMessage('createPrivateChatRoom')
	async handleCreatePrivateChatRoom(
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
		const createdDMRoom = await this.roomService.createPrivateChatRoom(
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
	@SubscribeMessage('setNewUserRole')
	async handleSetNewUserRole(socket: Socket, setRoleDto: SetRoomRoleDto) {
		const room: RoomEntity = await this.roomService.findRoomByName(
			setRoleDto.roomName,
		);
		const user = await this.userService.findByID(
			setRoleDto.userToGetNewRoleId,
		);
		// getting username to notify the admin that setNewUserRole either failed or succedded
		const username: string = user.username;
		if (!room) {
			socket.emit('setUserRoleFail', setRoleDto.newRole, username);
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
				socket.emit('setUserRoleFail', setRoleDto.newRole, username);
				return;
			}
			const roomsList = await this.roomService.getPublicRoomsList(
				setRoleDto.userToGetNewRoleId,
			);
			this.server
				.to(setRoleDto.userToGetNewRoleId.toString())
				.emit('postPublicRoomsList', roomsList);
		}
		socket.emit('userRoleChanged', setRoleDto.newRole, username);
	}

	@SubscribeMessage('updateRoomPassword')
	async updateRoomPassword(
		@ConnectedSocket() client: Socket,
		@MessageBody() roomToUpdate: { name: string; password: string },
	) {
		const room: RoomEntity = await this.roomService.findRoomByName(
			roomToUpdate.name,
		);
		await this.roomService.updateRoomPassword(room, roomToUpdate.password);
		await this.handleGetPublicRoomsList(client);
	}

	@SubscribeMessage('addUserToRoom')
	async handleAddUserToRoom(
		@MessageBody() roomName: string,
		@ConnectedSocket() socket: Socket,
	) {
		const room: RoomEntity = await this.roomService.findRoomByName(
			roomName,
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

	@SubscribeMessage('removeUserFromRoom')
	async handleRemoveUserFromRoom(
		@MessageBody() roomName: string,
		@ConnectedSocket() socket: Socket,
	) {
		const room: RoomEntity = await this.roomService.findRoomByName(
			roomName,
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
				this.server.sockets.emit('room deleted', roomName); // emitting to all the users that have public room in their list(they are not in the room themselves)
			} else {
				socket.emit('room deleted', roomName);
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

	@SubscribeMessage('muteUserInRoom')
	async muteUserInRoom(
		@MessageBody() muteUser: MuteUserDto,
		@ConnectedSocket() client: Socket,
	) {
		const user: UserI = await this.userService.findByID(
			client.data.user.id,
		);
		if (!user) console.log('exception'); //TODO throw exception
		await this.roomService.muteUserInRoom(muteUser, client.data.user.id);
	}

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
			socket.emit('banUserResult', undefined);
		}
		await this.roomService.banUserFromRoom(
			user.id,
			room,
			socket.data.user.id,
		);

		// response will be either with blocked user data or undefined if the user is already in the blocked list

		const sockets = await this.server.in(user.id.toString()).fetchSockets(); //fetches all connected sockets for this specific user
		for (const socket of sockets) {
			socket.leave(room.name);
		}
		//update roomslist for the banned user:
		const roomsList = await this.roomService.getPublicRoomsList(user.id);
		this.server
			.to(user.id.toString())
			.emit('postPublicRoomsList', roomsList);
		this.server.to(user.id.toString()).emit('bannedFromRoom', room.name);
		socket.emit('userRoleChanged', UserRole.BANNED, user.username); // event-confirmation emitted to the owner/admin
	}

	@SubscribeMessage('unBanUserFromRoom')
	async unBanUserFromRoom(
		@MessageBody() roomAndUser: RoomAndUserDTO,
		@ConnectedSocket() socket: Socket,
	) {
		const user: UserI = await this.userService.findByID(
			socket.data.user.id,
		);
		if (!user) console.log('exception'); //TODO throw exception
		await this.roomService.unBanUserFromRoom(
			roomAndUser,
			socket.data.user.id,
		);
		const roomsList = await this.roomService.getPublicRoomsList(user.id);
		this.server
			.to(user.id.toString())
			.emit('postPublicRoomsList', roomsList);
	}

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

	@SubscribeMessage('checkRoomPasswordMatch')
	async checkRoomPasswordMatch(
		client: Socket,
		roomToUnlock: { name: string; password: string },
	) {
		const room: RoomEntity = await this.roomService.findRoomByName(
			roomToUnlock.name,
		);
		const isMatched = await this.roomService.compareRoomPassword(
			roomToUnlock.password,
			room.password,
		);
		client.emit('isRoomPasswordMatched', isMatched);
	}

	@SubscribeMessage('getOneRoomWithUserToRoomRelations')
	async getOneRoomWithUserToRoomRelations(client: Socket, roomName: string) {
		const room: RoomEntity =
			await this.roomService.getSpecificRoomWithUserToRoomRelations(
				roomName,
			);
		client.emit('getOneRoomWithUserToRoomRelations', room);
	}

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

	@SubscribeMessage('userAddsAnotherUserToRoom')
	async userAddsAnotherUserToRoom(
		@MessageBody() info: { userId: number; roomName: string },
	) {
		const room: RoomEntity = await this.roomService.findRoomByName(
			info.roomName,
		);
		const user: UserI = await this.userService.findByID(info.userId);
		await this.roomService.addUserToRoom(user.id, room, UserRole.VISITOR);
		const sockets = await this.server.in(user.id.toString()).fetchSockets(); //fetches all connected sockets for this specific user
		for (const socket of sockets) {
			socket.join(room.name); //joins each socket of the added user to this room
			await this.handleGetPublicRoomsList(socket); //to refresh rooms in added users page
		}
	}

	async sendGameList() {
		const gameList = await this.gameService.getGameList();
		this.server.emit('getGameList', gameList);
	}

	// @UseFilters(new WsExceptionFilter())
	// @UsePipes(new ValidationPipe({ transform: true }))
	// @SubscribeMessage('createGame')
	// async createGame(
	// 	@MessageBody() game: CreateGameDto,
	// 	@ConnectedSocket() client: Socket,
	// ) {
	// 	await this.gameService.createGame(game, client.data.user);
	// 	await this.sendGameList();
	// }

	@SubscribeMessage('getGameList')
	async getGameList() {
		await this.sendGameList();
	}

	@SubscribeMessage('getUserProfile')
	async getUser(
		@MessageBody() id: number,
		@ConnectedSocket() client: Socket,
	) {
		const user = await this.userService.getUserByID(id);
		client.emit('getUserProfile', user);
	}

	@SubscribeMessage('sendGameInvite')
	async sendGameInvite(
		@MessageBody() receiverId: number,
		@ConnectedSocket() client: Socket,
	) {
		const sender = await this.userService.getUserByID(client.data.user.id);
		const receiver = await this.userService.getUserByID(receiverId);
		// TODO: check error (if user doesn't exist);
		await this.gameService.addGameInvite(sender, receiver);
		// TODO: to emit to receiver's update list?
	}

	@SubscribeMessage('getReceivedGameInvites')
	async getReceivedGameInvites(
		@MessageBody() userId: number,
		@ConnectedSocket() client: Socket,
	) {
		const response = await this.gameService.getReceivedGameInvites(userId);
		client.emit('getReceivedGameInvites', response);
	}

	@SubscribeMessage('removeGameInvite')
	async removeGameInvite(
		@MessageBody() senderId: number,
		@ConnectedSocket() client: Socket,
	) {
		const sender = await this.userService.getUserByID(senderId);
		const receiver = await this.userService.getUserByID(
			client.data.user.id,
		);
		if (!sender || !receiver) {
			client.emit('errorGameInvite', 'User does not exist.');
		} else {
			const updateInviteList = await this.gameService.removeGameInvite(
				sender,
				receiver,
			);
			client.emit('getReceivedGameInvites', updateInviteList);
		}
	}

	@SubscribeMessage('acceptGameInvite')
	async acceptGameInvite(
		@MessageBody() senderId: number,
		@ConnectedSocket() client: Socket,
	) {
		const sender = await this.userService.getUserByID(senderId);
		const receiver = await this.userService.getUserByID(
			client.data.user.id,
		);
		// step 1: to check if any user is already in a game
		if (!sender || !receiver) {
			client.emit('errorGameInvite', 'User does not exist.');
		} else if (sender.isGaming || receiver.isGaming) {
			client.emit('errorGameInvite', 'User is already in a game.');
		} else {
			// step 2: create game
			const createdGame = await this.gameService.createGame(
				sender,
				receiver,
			);
			// step 3: refresh WatchGame list (for all clients)
			await this.sendGameList();
			// step 4: refresh Invite list (for current client)
			const updateInviteList =
				await this.gameService.getReceivedGameInvites(receiver.id);
			client.emit('getReceivedGameInvites', updateInviteList);
			// step 5: notify current user to start game
			client.emit('startGame', createdGame.id);
			// step 6: notify the other user game is ready
			this.server
				.to(senderId.toString())
				.emit('readyToStartGame', receiver.username, createdGame.id);
		}
	}

	// TODO: ValidationPipe
	@SubscribeMessage('getGame')
	async getGame(client: Socket, id: number) {
		const game = this.gameService.findInPlayByID(id);
		if (!game) return;
		client.emit('getGame', game);
		client.join(game.socketRoomID); // TODO: remove from room afterwards
		console.log('getGame', id, game.socketRoomID);
	}

	// @SubscribeMessage('getUserType')
	// async getUserType(client: Socket, id: string) {
	// 	const type = await this.gameService.getUserType(
	// 		id,
	// 		client.data.user.id,
	// 	);
	// 	client.emit('getUserType', type);
	// }

	// @UseFilters(new WsExceptionFilter())
	// @UsePipes(new ValidationPipe({ transform: true }))
	@SubscribeMessage('paddleUpdate')
	async paddleUpdate(socket: Socket, pos: PaddleUpdateDto) {
		await this.gameService.playerUpdate(socket.data.user.id, pos);
	}
}
