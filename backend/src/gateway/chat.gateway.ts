import { Logger, UsePipes, ValidationPipe } from '@nestjs/common';
import {
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { UserI } from 'src/user/user.interface';
import { RoomI } from 'src/chat/room/room.interface';
import { AuthService } from '../auth/auth.service';
import { ConnectedUserService } from '../chat/connected-user/connected-user.service';
import { RoomService } from '../chat/room/room.service';
import { MessageI } from '../chat/message/message.interface';
import { MessageService } from '../chat/message/message.service';
import { createRoomDto } from '../chat/room/dto';
import { WsExceptionFilter } from '../exceptions/WsExceptionFilter';
import { UseFilters } from '@nestjs/common';

@WebSocketGateway({
	cors: { origin: 'http://localhost:8080', credentials: true },
}) //allows us to make use of any WebSockets library (in our case socket.io)
export class ChatGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	constructor(
		private readonly authService: AuthService,
		private readonly roomService: RoomService,
		private readonly connectedUserService: ConnectedUserService,
		private readonly messageService: MessageService,
	) {}
	@WebSocketServer() server: Server; //gives access to the server instance to use for triggering events
	private logger: Logger = new Logger('ChatGateway');

	async handleConnection(client: Socket) {
		this.logger.log('Client connected');
		const user: UserI = await this.authService.getUserFromCookie(
			client.handshake.headers.cookie,
		);
		if (user) {
			console.log(user);
		} else {
			console.log('user not authorized.\n'); //FIXME throw an exception
		}
		client.data.user = user;

		await this.connectedUserService.createConnectedUser({
			socketID: client.id,
			user,
		}); // save connection to DB
		this.server.emit('clientConnected'); // this event needed to prevent rendering frontend components before connection is set
	}

	afterInit() {
		this.logger.log('Gateway: init');
		this.server.emit('Hey there');
		//TODO maybe delete all connected users and joined rooms with onInit?
	}

	handleDisconnect(client: Socket) {
		this.logger.log('Client disconnected');
		this.connectedUserService.deleteBySocketId(client.id);
		client.disconnect(); //manually disconnects the socket
	}

	@SubscribeMessage('addMessage') //allows to listen to incoming messages
	// @UseGuards(AuthenticatedGuard) //TODO check if it works
	async handleMessage(client: Socket, message: MessageI): Promise<any> {
		this.logger.log(message);
		const createdMessage: MessageI = await this.messageService.create(
			message,
		);
		console.log('created msg.text : ', createdMessage.text);
		// this.server.to(client.id).emit('messageAdded', createdMessage); //TODO check the difference and decide
		client.emit('messageAdded', createdMessage);
	}

	@UseFilters(new WsExceptionFilter())
	@UsePipes(new ValidationPipe({ transform: true }))
	@SubscribeMessage('createRoom')
	async handleCreateRoom(
		@MessageBody() room: createRoomDto,
		@ConnectedSocket() client: Socket,
	) {
		const response: { status: string; data: string } =
			await this.roomService.createRoom(room, client.data.user);
		client.emit('createRoom', response);
	}

	@SubscribeMessage('getUserRoomsList')
	async getRoomsList(client: Socket) {
		const response: RoomI[] = await this.roomService.getRoomsForUser(
			client.data.user.id,
		);
		client.emit('getUserRoomsList', response);
	}

	@SubscribeMessage('checkRoomPasswordMatch')
	async checkRoomPasswordMatch(
		client: Socket,
		roomToUnlock: { name: string; password: string },
	) {
		const room: RoomI = await this.roomService.findByName(
			roomToUnlock.name,
		);
		const isMatched = await this.roomService.compareRoomPassword(
			roomToUnlock.password,
			room.password,
		);
		client.emit('isRoomPasswordMatched', isMatched);
	}
}
