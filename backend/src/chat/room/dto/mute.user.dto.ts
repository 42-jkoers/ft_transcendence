import { IsNumber, IsString } from 'class-validator';
import { RoomEntity } from '../entities/room.entity';

export class MuteUserDto {
	@IsNumber()
	id: number;

	@IsString()
	roomName: string;

	@IsNumber()
	durationMinute: number;
}
