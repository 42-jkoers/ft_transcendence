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
	y: number; // point is defined as center of ball
	x: number; // point is defined as center of ball
	height: number;
	width: number;
	speed: number;
}

export interface Player {
	id: number;
	score: number;
	update: PaddleUpdate;
	paddle: Paddle;
}

export interface Frame {
	ball: {
		x: number; // point is defined as center of ball
		y: number; // point is defined as center of ball
		radius: number;
	};
	paddles: Paddle[];
	socketRoomID: string;
}

export interface Ball {
	x: number;
	y: number;
	dx: number;
	dy: number;
	radius: number;
}

export interface Canvas {
	width: number;
	height: number;
	grid: number;
}

export interface GameInPlay {
	id: number;
	socketRoomID: string;
	status: GameStatus;
	ball: Ball;
	canvas: Canvas;
	players: Player[];
}
