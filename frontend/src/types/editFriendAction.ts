import { ErrorType } from "./errorManagement";
export enum EditFriendActionType {
  ADD_FRIEND,
  REMOVE_FRIEND,
  SEND_REQUEST,
  REJECT_REQUEST,
}

export function friendActionMessage(
  action: EditFriendActionType | undefined
): string {
  switch (action) {
    case EditFriendActionType.ADD_FRIEND:
      return "Friend added successfully!";
    case EditFriendActionType.REMOVE_FRIEND:
      return "Friend removed successfully!";
    case EditFriendActionType.SEND_REQUEST:
      return "Friend request sent successfully!";
    case EditFriendActionType.REJECT_REQUEST:
      return "Reject friend request!";
    default:
      return "";
  }
}

export function editFriendActionError(action: number | undefined): ErrorType {
  switch (action) {
    case EditFriendActionType.ADD_FRIEND:
      return ErrorType.FRIEND_ADD_FRIEND_FAILED;
    case EditFriendActionType.REMOVE_FRIEND:
      return ErrorType.FRIEND_REMOVE_FRIEND_FAILED;
    case EditFriendActionType.SEND_REQUEST:
      return ErrorType.FRIEND_SEND_REQUEST_FAILED;
    case EditFriendActionType.REJECT_REQUEST:
      return ErrorType.FRIEND_REJECT_REQUEST_FAILED;
    default:
      return ErrorType.GENERAL;
  }
}
