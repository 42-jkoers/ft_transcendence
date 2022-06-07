import RoomVisibility from "./RoomVisibility";
interface Room {
  id: number;
  name: string; // no id but the name must be unique
  isDirectMessage: boolean;
  visibility: RoomVisibility;
  password: string | null;
}

export default Room;
