import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import User from './user.entity';
import { ChatModule } from 'src/chat/chat.module';
import { FriendService } from './friend/friend.service';
import { FriendController } from './friend/friend.controller';
import { InitUsersService } from './init.user.service';

@Module({
	imports: [TypeOrmModule.forFeature([User]), ChatModule],
	providers: [UserService, FriendService, InitUsersService],
	controllers: [UserController, FriendController],
	exports: [UserService],
})
export class UserModule {}
