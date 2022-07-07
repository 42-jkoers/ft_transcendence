import User from 'src/user/user.entity';

//TODO not sure if this is correct interface to pass data. Maybe not needed at all
export interface MatchHistoryI {
	playerName: string;
	score: string;
	result: boolean;
	date: Date;
}
