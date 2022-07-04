import { IsNumber } from 'class-validator';

export class RoomAndUserDTO {
	@IsNumber()
	userId: number;

	roomName: string;
}
