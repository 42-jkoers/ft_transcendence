import { IsEnum, IsNotEmpty, MinLength } from 'class-validator';

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
