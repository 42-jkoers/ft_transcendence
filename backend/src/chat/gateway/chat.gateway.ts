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

//Gateway: a class annotated with @WebSocketGetAway decorator
@WebSocketGateway({ cors: { origin: 'http://localhost:8080', credentials: true } }) //allows us to make use of any WebSockets library (in our case socket.io)
export class ChatGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	constructor (
		private readonly authService: AuthService,
		private readonly connectedUserService: ConnectedUserService
	) {};
	@WebSocketServer() server: Server; //gives access to the server instance to use for triggering events
	private logger: Logger = new Logger('ChatGateway');

	async handleConnection(client: Socket) {
		this.logger.log('Client connected');
		const cookieString = client.handshake.headers.cookie;
		const user: UserI = await this.authService.getUserFromCookie(cookieString);
		client.data.user = user;
		console.log(">> user is:\n", user);
		//try catch block here to authenticate user with jwt
		await this.connectedUserService.createConnectedUser({socketID: client.id, user}); // save connection to DB
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
