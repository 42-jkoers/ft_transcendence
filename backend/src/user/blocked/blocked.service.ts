import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { getRepository, Repository } from 'typeorm';
import User from '../user.entity';
import { UserI } from '../user.interface';
import { UserForClientDto } from '../dto';

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

	async unblockUser(
		userToUnblock: UserI,
		currentUser: UserI,
	): Promise<{ id: number; username: string } | undefined> {
		// console.log("current user ", currentUser,);

		try {
			await this.userRepository
				.createQueryBuilder('user')
				.relation(User, 'blocked')
				.of(currentUser)
				.remove(userToUnblock);
			return { id: userToUnblock.id, username: userToUnblock.username };
		} catch (err) {
			return undefined;
		}
	}

	counter = 0;
	async getBlockedUsers(currentUser: User) {
		const user = await getRepository(User).findOne({
			relations: ['blocked'],
			where: { id: currentUser.id },
		});
		const blockedUsers = user.blocked;
		const usersForClient = await Promise.all(
			blockedUsers.map(async (blockedUser) => {
				return plainToClass(UserForClientDto, blockedUser);
			}),
		);
		return usersForClient;
	}
}
