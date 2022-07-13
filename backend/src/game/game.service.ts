import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { GameResultEntity, PlayerEntry } from './game.entity';
import {
	GameMode,
	GameStatus,
	OngoingGameDto,
	PaddleUpdateDto,
	MatchHistoryDto,
} from './game.dto';
import { Repository, getRepository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import User from 'src/user/user.entity';
import { UserI } from 'src/user/user.interface';
import { PlayerGameStatusType } from './playergamestatus.enum';
import { Game } from './render';
import { plainToClass } from 'class-transformer';

Injectable();
export class GameService {
	// This is a in memory db of all the games in play
	// It is not in the postgres database because in a normal game there will be 60 updates per second
	// a postgres cannot keep up with that
	private inPlays: Game[] = [];

	constructor(
		@Inject(forwardRef(() => UserService))
		private readonly userService: UserService,
		@InjectRepository(GameResultEntity)
		private readonly gameResultEntityRepository: Repository<GameResultEntity>,
		@InjectRepository(PlayerEntry)
		private readonly entryRepository: Repository<PlayerEntry>,
		@InjectRepository(User)
		private userRepository: Repository<User>,
	) {
		this.userService.resetAllUserGameStatus();
	}

	//TODO remove later, this is to simulate some data for query testing
	async seed() {
		//game1 Aileen vs Olga
		const player1 = this.userRepository.create({
			// id: 10,
			username: 'Aileen',
			intraID: '20',
			avatar: '/default_avatar.png',
		});
		const player2 = this.userRepository.create({
			// id: 11,
			username: 'Olga',
			intraID: '30',
			avatar: '/default_avatar.png',
		});
		await this.userRepository.save(player1);
		await this.userRepository.save(player2);
		const game1 = this.gameResultEntityRepository.create({
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
		await this.gameResultEntityRepository.save(game1);
		//game2 Xiaojing vs Irem
		const player3 = this.userRepository.create({
			// id: 13,
			username: 'Xiaojing',
			intraID: '40',
			avatar: '/default_avatar.png',
		});
		const player4 = this.userRepository.create({
			// id: 14,
			username: 'Irem',
			intraID: '50',
			avatar: '/default_avatar.png',
		});
		await this.userRepository.save(player3);
		await this.userRepository.save(player4);
		const game2 = this.gameResultEntityRepository.create({
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
		await this.gameResultEntityRepository.save(game2);
		const game3 = this.gameResultEntityRepository.create({
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
		await this.gameResultEntityRepository.save(game3);
	}

	async getMatchHistory(UserId: number) {
		await this.seed(); //TODO this is for testing query purpose only, should be removed later
		const matchHistories: GameResultEntity[] = await getRepository(
			GameResultEntity,
		)
			.createQueryBuilder('game')
			.leftJoin('game.players', 'player')
			.select(['game.id', 'game.updated_at'])
			.leftJoin('game.playerEntry', 'entry')
			.addSelect(['entry.score', 'entry.result'])
			.leftJoin('entry.player', 'gamer')
			.addSelect(['gamer.username', 'gamer.avatar', 'gamer.id'])
			.where('player.id = :id', { id: UserId })
			.getMany();
		const response = await this.transformToMatchHistory(
			matchHistories,
			UserId,
		);
		return response;
	}

	async transformToMatchHistory(
		matchHistories: GameResultEntity[],
		UserId: number,
	) {
		const response = await Promise.all(
			matchHistories.map(async (matchHistory) => {
				const historyUnit = plainToClass(MatchHistoryDto, matchHistory);
				if (historyUnit.playerEntry[0].player.id != UserId) {
					console.log(
						'switch',
						historyUnit.playerEntry[0].player.id,
						historyUnit.playerEntry[1].player.id,
					);
					const temp: PlayerEntry = historyUnit.playerEntry[0];
					historyUnit.playerEntry[0] = historyUnit.playerEntry[1];
					historyUnit.playerEntry[1] = temp;
				}
				// console.log('historyUnit response', historyUnit);
				// console.log('player1', historyUnit.playerEntry[0]);
				// console.log('player2', historyUnit.playerEntry[1]);
				return historyUnit;
			}),
		);
		return response;
	}

	flattenData(data: GameResultEntity) {
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

	async createGame(
		sender: User,
		receiver: User,
		mode: GameMode,
	): Promise<GameResultEntity> {
		// step 1: create game entity
		const newGame = this.gameResultEntityRepository.create();
		newGame.name = sender.username + ' vs ' + receiver.username;
		newGame.players = [sender, receiver];
		await this.gameResultEntityRepository.save(newGame);
		const inPlay = new Game([sender.id, receiver.id], newGame.id, mode);
		this.inPlays.push(inPlay);
		// step 2: set both user game status = playing
		sender.gameStatus = PlayerGameStatusType.PLAYING;
		await this.userRepository.save(sender);
		receiver.gameStatus = PlayerGameStatusType.PLAYING;
		await this.userRepository.save(receiver);
		// step 3: remove both user from game invite.
		await this.removeGameInvite(sender, receiver);
		await this.removeGameInvite(receiver, sender);
		return newGame;
	}

	async getAllGames(userID: number): Promise<GameResultEntity[]> {
		const games = await getRepository(GameResultEntity)
			.createQueryBuilder('game')
			.leftJoinAndSelect('game.players', 'player')
			.where('player.id = :id', { id: userID })
			.getMany();
		return games;
	}

	async findByID(id: number): Promise<GameResultEntity | undefined> {
		return await this.gameResultEntityRepository.findOne({
			where: { id },
		});
	}

	findInPlayByID(id: number): Game | undefined {
		return this.inPlays.find((p) => p.id === id);
	}

	// render all the games' frames
	async tick(): Promise<Game[]> {
		const games: Game[] = [];

		for (const game of this.inPlays) {
			if (game.status !== GameStatus.COMPLETED) {
				game.tick(); // render next frame
				games.push(game);
			}
		}
		return games;
	}

	// async getUserType(
	// 	gameID: string,
	// 	userID: number,
	// ): Promise<'player' | 'viewer'> {
	// 	const game = await getRepository(GameResultEntity)
	// 		.createQueryBuilder('game')
	// 		.where('game.id = :id', { id: gameID })
	// 		.leftJoinAndSelect('game.players', 'player')
	// 		.where('player.id = :id', { id: userID })
	// 		.getOne();
	// 	return game ? 'player' : 'viewer';
	// }

	async playerUpdate(userID: number, pos: PaddleUpdateDto) {
		for (const game of this.inPlays) {
			// if the player id is not in the game, it is ignored by the Game class
			game.addUpdate(userID, pos.update);
		}
	}

	// convert Game to OnGoingGameDto
	async gameToOngoingGameDto(
		game: Game,
	): Promise<OngoingGameDto | undefined> {
		if (game && game.id && game.status === GameStatus.PLAYING) {
			const player1 = await this.userService.getUserByID(
				game.paddles[0].userID,
			);
			const player2 = await this.userService.getUserByID(
				game.paddles[1].userID,
			);
			if (player1 && player2) {
				const onGoingGame = {
					id: game.id,
					playerName1: player1.username,
					playerName2: player2.username,
				};
				return onGoingGame;
			}
		} else {
			return undefined;
		}
	}

	async getOngoingGameList(): Promise<OngoingGameDto[]> {
		const onGoingGames = [];
		for (const game of this.inPlays) {
			const onGoingGame = await this.gameToOngoingGameDto(game);
			if (onGoingGame) {
				onGoingGames.push(onGoingGame);
			}
		}
		return onGoingGames;
	}

	async addGameInvite(sender: UserI, receiver: UserI) {
		sender.sentGameInvites = await this.getSentGameInvites(sender.id);
		if (!sender.sentGameInvites) {
			sender.sentGameInvites = [];
		}
		sender.sentGameInvites.push(receiver);
		await this.userRepository.save(sender);
	}

	async removeGameInvite(sender: UserI, receiver: UserI) {
		const sentGameInvites = await this.getSentGameInvites(sender.id);
		if (sentGameInvites) {
			sender.sentGameInvites = sentGameInvites.filter((request) => {
				return request.id !== receiver.id;
			});
			await this.userRepository.save(sender);
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

	async joinQueue(userId: number) {
		await this.userRepository.update(userId, {
			gameStatus: PlayerGameStatusType.QUEUE,
		});
	}

	async quitQueue(userId: number) {
		await this.userRepository.update(userId, {
			gameStatus: PlayerGameStatusType.IDLE,
		});
	}

	async getGameQueue(): Promise<UserI[]> {
		const gameStatus = PlayerGameStatusType.QUEUE;
		const queue = await this.userRepository
			.createQueryBuilder('user')
			.where('user.gameStatus = :gameStatus', { gameStatus })
			.getMany();
		return queue;
	}

	async setGameStatus(userId: number, status: PlayerGameStatusType) {
		await this.userRepository.update(userId, {
			gameStatus: status,
		});
	}

	async getGamePlayers(gameID: number): Promise<UserI[]> {
		const game = await this.gameResultEntityRepository
			.createQueryBuilder('game')
			.leftJoinAndSelect('game.players', 'player')
			.where('game.id = :gameID', { gameID })
			.getOne();
		return game.players;
	}

	async endGame(gameId: number) {
		// step 1: find the game
		const game = this.inPlays.find((game) => {
			if (game.id === gameId) return game;
		});

		if (!game) return;
		// step2: set players status back to IDLE
		const players = await this.getGamePlayers(gameId);
		await this.setGameStatus(players[0].id, PlayerGameStatusType.IDLE);
		await this.setGameStatus(players[1].id, PlayerGameStatusType.IDLE);

		// step 3: create the 2 player entries.
		const player1 = game.paddles[0];
		const player2 = game.paddles[1];

		const newPlayerEntry1 = this.entryRepository.create();
		const newPlayerEntry2 = this.entryRepository.create();

		newPlayerEntry1.score = player1.score;
		newPlayerEntry2.score = player2.score;

		newPlayerEntry1.player = await this.userService.getUserByID(
			player1.userID,
		);
		newPlayerEntry2.player = await this.userService.getUserByID(
			player2.userID,
		);

		const winnerId = game.getWinnerID();
		newPlayerEntry1.result = winnerId === player1.userID ? 'won' : 'lost';
		newPlayerEntry2.result = winnerId === player2.userID ? 'won' : 'lost';

		const gameResult = await this.findByID(gameId);
		newPlayerEntry1.game = gameResult;
		newPlayerEntry2.game = gameResult;

		await this.entryRepository.save(newPlayerEntry1);
		await this.entryRepository.save(newPlayerEntry2);
		// step 3: remove game from ongoing inPlays list.
		this.inPlays = this.inPlays.filter((play) => play.id !== gameId);
		console.log('>> endGame end');
	}
}
