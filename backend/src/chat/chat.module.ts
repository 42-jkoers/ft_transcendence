import { Module } from '@nestjs/common';
import { ChatGateway } from './gateway/chat.gateway';
import { ChannelModule } from './channel/channel.module';
import { MessageModule } from './message/message.module';
import { AuthModule } from '../auth/auth.module';
import { ConnectedUserService } from './connected-user/connected-user.service';

@Module({
  providers: [ChatGateway, ConnectedUserService],
  imports: [ChannelModule, MessageModule, AuthModule, ]
})
export class ChatModule {}
