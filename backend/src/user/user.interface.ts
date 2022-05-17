import { IRoom } from 'src/chat/room/room.interface';

export interface UserI {
    id?: number;
    intraID?: string,
    usernanme?: string,
    avatar?: string;
	users?: IRoom[];
}
