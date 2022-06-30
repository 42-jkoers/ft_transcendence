import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import User from '../user.entity';
import { UserI } from '../user.interface';

@Injectable()
export class BlockedUsersService {
	constructor(
		@InjectRepository(User)
		private userRepository: Repository<User>,
	) {}

	async blockUser(
		userToBlock: UserI,
		currentUser: UserI,
	): Promise<{ id: number; username: string } | undefined> {
		try {
			await this.userRepository
				.createQueryBuilder('user')
				.relation(User, 'blocked')
				.of(currentUser)
				.add(userToBlock);
			return { id: userToBlock.id, username: userToBlock.username };
		} catch (err) {
			return undefined;
		}
	}
}
