import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import User from '../user.entity';
import { UserI } from '../user.interface';

@Injectable()
export class FriendService {
	constructor(
		@InjectRepository(User)
		private userRepository: Repository<User>,
	) {}

	async isFriends(id1: number, id2: number): Promise<boolean> {
		const friend = await this.userRepository
			.createQueryBuilder('user')
			.leftJoinAndSelect('user.friends', 'friend')
			.where('friend.id = :id1', { id1 })
			.andWhere('user.id = :id2', { id2 })
			.getOne();
		return !(friend === undefined);
	}

	async isUserRequested(userId: number, senderId: number): Promise<boolean> {
		const request = await this.userRepository
			.createQueryBuilder('user')
			.leftJoinAndSelect('user.requestedFriends', 'requested')
			.where('requested.id = :userId', { userId })
			.andWhere('user.id = :senderId', { senderId })
			.getOne();
		return !(request === undefined);
	}

	async addFriendRequest(sender: UserI, receiver: UserI) {
		sender.requestedFriends = await this.getSentFriendRequests(sender.id);
		if (!sender.requestedFriends) {
			sender.requestedFriends = [];
		}
		sender.requestedFriends.push(receiver);
		await this.userRepository.save(sender);
	}

	async removeFriendRequest(sender: UserI, receiver: UserI) {
		const requestedFriends = await this.getReceivedFriendRequests(
			sender.id,
		);
		if (requestedFriends) {
			sender.requestedFriends = requestedFriends.filter((request) => {
				return request.id !== receiver.id;
			});
			await this.userRepository.save(sender);
		}
	}

	async addFriend(user: UserI, friendToAdd: UserI) {
		user.friends = await this.getFriends(user.id);
		if (!user.friends) {
			user.friends = [];
		}
		user.friends.push(friendToAdd);
		await this.userRepository.save(user);
	}

	async removeFriend(user: UserI, friendToRemove: UserI) {
		const friends = await this.getFriends(user.id);
		if (friends) {
			user.friends = friends.filter((friend) => {
				return friend.id !== friendToRemove.id;
			});
			await this.userRepository.save(user);
		}
	}

	async getFriends(userId: number): Promise<UserI[]> {
		const user = await this.userRepository
			.createQueryBuilder('user')
			.leftJoinAndSelect('user.friends', 'friend')
			.where('user.id = :userId', { userId })
			.getOne();
		return user.friends;
	}

	async getReceivedFriendRequests(userId: number): Promise<UserI[]> {
		const friendRequests = await this.userRepository
			.createQueryBuilder('user')
			.leftJoinAndSelect('user.requestedFriends', 'requested')
			.where('requested.id = :userId', { userId })
			.getMany();
		return friendRequests;
	}

	async getSentFriendRequests(userId: number): Promise<UserI[]> {
		const user = await this.userRepository
			.createQueryBuilder('user')
			.leftJoinAndSelect('user.requestedFriends', 'requested')
			.where('user.id = :userId', { userId })
			.getOne();
		return user.requestedFriends;
	}
}
