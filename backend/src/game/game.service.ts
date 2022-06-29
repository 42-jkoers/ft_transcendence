import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { GameEntity } from './game.entity';
import { Repository, getRepository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateGameDto } from './game.dto';
import User from 'src/user/user.entity';

Injectable();
export class GameService {
	constructor(
		@Inject(forwardRef(() => UserService))
		private readonly userService: UserService,
		@InjectRepository(GameEntity)
		private readonly gameEntityRepository: Repository<GameEntity>,
	) {}

	async createGame(
		payload: CreateGameDto,
		creator: User,
	): Promise<GameEntity | null> {
		const newGame: GameEntity = this.gameEntityRepository.create(payload);
		newGame.name = payload.name;
		newGame.players = [creator];
		console.log('created game', newGame);
		await this.gameEntityRepository.save(newGame);
		return newGame;
	}

	async getAllGames(userID: number): Promise<GameEntity[]> {
		const games = await getRepository(GameEntity)
			.createQueryBuilder('game')
			.leftJoinAndSelect('game.players', 'player')
			.where('player.id = :id', { userID })
			.getMany();
		return games;
	}

	async getGameList(): Promise<GameEntity[]> {
		const games = await getRepository(GameEntity)
			.createQueryBuilder('game')
			.leftJoinAndSelect('game.players', 'player')
			.getMany();
		return games;
	}
}
