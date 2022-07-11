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

	private readonly speed: number;
	private update: -1 | 0 | 1;
	private readonly canvas: Canvas;

	constructor(userID: number, canvas: Canvas, position: 'left' | 'right') {
		this.userID = userID;

		this.speed = canvas.width * 0.01;
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
				: this.canvas.width - this.canvas.grid / 2;
		this.y = this.canvas.height / 2 + this.height / 2;
		this.update = 0;
	}

	addUpdate(update: -1 | 1) {
		this.update = update;
	}

	tick() {
		this.y -= this.update * this.speed;
		// TODO bounce
		this.update = 0;
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
	private c: Canvas;
	private x: number;
	private y: number;
	private dx: number;
	private dy: number;
	private radius: number;

	constructor(canvas: Canvas) {
		this.c = canvas;
		this.reset();
	}

	reset() {
		this.x = this.c.width * 0.5;
		this.y = this.c.height * 0.5;
		this.dx = this.c.height * -0.003;
		this.dy = this.c.height * -0.005;
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
		} //
		else if (this.x + this.radius > this.c.width) {
			// TODO: remove this
			this.dx *= -1;
			this.x = this.c.width - this.radius - Number.EPSILON;
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

	private tickPaddle(paddle: Readonly<Paddle>) {
		if (paddle.position == 'left') {
			const collides =
				this.x - this.radius < paddle.x + paddle.width &&
				this.x + this.radius > paddle.x + paddle.width &&
				this.y - this.radius > paddle.y &&
				this.y + this.radius < paddle.y + paddle.height;
			if (collides) {
				this.dx *= -1;
				this.x = paddle.x + paddle.width + this.radius + Number.EPSILON;
			}
		} //
		else if (paddle.position == 'right') {
			const collides2 =
				this.x + this.radius > paddle.x - paddle.width &&
				this.x - this.radius < paddle.x + paddle.width &&
				this.y - this.radius >= paddle.y &&
				this.y + this.radius <= paddle.y + paddle.height;
			if (collides2) {
				this.dx *= -1;
				this.x = paddle.x - paddle.width - this.radius - Number.EPSILON;
			}
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

	public readonly paddles: Paddle[];
	private canvas: Canvas;
	private ball: Ball;

	constructor(playerIDS: number[], id: number, status?: GameStatus) {
		this.id = id;
		this.socketRoomID = `game${id}`;
		this.status = status ?? GameStatus.IN_QUE;
		this.paddles = [];
		this.canvas = {
			height: 1,
			width: 4 / 3,
			grid: 0.025,
		};
		this.ball = new Ball(this.canvas);
		for (const id of playerIDS) this.addPaddle(id);
	}

	addPaddle(userID: number) {
		if (this.paddles.length >= 2) throw new Error('too many paddles');

		const position = this.paddles.length == 0 ? 'left' : 'right';
		this.paddles.push(new Paddle(userID, this.canvas, position));

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

	addUpdate(playerID: number, update: -1 | 1) {
		for (const p of this.paddles) {
			if (p.userID == playerID) p.addUpdate(update);
		}
	}
}
