import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { RoomService } from '../chat/room/room.service';

import { UserController } from './user.controller';
import User from './user.entity';
import { ChatModule } from 'src/chat/chat.module';

@Module({
	imports: [TypeOrmModule.forFeature([User]), ChatModule],
	providers: [UserService],
	controllers: [UserController],
	exports: [UserService],
})
export class UserModule {}
