import { GameMode, GameStatus } from './game.dto';

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
	y: number; // point is defined as top left
	x: number; // point is defined as top left
	height: number;
	width: number;
	score: number;
}

export interface Frame {
	ball: BallUpdate;
	paddles: PaddleUpdate[];
	socketRoomID: string;
}

export interface GameInPlay {
	id: number;
	socketRoomID: string;
	status: GameStatus;
	ball: Ball;
	canvas: Canvas;
	paddles: Paddle[];
}

class Paddle {
	public readonly userID: number;
	public readonly position: 'left' | 'right';
	public y: number;
	public x: number;
	public readonly height: number;
	public readonly width: number;
	public score: number;
	public readonly mode: GameMode;

	private readonly speed: number;
	private update: -1 | 0 | 1;
	private readonly canvas: Canvas;

	constructor(
		userID: number,
		canvas: Canvas,
		position: 'left' | 'right',
		mode: GameMode,
	) {
		this.userID = userID;

		this.mode = mode;
		switch (this.mode) {
			case GameMode.normal:
				this.speed = canvas.width * 0.01;
				break;

			case GameMode.fast:
				this.speed = canvas.width * 0.016;
				break;
		}
		this.height = canvas.height * 0.2;
		this.width = canvas.grid / 2;
		this.score = 0;

		this.position = position;
		this.canvas = canvas;

		this.reset();
	}

	reset() {
		this.x =
			this.position == 'left'
				? this.canvas.grid / 2
				: this.canvas.width - this.canvas.grid;
		this.y = this.canvas.height / 2 - this.height / 2;
		this.update = 0;
	}

	addUpdate(update: -1 | 0 | 1) {
		this.update = update;
	}

	tick() {
		this.y -= this.update * this.speed;
		if (this.y < 0) this.y = 0;
		else if (this.y + this.height > this.canvas.height)
			this.y = this.canvas.height - this.height;
	}

	dy() {
		return this.update * this.speed;
	}

	export(): PaddleUpdate {
		return {
			x: this.x,
			y: this.y,
			height: this.height,
			width: this.width,
			score: this.score,
		};
	}
}

class Ball {
	public readonly mode: GameMode;

	private c: Canvas;
	private x: number;
	private y: number;
	private dx: number;
	private dy: number;
	private radius: number;

	constructor(canvas: Canvas, mode: GameMode) {
		this.c = canvas;
		this.mode = mode;
		this.reset();
	}

	reset() {
		this.x = this.c.width * 0.5;
		this.y = this.c.height * 0.5;
		switch (this.mode) {
			case GameMode.normal:
				this.dx = -0.003;
				this.dy = -0.005;
				break;

			case GameMode.fast:
				this.dx = -0.006;
				this.dy = -0.009;
				break;
		}
		this.dx *= Math.random() > 0.5 ? 1 : -1;
		this.dy *= Math.random() > 0.5 ? 1 : -1;
		this.radius = this.c.grid;
	}

	tick(paddles: Paddle[]) {
		this.x += this.dx;
		this.y += this.dy;

		if (this.y < this.radius) {
			this.y = this.radius + Number.EPSILON;
			this.dy *= -1;
		} //
		else if (this.y + this.radius > this.c.height) {
			this.y = this.c.height - this.radius - Number.EPSILON;
			this.dy *= -1;
		}

		for (const paddle of paddles) this.tickPaddle(paddle);
	}

	export(): BallUpdate {
		return {
			x: this.x,
			y: this.y,
			radius: this.radius,
		};
	}

	get _x() {
		return this.x;
	}
	get _y() {
		return this.y;
	}
	get _radius() {
		return this.radius;
	}

	private paddleCollides(paddle: Readonly<Paddle>): boolean {
		let dx = Math.abs(this.x - (paddle.x + paddle.width / 2));
		let dy = Math.abs(this.y - (paddle.y + paddle.height / 2));

		if (dx > this.radius + paddle.width / 2) return false;
		if (dy > this.radius + paddle.height / 2) return false;
		if (dx <= paddle.width) return true;
		if (dy <= paddle.height) return true;

		dx = dx - paddle.width;
		dy = dy - paddle.height;
		return dx * dx + dy * dy <= this.radius * this.radius;
	}

	private tickPaddle(paddle: Readonly<Paddle>) {
		if (!this.paddleCollides(paddle)) return;
		this.dx *= -1;
		// higher number means more that the ball will be more affected by the paddles' current direction
		const grip = 0.2;
		this.dy -= paddle.dy() * grip;

		if (paddle.position == 'left') {
			this.x = paddle.x + paddle.width + this.radius + Number.EPSILON;
		} //
		else if (paddle.position == 'right') {
			this.x = paddle.x - paddle.width - this.radius - Number.EPSILON;
		} //
		else {
			throw `unhandled paddle position "${paddle.position}"`;
		}
	}
}

export class Game {
	public readonly id: number;
	public readonly socketRoomID: string;
	public status: GameStatus;
	public readonly mode: GameMode;

	public readonly paddles: Paddle[];
	private canvas: Canvas;
	private ball: Ball;

	constructor(
		playerIDS: number[],
		id: number,
		mode: GameMode,
		status?: GameStatus,
	) {
		this.id = id;
		this.socketRoomID = `game${id}`;
		this.status = status ?? GameStatus.PLAYING;
		this.paddles = [];
		this.canvas = {
			height: 1,
			width: 4 / 3,
			grid: 0.025,
		};
		this.mode = mode;
		this.ball = new Ball(this.canvas, mode);
		for (const id of playerIDS) this.addPaddle(id);
	}

	addPaddle(userID: number) {
		if (this.paddles.length >= 2) throw new Error('too many paddles');

		const position = this.paddles.length == 0 ? 'left' : 'right';
		this.paddles.push(new Paddle(userID, this.canvas, position, this.mode));

		if (this.paddles.length == 2) this.status = GameStatus.PLAYING;
	}

	tick() {
		// if (this.status !== GameStatus.PLAYING) // TODO: uncomment this
		// 	throw new Error(`cannot tick game with status ${this.status}`);

		this.ball.tick(this.paddles);
		for (const paddle of this.paddles) {
			paddle.tick();
			if (
				(paddle.position == 'left' &&
					this.ball._x < this.ball._radius) ||
				(paddle.position == 'right' &&
					this.ball._x + this.ball._radius > this.canvas.width)
			) {
				paddle.score++;
				paddle.reset();
				this.ball.reset();
			}
		}

		if (this.getWinnerID() !== undefined)
			this.status = GameStatus.COMPLETED;
	}

	getFrame(): Frame {
		return {
			ball: this.ball.export(),
			paddles: this.paddles.map((p) => p.export()),
			socketRoomID: this.socketRoomID,
		};
	}

	getInPlay(): GameInPlay {
		return {
			id: this.id,
			socketRoomID: this.socketRoomID,
			status: this.status,
			ball: this.ball,
			canvas: this.canvas,
			paddles: this.paddles,
		};
	}

	getWinnerID(): number | undefined {
		const winningScore = 5;
		if (this.paddles[0]?.score >= winningScore) {
			return this.paddles[1]?.userID;
		}
		if (this.paddles[1]?.score >= winningScore) {
			return this.paddles[0]?.userID;
		}
		return undefined;
	}

	nPlayers(): number {
		return this.paddles.length;
	}

	addUpdate(playerID: number, update: -1 | 0 | 1) {
		for (const p of this.paddles) {
			if (p.userID == playerID) p.addUpdate(update);
		}
	}
}
