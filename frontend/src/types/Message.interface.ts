import Room from "./Room";
import UserProfileI from "./UserProfile.interface";

export default interface MessageI {
  id?: number;
  text: string;
  user: UserProfileI;
  room: Room;
}
