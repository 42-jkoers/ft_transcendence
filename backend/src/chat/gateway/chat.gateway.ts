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
import { AuthService } from '../../auth/auth.service';

//Gateway: a class annotated with @WebSocketGetAway decorator
@WebSocketGateway({ cors: { origin: 'http://localhost:8080', credentials: true } }) //allows us to make use of any WebSockets library (in our case socket.io)
export class ChatGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	constructor (
		private readonly authService: AuthService,
	) {};
	@WebSocketServer() server: Server; //gives access to the server instance to use for triggering events
	private logger: Logger = new Logger('ChatGateway');

	async handleConnection(client: Socket) {
		this.logger.log('Client connected');
		const user = await this.authService.getUserFromCookie(client.handshake.headers.cookie);
		if (user) {
			console.log(">> In gateway handleConnection(): user is:\n", user);
		} else {
			console.log(">> In gateway handleConnection(): user not authorized.\n");
		}
		//try catch block here to authenticate user with jwt
		//push sockets into Socket[] array. + keep id info of socket
	}

	afterInit(server: Server) {
		this.logger.log('Gateway: init');
		this.server.emit('Hey there');
	}

	handleDisconnect() {
		this.logger.log('Client disconnected');
		//remove sockets from Socket[] array
		//disconnect socket
	}

	@SubscribeMessage('addMessage') //allows to listen to incoming messages
	handleMessage(client: Socket, payLoad: string): void {
		this.logger.log(payLoad);
		client.emit('messageAdded', 'Here is my message?');
		// client.send(payLoad);
	}
}
