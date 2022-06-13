import { RoomI } from 'src/chat/room/room.interface';

export interface UserI {
	id?: number;
	intraID?: string;
	username?: string;
	avatar?: string;
	rooms?: RoomI[];
	friendRequests?: number[];
	friends?: UserI[];
}
