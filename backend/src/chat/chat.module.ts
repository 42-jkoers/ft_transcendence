import { Module } from '@nestjs/common';
import { ChatGateway } from './gateway/chat.gateway';
import { ChannelModule } from './channel/channel.module';
import { MessageModule } from './message/message.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomEntity } from './room/entities/room.entity';
import { RoomService } from './room/room.service';
import { AuthModule } from '../auth/auth.module';

@Module({
	providers: [ChatGateway, RoomService],
	imports: [
		ChannelModule,
		MessageModule,
		AuthModule,
		TypeOrmModule.forFeature([RoomEntity]),
	]
})
export class ChatModule {}
