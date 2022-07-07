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

	async isDirectMessagingBlocked(
		user_1Id: number,
		user_2Id: number,
	): Promise<boolean> {
		// if first user hasn't blocked the second
		if (!(await this.isUserBlockedBy(user_1Id, user_2Id))) {
			return await this.isUserBlockedBy(user_2Id, user_1Id); // return the blocking result of the first user By the second one
		}
		return true; // else means the 1st user has blocked the second
	}

	async isUserBlockedBy(
		userToCheckId: number,
		blockedByUserId: number,
	): Promise<boolean> {
		const blockedUsers = await this.findBlockedForUser(blockedByUserId);
		const blockedUser: User = blockedUsers.find(
			(blocked) => blocked.id === userToCheckId,
		);
		return blockedUser ? true : false;
	}

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

	async findBlockedForUser(userId: number): Promise<User[]> {
		const user = await getRepository(User).findOne({
			relations: ['blocked'],
			where: { id: userId },
		});
		return user.blocked;
	}

	// function finds the list of blocked users for current user and transforms it into list of dto's
	// with the info that client might need(blocked users' ids and usernames)
	async getBlockedUsersList(userId: number): Promise<UserForClientDto[]> {
		const blockedUsers = await this.findBlockedForUser(userId);
		const usersForClient = await Promise.all(
			blockedUsers.map(async (blockedUser) => {
				return plainToClass(UserForClientDto, blockedUser);
			}),
		);
		return usersForClient;
	}
}
