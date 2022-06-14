import { EditFriendActionType } from '../enum/edit.friend.enum';

export class FriendDto {
	userId: number;
	friendId: number;
	action: EditFriendActionType;
}
