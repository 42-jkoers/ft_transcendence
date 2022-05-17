import { RoomVisibilityType } from './entities/room.entity';
import { IUser } from 'src/user/user.interface';

export interface IRoom {
	id?: number;
	name?: string;
	visibility: RoomVisibilityType;
	users?: IUser[];
}
