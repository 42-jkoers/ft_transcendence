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
	IN_QUE,
	PLAYING,
	COMPLETED,
	ABANDONED,
}

export interface Paddle {
	y: number; // fraction
	x: number;
	height: number;
	speed: number;
}

export interface Player {
	id: number;
	score: number;
	update: PaddleUpdate;
	paddle: Paddle;
}

export interface Frame {
	// ball: {
	// 	x: number;
	// 	y: number;
	// };
	paddles: Paddle[];
	socketRoomID: string;
}

// export interface Ball {
// 	x: number;
// 	y: number;
// 	dx: number;
// 	dy: number;
// 	radius: number;
// 	resetting: boolean;
// }

export interface GameInPlay {
	id: number;
	socketRoomID: string;
	status: GameStatus;
	// ball: Ball;
	canvas: {
		width: number;
		height: number;
	};
	players: Player[];
}
