import EditFriendActionType from "./EditFriendActionType";

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
    case EditFriendActionType.ERROR:
      return "Something went wrong, please retry!";
    default:
      return "";
  }
}
