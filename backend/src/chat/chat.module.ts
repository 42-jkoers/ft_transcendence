import { Module } from '@nestjs/common';
import { ChatGateway } from './gateway/chat.gateway';
import { ChannelModule } from './channel/channel.module';
import { MessageModule } from './message/message.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomEntity } from './room/entities/room.entity';
import { RoomService } from './room/room.service';
import { AuthModule } from '../auth/auth.module';
import { ConnectedUserService } from './connected-user/connected-user.service';
import { ConnectedUserEntity } from 'src/chat/connected-user/connected-user.entity';

@Module({
	providers: [ChatGateway, RoomService, ConnectedUserService],
	imports: [
		ChannelModule,
		MessageModule,
		AuthModule,
		TypeOrmModule.forFeature([RoomEntity, ConnectedUserEntity]),
	],
})
export class ChatModule {}
