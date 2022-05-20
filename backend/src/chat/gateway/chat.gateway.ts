import { Logger } from '@nestjs/common';
import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { UserI } from 'src/user/user.interface';
import { AuthService } from '../../auth/auth.service';
import { ConnectedUserService } from '../connected-user/connected-user.service';
import { ConnectedUserI } from '../connected-user/connected-user.interface';
import { MessageI } from '../message/message.interface';
import { MessageService } from '../message/message.service';

@WebSocketGateway({
	namespace: "/chat", cors: { origin: 'http://localhost:8080', credentials: true },
}) //allows us to make use of any WebSockets library (in our case socket.io)
export class ChatGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	constructor(
		private readonly authService: AuthService,
		private readonly connectedUserService: ConnectedUserService,
        private readonly messageService: MessageService
	) {}
	@WebSocketServer() server: Server; //gives access to the server instance to use for triggering events
	private logger: Logger = new Logger('ChatGateway');

	async handleConnection(client: Socket) {
		// TODO should we check if the connection is coming from chat or game?
		this.logger.log('Client connected');
		const user: UserI = await this.authService.getUserFromCookie(
			client.handshake.headers.cookie,
		);
		if (user) {
			console.log('>> In gateway handleConnection(): user is:\n', user);
		} else {
			console.log('>> In gateway handleConnection(): user not authorized.\n', ); //FIXME throw an exception
		}
		client.data.user = user;

		await this.connectedUserService.createConnectedUser({
			socketID: client.id,
			user,
		}); // save connection to DB
	}

	afterInit(server: Server) {
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
        const createdMessage: MessageI = await this.messageService.create(message);
		console.log('created msg.text : ', createdMessage.text);
		// this.server.to(client.id).emit('messageAdded', createdMessage); //TODO check the difference and decide
		client.emit('messageAdded', createdMessage);
	}
}
