import { IsNotEmpty, IsString } from 'class-validator';

export class RoomPasswordDto {
	@IsString()
	@IsNotEmpty()
	roomName: string;

	@IsString()
	@IsNotEmpty()
	password: string;
}
