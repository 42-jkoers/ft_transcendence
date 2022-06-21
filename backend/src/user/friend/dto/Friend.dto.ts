import { EditFriendActionType } from '../edit.friend.enum';

export class FriendDto {
	userId: number;
	friendId: number;
	action: EditFriendActionType;
}
