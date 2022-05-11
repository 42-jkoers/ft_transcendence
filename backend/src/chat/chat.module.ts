import { Module } from '@nestjs/common';
import { ChatGateway } from './gateway/chat.gateway';
import { ChannelModule } from './channel/channel.module';
import { MessageModule } from './message/message.module';

@Module({
  providers: [ChatGateway],
  imports: [ChannelModule, MessageModule]
})
export class ChatModule {}
