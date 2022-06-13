import {
	ExceptionFilter,
	Catch,
	ArgumentsHost,
	BadRequestException,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

@Catch()
export class WsExceptionFilter implements ExceptionFilter {
	catch(exception: WsException, host: ArgumentsHost) {
		const client = host.switchToWs().getClient();
		this.handleError(client, exception);
	}

	public handleError<TClient extends { emit }>(
		client: TClient,
		exception: WsException,
	) {
		if (exception instanceof BadRequestException) {
			const response = exception.getResponse();
			client.emit('BadRequestException', response);
		}
	}
}
