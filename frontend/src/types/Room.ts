import RoomVisibility from "./RoomVisibility";
interface Room {
  name: string; // no id but the name must be unique
  isDirectMessage: boolean;
  RoomVisibilityType: RoomVisibility;
}

export default Room;
