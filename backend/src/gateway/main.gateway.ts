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
import { directMessageDto } from 'src/chat/room/dto/direct.message.room.dto';
import { UserRole } from 'src/chat/room/enums/user.role.enum';
import { AddMessageDto } from 'src/chat/message/dto/add.message.dto';
import { GameService } from '../game/game.service';
import { CreateGameDto } from 'src/game/game.dto';
import { SetRoomRoleDto } from 'src/chat/room/dto/set.room.role.dto';
import { MuteUserDto } from 'src/chat/room/dto/mute.user.dto';
import { RoomVisibilityType } from 'src/chat/room/enums/room.visibility.enum';
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
		private readonly gameService: GameService,
	) {}
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
		this.server.emit('clientConnected'); // this event needed to prevent rendering frontend components before connection is set //FIXME check
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
			await this.roomService.checIfkMutedAndMuteDeadlineAndRemoveMute(
				user.id,
				selectedRoom.name,
			);
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
	async getMessagesForRoom(client: Socket, roomName: string) {
		const response: MessageI[] =
			await this.messageService.findMessagesForRoom(roomName);
		client.emit('getMessagesForRoom', response);
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
		@ConnectedSocket() client: Socket,
	) {
		const createdDMRoom = await this.roomService.createPrivateChatRoom(
			dMRoom,
			client.data.user.id,
		);
		client.emit('postPrivateChatRoom', createdDMRoom);

		// fetching sockets of both users inside the private room
		const secondUserId = dMRoom.userIds[0];
		const sockets = await this.server
			.in(client.data.user.id.toString())
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
		await this.getPublicRoomsList(client);
	}

	@SubscribeMessage('getPublicRoomsList')
	async getPublicRoomsList(client) {
		const roomsList = await this.roomService.getPublicRoomsList(
			client.data.user.id,
		);
		this.server
			.to(client.data.user.id.toString())
			.emit('postPublicRoomsList', roomsList);
	}

	// @SubscribeMessage('getPublicRoomsList')
	// async getPublicRoomsList(userId: number) {
	// 	const roomsList = await this.roomService.getPublicRoomsList(userId);
	// 	this.server
	// 		.to(userId.toString())
	// 		.emit('postPublicRoomsList', roomsList);
	// } //TODO make sure Olga checks if it works accordingly.
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
		await this.getPublicRoomsList(client);
	}

	@SubscribeMessage('addUserToRoom')
	async addUserToRoom(
		@MessageBody() roomName: string,
		@ConnectedSocket() client: Socket,
	) {
		const room: RoomEntity = await this.roomService.findRoomByName(
			roomName,
		);
		await this.roomService.addUserToRoom(
			client.data.user.id,
			room,
			UserRole.VISITOR,
		);
		client.join(room.name);
		console.log(
			`first time joining: ${client.data.user.username} w/${client.id} has joined room ${room.name}`,
		);
		await this.getPublicRoomsList(client);
	}

	@SubscribeMessage('removeUserFromRoom')
	async removeUserFromRoom(
		@MessageBody() roomName: string,
		@ConnectedSocket() client: Socket,
	) {
		const room: RoomEntity = await this.roomService.findRoomByName(
			roomName,
		);
		await this.roomService.deleteUserRoomRelationship(
			client.data.user.id,
			room,
		);
		const userLeftInRoom = await this.roomService.getOneUserLeftInRoom(
			room,
		);
		if (!userLeftInRoom) {
			await this.roomService.deleteRoom(room);
			if (room.visibility === RoomVisibilityType.PUBLIC) {
				this.server.sockets.emit('room deleted', roomName); // emitting to all the users that have public room in their list
			} else {
				client.emit('room deleted', roomName);
			}
		} else {
			await this.getPublicRoomsList(client);
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

	@SubscribeMessage('banUserFromRoom')
	async banUserFromRoom(
		@MessageBody() roomAndUser: RoomAndUserDTO,
		@ConnectedSocket() client: Socket,
	) {
		const user: UserI = await this.userService.findByID(
			client.data.user.id,
		);
		if (!user) console.log('exception'); //TODO throw exception
		await this.roomService.banUserFromRoom(
			roomAndUser,
			client.data.user.id,
		);
		//leave the room with all the connected sockets
		const sockets = await this.server
			.in(roomAndUser.userId.toString())
			.fetchSockets(); //fetches all connected sockets for this specific user
		for (const socket of sockets) {
			socket.leave(roomAndUser.roomName); //leaves each socket of the added user to this room
		}
		await this.getPublicRoomsList(client);
	}

	@SubscribeMessage('unBanUserFromRoom')
	async unBanUserFromRoom(
		@MessageBody() roomAndUser: RoomAndUserDTO,
		@ConnectedSocket() client: Socket,
	) {
		const user: UserI = await this.userService.findByID(
			client.data.user.id,
		);
		if (!user) console.log('exception'); //TODO throw exception
		await this.roomService.unBanUserFromRoom(
			roomAndUser,
			client.data.user.id,
		);
		await this.getPublicRoomsList(client);
	}

	@SubscribeMessage('isUserBanned')
	async isUserBanned(
		@MessageBody() roomAndUser: RoomAndUserDTO,
		@ConnectedSocket() client: Socket,
	) {
		const isUserBanned = await this.roomService.isUserBanned(roomAndUser);
		console.log('is banned ', isUserBanned);
		client.emit('isUserBanned', isUserBanned);
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
			console.log(`${user.username} has been added to ${room.name}`);
			await this.getPublicRoomsList(socket); //to refresh rooms in added users page
		}
	}

	async sendGameList() {
		const gameList = await this.gameService.getGameList();
		this.server.emit('getGameList', gameList);
	}

	@UseFilters(new WsExceptionFilter())
	@UsePipes(new ValidationPipe({ transform: true }))
	@SubscribeMessage('createGame')
	async createGame(
		@MessageBody() game: CreateGameDto,
		@ConnectedSocket() client: Socket,
	) {
		await this.gameService.createGame(game, client.data.user);
		await this.sendGameList();
	}

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
}
