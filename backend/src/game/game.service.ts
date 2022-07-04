import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { GameEntity } from './game.entity';
import {
	GameInPlay,
	GameStatus,
	Player,
	Frame,
	CreateGameDto,
	PaddleUpdate,
	PaddleUpdateDto,
	Ball,
	Paddle,
	Canvas,
} from './game.dto';
import { Repository, getRepository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import User from 'src/user/user.entity';

// This is a in memory db of all the games in play
// It is not in the postgres database because in a normal game there will be 60 updates per second
// a postgres cannot keep up with that
const inPlays: GameInPlay[] = [
	createGameInPlay(2, 1), // TODO: remove
];

function collides(ball: Ball, paddle: Paddle) {
	const collides =
		ball.x + ball.radius < paddle.x + paddle.width &&
		ball.y + ball.radius > paddle.y &&
		ball.y - ball.radius > paddle.y;
	if (collides) {
		ball.x = ball.radius + paddle.x + Number.EPSILON;
		ball.dx *= -1;
		console.log('c');
	}
}

function updateBall(game: GameInPlay) {
	const c = game.canvas;
	const ball = game.ball;

	ball.x += ball.dx;
	ball.y += ball.dy;

	if (ball.y < ball.radius) {
		ball.y = ball.radius + Number.EPSILON;
		ball.dy *= -1;
	} //
	else if (ball.y + ball.radius > c.height) {
		ball.y = c.height - ball.radius - Number.EPSILON;
		ball.dy *= -1;
	} //
	else if (ball.x + ball.radius > c.width) {
		// TODO: remove this
		ball.dx *= -1;
		ball.x = c.width - ball.radius - Number.EPSILON;
	} else
		for (const player of game.players) {
			collides(ball, player.paddle);
		}
}

export function tick(): Frame[] {
	const updates: Frame[] = [];
	for (const game of inPlays) {
		for (const player of game.players) {
			if (player.update !== PaddleUpdate.none) {
				player.paddle.y -= player.update * player.paddle.speed;
				player.update = 0;
			}
		}

		updateBall(game);

		// extracting only relevant information
		const frame: Frame = {
			ball: { x: game.ball.x, y: game.ball.y, radius: game.ball.radius },
			socketRoomID: game.socketRoomID,
			paddles: game.players.map((p) => p.paddle),
		};
		updates.push(frame);
	}
	return updates;
}

function createPlayer(
	id: number,
	canvas: Canvas,
	position: 'left' | 'right',
): Player {
	return {
		id,
		score: 0,
		update: PaddleUpdate.none,
		paddle: {
			speed: canvas.width * 0.01,
			height: canvas.height * 0.2,
			width: canvas.grid,
			y: canvas.height * 0.05,
			x:
				position == 'left'
					? canvas.width * 0.01
					: canvas.width - canvas.width * 0.01,
		},
	};
}

function createGameInPlay(creatorID: number, gameID: number): GameInPlay {
	const canvas: Canvas = {
		height: 1,
		width: 4 / 3,
		grid: 0.025,
	};
	const game = {
		// id: newGame.id,
		id: gameID, // For now always referencing the same game in the database because this object will be destroyed on restart
		socketRoomID: `game${gameID}`,
		status: GameStatus.PLAYING, // TODO: should be in que
		ball: {
			x: canvas.width * 0.5,
			y: canvas.height * 0.5,
			dx: canvas.height * -0.004,
			dy: canvas.height * -0.005,
			radius: canvas.grid,
		},
		canvas,
		players: [
			createPlayer(creatorID, canvas, 'left'),
			// createPlayer(creator.id, canvas.width, canvas.height, 'right'), // TODO
		],
	};
	console.log(game);
	return game;
}

Injectable();
export class GameService {
	constructor(
		@Inject(forwardRef(() => UserService))
		private readonly userService: UserService,
		@InjectRepository(GameEntity)
		private readonly gameEntityRepository: Repository<GameEntity>,
	) {
		// none
	}

	async createGame(
		payload: CreateGameDto,
		creator: User,
	): Promise<GameEntity | null> {
		const newGame: GameEntity = this.gameEntityRepository.create(payload);
		newGame.name = payload.name;
		newGame.players = [creator];
		await this.gameEntityRepository.save(newGame);
		const inPlay: GameInPlay = createGameInPlay(creator.id, newGame.id);
		inPlays.push(inPlay);
		console.log('created game', newGame, inPlay);
		return newGame;
	}

	startGame(gameID: number) {
		const game = inPlays.find((g) => g.id === gameID);
		if (!game) return;

		if (game.players.length !== 2) {
			console.log(`cannot start game with ${game.players.length}`);
			return;
		}
		game.status = GameStatus.PLAYING;
	}

	async getAllGames(userID: number): Promise<GameEntity[]> {
		const games = await getRepository(GameEntity)
			.createQueryBuilder('game')
			.leftJoinAndSelect('game.players', 'player')
			.where('player.id = :id', { id: userID })
			.getMany();
		return games;
	}

	async findByID(id: string): Promise<GameEntity | undefined> {
		return await this.gameEntityRepository.findOne({
			where: { id },
		});
	}

	findInPlayByID(id: number): GameInPlay | undefined {
		return inPlays.find((p) => p.id === id);
	}

	// async getUserType(
	// 	gameID: string,
	// 	userID: number,
	// ): Promise<'player' | 'viewer'> {
	// 	const game = await getRepository(GameEntity)
	// 		.createQueryBuilder('game')
	// 		.where('game.id = :id', { id: gameID })
	// 		.leftJoinAndSelect('game.players', 'player')
	// 		.where('player.id = :id', { id: userID })
	// 		.getOne();
	// 	return game ? 'player' : 'viewer';
	// }

	async playerUpdate(userID: number, pos: PaddleUpdateDto) {
		for (const game of inPlays) {
			for (const player of game.players) {
				if (player.id === userID) {
					player.update = pos.update;
					return;
				}
			}
		}
	}
}
