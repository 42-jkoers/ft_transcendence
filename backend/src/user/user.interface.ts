import { RoomI } from 'src/chat/room/room.interface';
import { GameMode } from 'src/game/game.dto';
import { PlayerGameStatusType } from 'src/game/playergamestatus.enum';

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
	sentGameInvites?: UserI[];
	gameStatus?: PlayerGameStatusType;
	gameMode?: GameMode;
}
