import { IsNumber, IsPositive, IsString } from 'class-validator';

export class MuteUserDto {
	@IsNumber()
	id: number;

	@IsString()
	roomName: string;

	@IsNumber()
	@IsPositive()
	durationMinute: number;
}
