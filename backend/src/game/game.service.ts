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
} from './game.dto';
import { Repository, getRepository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import User from 'src/user/user.entity';

// This is a in memory db of all the games in play
// It is not in the postgres database because in a normal game there will be 60 updates per second
// a postgres cannot keep up with that
const inPlays: GameInPlay[] = [
	{
		id: 1,
		socketRoomID: 'game1',
		status: 1,
		canvas: { height: 300, width: 400 },
		players: [createPlayer(2, 400, 300, 'left')],
	}, // TODO: remove
];

// function collides(ball: Ball, paddle: Paddle): boolean {
// 	return (
// 		ball.x < paddle.x + paddle.width &&
// 		ball.x + ball.radius > paddle.x &&
// 		ball.y < paddle.y + paddle.height &&
// 		ball.y + ball.radius > paddle.y
// 	);
// }

// function updateBall(game: GameInPlay) {
// 	game.ball.x += game.ball.dx;
// 	game.ball.y += game.ball.dy;

// 	// prevent ball from going through walls
// 	if (game.ball.y < game.ball.radius) {
// 		game.ball.y = game.ball.radius;
// 		game.ball.dy *= -1;
// 	} else if (game.ball.y + game.ball.radius > canvas.height - grid) {
// 		game.ball.y = canvas.height - grid * 2;
// 		game.ball.dy *= -1;
// 	}
// }

export function tick(): Frame[] {
	const updates: Frame[] = [];
	for (const game of inPlays) {
		for (const player of game.players) {
			if (player.update !== PaddleUpdate.none) {
				console.log('playerupdate');
				player.paddle.y -= player.update * 5; // TODO: sensitivity
				player.update = 0;
			}
		}

		// TODO: add ball
		// extracting only relevant information
		const frame: Frame = {
			socketRoomID: game.socketRoomID,
			paddles: game.players.map((p) => p.paddle),
		};
		updates.push(frame);
	}
	return updates;
}

function createPlayer(
	id: number,
	canvasWidth: number,
	canvasHeight: number,
	position: 'left' | 'right',
): Player {
	return {
		id,
		score: 0,
		update: PaddleUpdate.none,
		paddle: {
			width: canvasWidth * 0.01,
			height: canvasHeight * 0.05,
			y: canvasHeight * 0.5,
			x:
				position == 'left'
					? canvasWidth * 0.01
					: canvasWidth - canvasWidth * 0.01,
		},
	};
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
		const canvas = {
			height: 300,
			width: 400, // TODO: use fraction instead of absolutes
		};
		const inPlay: GameInPlay = {
			// id: newGame.id,
			id: 1, // For now always referencing the same game in the database because this object will be destroyed on restart
			socketRoomID: `game${newGame.id}`,
			status: GameStatus.PLAYING, // TODO: should be in que
			canvas,
			players: [
				createPlayer(creator.id, canvas.width, canvas.height, 'left'),
				// createPlayer(creator.id, canvas.width, canvas.height, 'right'), // TODO
			],
		};
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

	findInPlayByID(id: number): GameInPlay | null {
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
