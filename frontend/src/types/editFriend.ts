import EditFriendActionType from "./EditFriendActionType";

export function friendActionSuccessMessage(
  action: EditFriendActionType
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
  }
}
export function friendActionErrorMessage(action: EditFriendActionType): string {
  switch (action) {
    case EditFriendActionType.ADD_FRIEND:
      return "Friend added failed! Please retry.";
    case EditFriendActionType.REMOVE_FRIEND:
      return "Friend removed failed! Please retry.";
    case EditFriendActionType.SEND_REQUEST:
      return "Send friend request failed! Please retry.";
    case EditFriendActionType.REJECT_REQUEST:
      return "Reject friend request failed! Please retry.";
  }
}
