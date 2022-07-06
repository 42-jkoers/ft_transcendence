import { RoomI } from 'src/chat/room/room.interface';
import { GameStatusType } from 'src/game/gamestatus.enum';

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
	sentGameInvites?: UserI[];
	gameStatus?: GameStatusType;
}
