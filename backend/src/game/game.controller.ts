import { Controller, UseGuards, Get } from '@nestjs/common';
import { AuthenticatedGuard } from '../auth/oauth/oauth.guard';
import { GameService } from './game.service';

@UseGuards(AuthenticatedGuard)
@Controller('game')
export class GameController {
	constructor(private readonly gameService: GameService) {}

	@Get('list')
	async gameList() {
		const games = await this.gameService.getGameList();
		return games;
	}
}
