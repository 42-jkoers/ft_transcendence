import { Module } from '@nestjs/common';
import { ChatGateway } from './gateway/chat.gateway';
import { ChannelModule } from './channel/channel.module';
import { MessageModule } from './message/message.module';
import { AuthModule } from '../auth/auth.module';
import { ConnectedUserService } from './connected-user/connected-user.service';
import { ConnectedUserEntity } from 'src/chat/connected-user/connected-user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  providers: [ChatGateway, ConnectedUserService],
  imports: [ChannelModule, MessageModule, AuthModule, TypeOrmModule.forFeature([ConnectedUserEntity])],
})
export class ChatModule {}
