import { Module, forwardRef } from '@nestjs/common';
import { MainGateway } from '../gateway/main.gateway';
import { MessageModule } from './message/message.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomEntity } from './room/entities/room.entity';
import { User } from '../user/user.entity';
import { UserToRoomEntity } from './room/entities/user.to.room.entity';
import { RoomService } from './room/room.service';
import { AuthModule } from '../auth/auth.module';
import { ConnectedUserService } from './connected-user/connected-user.service';
import { ConnectedUserEntity } from 'src/chat/connected-user/connected-user.entity';
import { MessageService } from './message/message.service';
import { MessageEntity } from './message/message.entity';
import { UserModule } from 'src/user/user.module';
import { GameService } from 'src/game/game.service';
import { GameEntity } from 'src/game/game.entity';

@Module({
	providers: [
		MainGateway,
		RoomService,
		ConnectedUserService,
		MessageService,
		GameService,
	],
	imports: [
		forwardRef(() => AuthModule),
		forwardRef(() => UserModule),
		MessageModule,
		TypeOrmModule.forFeature([
			RoomEntity,
			User,
			UserToRoomEntity,
			ConnectedUserEntity,
			MessageEntity,
			GameEntity,
		]),
	],
	exports: [RoomService],
})
export class ChatModule {}
