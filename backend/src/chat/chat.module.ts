import { Module, forwardRef } from '@nestjs/common';
import { MainGateway } from '../gateway/main.gateway';
import { MessageModule } from './message/message.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomEntity } from './room/entities/room.entity';
import { User } from '../user/user.entity';
import { UserToRoomEntity } from './room/entities/user.to.room.entity';
import { RoomService } from './room/room.service';
import { AuthModule } from '../auth/auth.module';
import { MessageService } from './message/message.service';
import { MessageEntity } from './message/message.entity';
import { UserModule } from 'src/user/user.module';
import { GameService } from 'src/game/game.service';
import { GameEntity, PlayerEntry } from 'src/game/game.entity';
import { MuteService } from './room/mute.service';
import { MuteEntity } from './room/entities/mute.entity';
import { BlockedUsersService } from 'src/user/blocked/blocked.service';
import { FriendService } from 'src/user/friend/friend.service';

@Module({
	providers: [
		MainGateway,
		RoomService,
		BlockedUsersService,
		MessageService,
		GameService,
		MuteService,
		FriendService,
	],
	imports: [
		forwardRef(() => AuthModule),
		forwardRef(() => UserModule),
		MessageModule,
		TypeOrmModule.forFeature([
			RoomEntity,
			User,
			UserToRoomEntity,
			MessageEntity,
			GameEntity,
			//TODO checklater see if needed
			PlayerEntry,
			MuteEntity,
		]),
	],
	exports: [RoomService],
})
export class ChatModule {}
