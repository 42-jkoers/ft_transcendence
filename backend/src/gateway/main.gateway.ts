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
import { plainToClass } from 'class-transformer';
import { RoomForUserDto } from 'src/chat/room/dto';
import { UserService } from 'src/user/user.service';
import { createRoomDto } from '../chat/room/dto';
import { GameService } from '../game/game.service';
import { CreateGameDto } from 'src/game/game.dto';

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
				console.log(
					`join on connection: ${user.username} w/${client.id} has joined room ${room.name}`,
				);
			}); //each new socket connection joins the room that the user is already a part of
			// client.join(user.id.toString()); TODO implement this for private messaging
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
	async handleMessage(client: Socket, message: MessageI) {
		const selectedRoom: RoomEntity = await this.roomService.findRoomByName(
			message.room.name,
		);
		const user: UserI = await this.userService.findByID(
			client.data.user.id,
		);
		const createdMessage: MessageI = await this.messageService.create(
			message,
			user,
			selectedRoom,
		);
		this.server.to(selectedRoom.name).emit('messageAdded', createdMessage); //server socket emits to all clients
		//TODO this.server.to(selectedRoom.name).to(user.id.toString()).emit('messageAdded', createdMessage);FOR DM?
	}

	@SubscribeMessage('getMessagesForRoom')
	async getMessagesForRoom(client: Socket, roomName: string) {
		const response: MessageI[] =
			await this.messageService.findMessagesForRoom(roomName);
		client.emit('getMessagesForRoom', response);
	}

	@UseFilters(new WsExceptionFilter())
	@UsePipes(new ValidationPipe({ transform: true }))
	@SubscribeMessage('createRoom')
	async handleCreateRoom(
		@MessageBody() room: createRoomDto,
		@ConnectedSocket() client: Socket,
	) {
		const response: { status: string; data: string } =
			await this.roomService.createRoom(room, client.data.user.id);
		client.emit('createRoom', response);
		client.join(response.data);
		console.log(
			`first time joining: ${client.data.user.username} w/${client.id} has joined room ${room.name}`,
		);
	}

	@SubscribeMessage('getPublicRoomsList')
	async getPublicRoomsList(client: Socket) {
		const publicRooms: RoomEntity[] =
			// await this.roomService.getAllPublicRoomsWithUserRole();
			await this.roomService.getAllPublicRoomsWithUserRole(
				client.data.user.id,
			);
		const response = publicRooms.map((room) => {
			const listedRoom = plainToClass(RoomForUserDto, room); //
			listedRoom.userRole = room.userToRooms[0]?.role; // getting role from userToRooms array
			listedRoom.protected = room.password ? true : false; // we don't pass the password back to user
			return listedRoom;
		});
		client.emit('postPublicRoomsList', response);
	}

	@SubscribeMessage('getUserRoomsList')
	async getUserRoomsList(client: Socket) {
		if (client.data.user) {
			const roomEntities: RoomEntity[] =
				await this.roomService.getRoomsForUser(client.data.user.id);

			// we don't need all information from the RoomEntity returned to the user, we'll have to serialize it
			// by converting roomentity type to dto with several excluded and transformed properties
			const response: RoomForUserDto[] = roomEntities.map((room) => {
				const listedRoom = plainToClass(RoomForUserDto, room); //
				listedRoom.userRole = room.userToRooms[0].role; // getting role from userToRooms array
				listedRoom.protected = room.password ? true : false; // we don't pass the password back to user
				return listedRoom;
			});
			client.emit('getUserRoomsList', response);
		}
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
		await this.roomService.addVisitorToRoom(client.data.user.id, room);
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
		await this.getPublicRoomsList(client);
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

	@UseFilters(new WsExceptionFilter())
	@UsePipes(new ValidationPipe({ transform: true }))
	@SubscribeMessage('createGame')
	async createGame(
		@MessageBody() game: CreateGameDto,
		@ConnectedSocket() client: Socket,
	) {
		console.log('aaaaaaa')
		const id = client.data.user.id;
		await this.gameService.createGame(game, id);
	}
}
