import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import User from './user.entity';
import { CreateUserDto, UpdateUserProfileDto } from './dto';
import { UserI } from './user.interface';
import { RoomService } from '../chat/room/room.service';
import { RoomEntity } from 'src/chat/room/entities/room.entity';

@Injectable()
export class UserService {
	constructor(
		private roomService: RoomService,
		@InjectRepository(User)
		private userRepository: Repository<User>,
	) {}

	async findByID(idToFind: number): Promise<UserI> {
		return await this.userRepository.findOne({
			where: { id: idToFind },
		});
	}

	async findByIntraID(intraIDToFind: string): Promise<UserI> {
		return await this.userRepository.findOne({
			where: { intraID: intraIDToFind },
		});
	}

	async findByUserName(userNameToFind: string): Promise<UserI> {
		return await this.userRepository.findOne({
			where: { username: userNameToFind },
		});
	}

	//FIXME: this is a kind of duplicate findOne function to return User entity instead of UserI
	async getUserByID(idToFind: number): Promise<User> {
		return await this.userRepository.findOne({
			where: { id: idToFind },
		});
	}

	async createUser(userData: CreateUserDto): Promise<UserI> {
		// we need to get the default room(which is the public room for all the users) to push the newly created user in there
		// FIXME: this has to be replaced by default admin and default room instantiation right after the db has been connected
		const defaultRoom: RoomEntity = await this.roomService.getDefaultRoom();
		const newUser = this.userRepository.create(userData);
		newUser.friends = [];
		const createdUser: UserI = await this.userRepository.save(newUser);
		await this.roomService.addVisitorToRoom(createdUser.id, defaultRoom);

		//FIXME: temp for testing protected rooms:
		const protectedWithPassword: RoomEntity =
			await this.roomService.findRoomById(2);
		await this.roomService.addVisitorToRoom(
			createdUser.id,
			protectedWithPassword,
		);

		return createdUser;
	}

	async createDefaultUser(): Promise<User> {
		const defaultUserData = {
			intraID: '00000',
			username: 'admin',
			avatar: '/default_avatar.png',
		};
		const defaultUser = this.userRepository.create(defaultUserData);
		defaultUser.friends = [];
		await this.userRepository.save(defaultUser);
		return defaultUser;
	}

	/* return undefined if username is duplicated */
	async updateUserProfile(
		userData: UpdateUserProfileDto,
	): Promise<UserI | undefined> {
		try {
			await this.userRepository.update(userData.id, {
				username: userData.username,
				avatar: userData.avatar,
			});
		} catch (error) {
			return undefined;
		}
		return await this.findByID(userData.id);
	}

	async isFriends(id1: number, id2: number): Promise<boolean> {
		const friend = await this.userRepository
			.createQueryBuilder('user')
			.leftJoinAndSelect('user.friends', 'friend')
			.where('friend.id = :id1', { id1 })
			.andWhere('user.id = :id2', { id2 })
			.getOne();
		return !(friend === undefined);
	}

	async addFriend(user: UserI, friendToAdd: UserI) {
		user.friends = await this.getFriends(user.id);
		user.friends.push(friendToAdd);
		await this.userRepository.save(user);
		friendToAdd.friends = await this.getFriends(friendToAdd.id);
		await this.userRepository.save(friendToAdd);
	}

	async removeFriend(user: UserI, friendToRemove: UserI) {
		const friends = await this.getFriends(user.id);
		user.friends = friends.filter((friend) => {
			return friend.id !== friendToRemove.id;
		});
		await this.userRepository.save(user);
		friendToRemove.friends = await this.getFriends(friendToRemove.id);
		await this.userRepository.save(friendToRemove);
	}

	async getFriends(userId: number): Promise<UserI[]> {
		const friends = await this.userRepository
			.createQueryBuilder('user')
			.leftJoinAndSelect('user.friends', 'friend')
			.where('friend.id = :userId', { userId })
			.getMany();
		return friends;
	}
}
