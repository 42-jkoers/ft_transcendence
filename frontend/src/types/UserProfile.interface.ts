export default interface UserProfileI {
  id: number;
  username: string;
  avatar: string;
  socketCount: number;
  twoFactor: boolean;
  isGaming: boolean;
}
