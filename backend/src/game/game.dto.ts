import {
	IsEnum,
	IsNotEmpty,
	IsNumber,
	IsPositive,
	IsString,
	MinLength,
} from 'class-validator';
import User from 'src/user/user.entity';

export class CreateGameDto {
	@IsNotEmpty()
	@MinLength(1, {
		message: () => {
			return 'Name is required';
		},
	})
	name: string;
}

export enum PaddleUpdate {
	up = 1,
	none = 0,
	down = -1,
}
export class PaddleUpdateDto {
	@IsEnum(PaddleUpdate)
	update: PaddleUpdate;
}

export enum GameStatus {
	PLAYING,
	COMPLETED,
}

export enum GameMode {
	normal = 'normal',
	fast = 'fast',
}

export class GameModeDto {
	@IsEnum(GameMode)
	gameMode: GameMode;
}

export class MatchHistoryDto {
	@IsNumber()
	game_id: number;

	updated_at: Date;

	playerEntry: PlayerEntry[];
}

export class OngoingGameDto {
	@IsNotEmpty()
	@IsNumber()
	@IsPositive()
	id: number;

	@IsNotEmpty()
	@IsString()
	playerName1: string;

	@IsNotEmpty()
	@IsString()
	playerName2: string;
}
