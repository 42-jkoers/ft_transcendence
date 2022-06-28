import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomEntity } from 'src/chat/room/entities/room.entity';
import { UserToRoomEntity } from 'src/chat/room/entities/user.to.room.entity';
import { RoomService } from 'src/chat/room/room.service';
import User from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { GameController } from './game.controller';
import { GameEntity } from './game.entity';
import { GameService } from './game.service';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			GameEntity,
			User,
			RoomEntity,
			UserToRoomEntity,
		]),
	],
	controllers: [GameController],
	providers: [GameService, UserService, RoomService],
})
export class GameModule {}
