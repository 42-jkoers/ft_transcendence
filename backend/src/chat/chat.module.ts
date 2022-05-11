import { Module } from '@nestjs/common';
import { ChatGateway } from './gateway/chat.gateway';
import { ChannelModule } from './channel/channel.module';
import { MessageModule } from './message/message.module';
import { RoomModule } from './room/room.module';

@Module({
	providers: [ChatGateway],
	imports: [ChannelModule, MessageModule, RoomModule],
})
export class ChatModule {}
