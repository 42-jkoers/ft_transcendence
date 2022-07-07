import { Injectable, OnModuleInit } from '@nestjs/common';
import { UserService } from './user.service';

// https://docs.nestjs.com/fundamentals/lifecycle-events#usage
// OnModuleInit class is called once all modules have been initialized, but before listening for connections.
@Injectable()
export class InitUsersService implements OnModuleInit {
	constructor(private readonly userService: UserService) {}
	onModuleInit() {
		// for potential use.
	}
}
