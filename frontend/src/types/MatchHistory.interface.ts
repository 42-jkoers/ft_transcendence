export default interface MatchHistoryI {
  game_id: number;
  //TODO remove later, for now to check if the data retrieve is suscessfull. later we only need the couterplayer info
  player1_avatar: string;
  player1_username: string;
  score: string;
  player2_avatar: string;
  player2_username: string;
  result: string;
  game_date: Date;
}
