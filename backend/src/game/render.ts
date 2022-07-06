import { GameStatus } from './game.dto';

// PaddlePosition
export enum PaddlePos {
	left = 'left',
	right = 'left',
}

export interface Canvas {
	width: number;
	height: number;
	grid: number;
}

export interface BallUpdate {
	x: number; // point is defined as center of ball
	y: number; // point is defined as center of ball
	radius: number;
}

export interface PaddleUpdate {
	y: number; // point is defined as center of ball
	x: number; // point is defined as center of ball
	height: number;
	width: number; // defined as horizontal distance to end of paddle
}

export interface Frame {
	ball: BallUpdate;
	paddles: PaddleUpdate[];
	socketRoomID: string;
}

class Paddle {
	public readonly userID: number;
	public readonly position: 'left' | 'right';

	private y: number;
	private x: number;
	private height: number;
	private width: number; // defined as horizontal distance to end of paddle
	private speed: number;
	private update: -1 | 0 | 1;
	private canvas: Canvas;

	constructor(userID: number, canvas: Canvas, position: 'left' | 'right') {
		this.userID = userID;
		this.x =
			position == 'left'
				? canvas.grid / 2
				: canvas.width - canvas.grid / 2;
		this.y = canvas.height * 0.05;
		this.speed = canvas.width * 0.01;
		this.height = canvas.height * 0.2;
		this.width = canvas.grid / 2;
		this.position = position;
		this.update = 0;
		this.canvas = canvas;
	}

	addUpdate(update: -1 | 1) {
		this.update = update;
	}

	tick(): PaddleUpdate {
		this.y += this.update * this.speed;
		// TODO bounce
		this.update = 0;
		return {
			x: this.x,
			y: this.y,
			height: this.height,
			width: this.width,
		};
	}
}

class Ball {
	private c: Canvas;
	private x: number;
	private y: number;
	private dx: number;
	private dy: number;
	private radius: number;

	constructor(canvas: Canvas) {
		this.c = canvas;
		this.x = canvas.width * 0.5;
		this.y = canvas.height * 0.5;
		this.dx = canvas.height * -0.002;
		this.dy = canvas.height * -0.0025;
		this.radius = canvas.grid;
	}

	tick(): BallUpdate {
		this.x += this.dx;
		this.y += this.dy;

		if (this.y < this.radius) {
			this.y = this.radius + Number.EPSILON;
			this.dy *= -1;
		} //
		else if (this.y + this.radius > this.c.height) {
			this.y = this.c.height - this.radius - Number.EPSILON;
			this.dy *= -1;
		} //
		else if (this.x + this.radius > this.c.width) {
			// TODO: remove this
			this.dx *= -1;
			this.x = this.c.width - this.radius - Number.EPSILON;
		}
		// todo Paddle

		return {
			x: this.x,
			y: this.y,
			radius: this.radius,
		};
	}
}

export class Game {
	public readonly id: number;
	public readonly socketRoomID: string;
	public status: GameStatus;

	private paddles: Paddle[];
	private canvas: Canvas;
	private ball: Ball;

	constructor(playerIDS: number[], id: number) {
		this.id = id;
		this.socketRoomID = `game${id}`;
		this.status = GameStatus.IN_QUE;
		this.paddles = [];
		this.canvas = {
			height: 1,
			width: 4 / 3,
			grid: 0.025,
		};
		this.ball = new Ball(this.canvas);
		for (const id of playerIDS) this.addPaddle(id);
	}

	private addPaddle(userID: number) {
		const position = this.paddles.length == 0 ? 'left' : 'right';
		this.paddles.push(new Paddle(userID, this.canvas, position));
	}

	tick(): Frame {
		this.status = GameStatus.PLAYING;
		return {
			ball: this.ball.tick(),
			paddles: this.paddles.map((p) => p.tick()),
			socketRoomID: this.socketRoomID,
		};
	}

	nPlayers(): number {
		return this.paddles.length;
	}

	addUpdate(playerID: number, update: -1 | 1) {
		for (const p of this.paddles) {
			if (p.userID == playerID) p.addUpdate(update);
		}
	}
}
