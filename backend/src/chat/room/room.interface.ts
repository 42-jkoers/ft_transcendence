import { RoomVisibilityType } from './entities/room.entity';
import { UserI } from 'src/user/user.interface';

export interface RoomI {
	id?: number;
	name: string;
	visibility: RoomVisibilityType;
	password: string | null;
	users?: UserI[];
}
