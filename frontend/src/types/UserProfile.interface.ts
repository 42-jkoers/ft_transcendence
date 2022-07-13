import { PlayerGameStatusType } from "./GameStatus.enum";

export default interface UserProfileI {
  id: number;
  username: string;
  avatar: string;
  twoFactor: boolean;
  ladder: number;
  wins: number;
  loses: number;
  gameStatus: PlayerGameStatusType;
}
