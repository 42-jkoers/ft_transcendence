import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { GameEntity } from './game.entity';
import { GameMode, PaddleUpdateDto } from './game.dto';
import { Repository, getRepository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import User from 'src/user/user.entity';
import { UserI } from 'src/user/user.interface';
import { PlayerGameStatusType } from './playergamestatus.enum';
import { Game } from './render';

Injectable();
export class GameService {
	// This is a in memory db of all the games in play
	// It is not in the postgres database because in a normal game there will be 60 updates per second
	// a postgres cannot keep up with that
	private inPlays: Game[] = [];

	constructor(
		@Inject(forwardRef(() => UserService))
		private readonly userService: UserService,
		@InjectRepository(GameEntity)
		private readonly gameEntityRepository: Repository<GameEntity>,
		@InjectRepository(User)
		private userRepository: Repository<User>,
	) {
		this.userService.resetAllUserGameStatus();
	}

	async createGame(
		sender: User,
		receiver: User,
		mode: GameMode,
	): Promise<GameEntity> {
		// step 1: create game entity
		const newGame = this.gameEntityRepository.create();
		newGame.name = sender.username + ' vs ' + receiver.username;
		newGame.players = [sender, receiver];
		await this.gameEntityRepository.save(newGame);
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

	async getAllGames(userID: number): Promise<GameEntity[]> {
		const games = await getRepository(GameEntity)
			.createQueryBuilder('game')
			.leftJoinAndSelect('game.players', 'player')
			.where('player.id = :id', { id: userID })
			.getMany();
		return games;
	}

	async findByID(id: number): Promise<GameEntity | undefined> {
		return await this.gameEntityRepository.findOne({
			where: { id },
		});
	}

	findInPlayByID(id: number): Game | undefined {
		return this.inPlays.find((p) => p.id === id);
	}

	// render all the games' frames
	async tick(): Promise<Game[]> {
		for (const game of this.inPlays) {
			game.tick(); // render next frame
			// if (game.status === GameStatus.COMPLETED)// TODO: save
		}
		return this.inPlays;
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
		for (const game of this.inPlays) {
			// if the player id is not in the game, it is ignored by the Game class
			game.addUpdate(userID, pos.update);
		}
	}

	async getOngoingGameList(): Promise<GameEntity[]> {
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
		const game = await this.gameEntityRepository
			.createQueryBuilder('game')
			.leftJoinAndSelect('game.players', 'player')
			.where('game.id = :gameID', { gameID })
			.getOne();
		return game.players;
	}

	async endGame(gameId: number) {
		const players = await this.getGamePlayers(gameId);
		await this.setGameStatus(players[0].id, PlayerGameStatusType.IDLE);
		await this.setGameStatus(players[1].id, PlayerGameStatusType.IDLE);

		this.inPlays = this.inPlays.filter((p) => p.id !== gameId);
		// TODO: to update Match History
		const game = await this.findByID(gameId);
		if (game) await this.gameEntityRepository.remove(game);
	}
}
