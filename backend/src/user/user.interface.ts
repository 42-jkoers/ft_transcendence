import { IRoom } from 'src/chat/room/room.interface';

export interface IUser {
	id?: number;
	intraID?: string;
	username?: string;
	avatar?: string;
	users?: IRoom[];
}
