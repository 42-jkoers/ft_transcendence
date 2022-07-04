import { RoomI } from 'src/chat/room/room.interface';

export interface UserI {
	id?: number;
	intraID?: string;
	username?: string;
	avatar?: string;
	rooms?: RoomI[];
	requestedFriends?: UserI[];
	friends?: UserI[];
	blockedUsers?: UserI[];
	isTwoFactorAuthEnabled?: boolean;
	isTwoFactorAuthenticated?: boolean;
	twoFactorAuthSecret?: string;
	socketCount?: number;
}
