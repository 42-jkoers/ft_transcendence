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

//Gateway: a class annotated with @WebSocketGetAway decorator
@WebSocketGateway({ cors: { origin: 'http://localhost:8080' } }) //allows us to make use of any WebSockets library (in our case socket.io)
export class ChatGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	@WebSocketServer() server: Server; //gives access to the server instance to use for triggering events
	private logger: Logger = new Logger('ChatGateway');

	handleConnection() {
		this.logger.log('Client connected');
	}

	afterInit(server: Server) {
		this.logger.log('Gateway: init');
		this.server.emit('Hey there');
	}

	handleDisconnect() {
		this.logger.log('Client disconnected');
	}

	@SubscribeMessage('message') //allows to listen to incoming messages
	handleMessage(client: Socket, payLoad: string): void {
		this.logger.log(payLoad);
		// client.send(payLoad);
	}
}
