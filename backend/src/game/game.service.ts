import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { GameEntity, PlayerEntry } from './game.entity';
import {
	GameInPlay,
	GameStatus,
	Player,
	Frame,
	PaddleUpdate,
	PaddleUpdateDto,
	Ball,
	Paddle,
	Canvas,
} from './game.dto';
import { Repository, getRepository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import User from 'src/user/user.entity';
import { UserI } from 'src/user/user.interface';

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
		@InjectRepository(PlayerEntry)
		private readonly entryRepository: Repository<PlayerEntry>,
		@InjectRepository(User)
		private userRepository: Repository<User>,
	) {
		// none
	}

	//TODO remove later, this is to simulate some data for query testing
	async seed() {
		//game1 Aileen vs Olga
		const player1 = this.userRepository.create({
			// id: 10,
			username: 'Aileen',
			intraID: '20',
			avatar: '/default_avatar.png',
			socketCount: 1,
		});
		const player2 = this.userRepository.create({
			// id: 11,
			username: 'Olga',
			intraID: '30',
			avatar: '/default_avatar.png',
			socketCount: 1,
		});
		await this.userRepository.save(player1);
		await this.userRepository.save(player2);
		const game1 = this.gameEntityRepository.create({
			created_at: '2022.07.1',
			updated_at: '2022.07.1',
			// score: [1, 4],
		});
		const entry1 = this.entryRepository.create({ score: 2, result: 'won' });
		const entry2 = this.entryRepository.create({
			score: 1,
			result: 'lost',
		});
		entry1.player = player1;
		entry2.player = player2;
		await this.entryRepository.save(entry1);
		await this.entryRepository.save(entry2);
		game1.players = [player1, player2];
		game1.playerEntry = [entry1, entry2];
		await this.gameEntityRepository.save(game1);
		//game2 Xiaojing vs Irem
		const player3 = this.userRepository.create({
			// id: 13,
			username: 'Xiaojing',
			intraID: '40',
			avatar: '/default_avatar.png',
			socketCount: 1,
		});
		const player4 = this.userRepository.create({
			// id: 14,
			username: 'Irem',
			intraID: '50',
			avatar: '/default_avatar.png',
			socketCount: 1,
		});
		await this.userRepository.save(player3);
		await this.userRepository.save(player4);
		const game2 = this.gameEntityRepository.create({
			created_at: '2022.07.2',
			updated_at: '2022.07.4',
			// score: [5, 0],
		});
		const entry3 = this.entryRepository.create({
			score: 1,
			result: 'lost',
		});
		const entry4 = this.entryRepository.create({ score: 4, result: 'won' });
		entry3.player = player3;
		entry4.player = player4;
		await this.entryRepository.save(entry3);
		await this.entryRepository.save(entry4);
		game2.players = [player3, player4];
		game2.playerEntry = [entry3, entry4];
		await this.gameEntityRepository.save(game2);
		const game3 = this.gameEntityRepository.create({
			created_at: '2022.06.30',
			updated_at: '2022.06.30',
			// score: [8, 4],
		});
		const entry5 = this.entryRepository.create({
			score: 4,
			result: 'lost',
		});
		const entry6 = this.entryRepository.create({ score: 7, result: 'won' });
		entry5.player = player1;
		entry6.player = player3;
		await this.entryRepository.save(entry5);
		await this.entryRepository.save(entry6);
		game3.playerEntry = [entry5, entry6];
		game3.players = [player3, player1];
		await this.gameEntityRepository.save(game3);
	}

	async getMatchHistory(UserId: number) {
		// await this.seed(); //TODO this is for testing query purpose only, should be removed later
		const matchHistories = await getRepository(GameEntity)
			.createQueryBuilder('game')
			.leftJoin('game.players', 'player')
			.select(['game.id', 'game.updated_at'])
			.leftJoin('game.playerEntry', 'entry')
			.addSelect(['entry.score', 'entry.result'])
			.leftJoin('entry.player', 'gamer')
			.addSelect(['gamer.username', 'gamer.avatar'])
			.where('player.id = :id', { id: UserId })
			.getMany();
		return matchHistories;
	}

	flattenData(data: GameEntity) {
		return [
			data.id,
			data.playerEntry[0].player.avatar,
			data.playerEntry[0].player.username,
			data.playerEntry[0].score + ':' + data.playerEntry[1].score,
			data.playerEntry[1].player.avatar,
			data.playerEntry[1].player.username,
			data.playerEntry[0].result,
			data.updated_at,
		];
	}

	async createGame(sender: User, receiver: User): Promise<GameEntity> {
		// step 1: create game entity
		const newGame = this.gameEntityRepository.create();
		newGame.name = sender.username + ' vs ' + receiver.username;
		newGame.players = [sender, receiver];

		await this.gameEntityRepository.save(newGame);
		const inPlay: GameInPlay = createGameInPlay(sender.id, newGame.id);
		inPlays.push(inPlay);
		// step 2: set both user isGaming = true
		sender.isGaming = true;
		await this.userRepository.save(sender);
		receiver.isGaming = true;
		await this.userRepository.save(receiver);
		// step 3: remove both user from game invite.
		await this.removeGameInvite(sender, receiver);
		await this.removeGameInvite(receiver, sender);
		// TODO: step 4: remove both user from queue.
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

	async getGameList(): Promise<GameEntity[]> {
		const games = await getRepository(GameEntity)
			.createQueryBuilder('game')
			.leftJoinAndSelect('game.players', 'player')
			.getMany();
		return games;
	}

	async addGameInvite(sender: UserI, receiver: UserI) {
		sender.sentGameInvites = await this.getSentGameInvites(sender.id);
		if (!sender.sentGameInvites) {
			sender.sentGameInvites = [];
		}
		sender.sentGameInvites.push(receiver);
		await this.userRepository.save(sender);
		return sender.sentGameInvites;
	}

	async removeGameInvite(sender: UserI, receiver: UserI) {
		const sentGameInvites = await this.getReceivedGameInvites(sender.id);
		if (sentGameInvites) {
			sender.sentGameInvites = sentGameInvites.filter((request) => {
				return request.id !== receiver.id;
			});
			await this.userRepository.save(sender);
			return sender.sentGameInvites;
		}
	}

	async getReceivedGameInvites(userId: number): Promise<UserI[]> {
		const gameInvites = await this.userRepository
			.createQueryBuilder('user')
			.leftJoinAndSelect('user.sentGameInvites', 'invite')
			.where('invite.id = :userId', { userId })
			.getMany();
		return gameInvites;
	}

	async getSentGameInvites(userId: number): Promise<UserI[]> {
		const user = await this.userRepository
			.createQueryBuilder('user')
			.leftJoinAndSelect('user.sentGameInvites', 'invite')
			.where('user.id = :userId', { userId })
			.getOne();
		return user.sentGameInvites;
	}
}
