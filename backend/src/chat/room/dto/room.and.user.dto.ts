import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class RoomAndUserDTO {
	@IsNumber()
	@IsOptional()
	userId?: number;

	@IsString()
	@IsNotEmpty()
	roomName: string;
}
