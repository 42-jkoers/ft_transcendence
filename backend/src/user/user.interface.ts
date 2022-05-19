import { IRoom } from 'src/chat/room/room.interface';

export interface UserI {
    id?: number;
    intraID?: string,
    username?: string,
    avatar?: string;
	users?: IRoom[];
}
