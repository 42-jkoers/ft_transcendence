import { IsNumber, IsString } from 'class-validator';

export class MuteUserDto {
	@IsNumber()
	id: number;

	@IsString()
	roomName: string;

	@IsNumber()
	durationMinute: number;
}
