import { GameStatusType } from "./GameStatus.enum";

export default interface UserProfileI {
  id: number;
  username: string;
  avatar: string;
  twoFactor: boolean;
  gameStatus: GameStatusType;
}
