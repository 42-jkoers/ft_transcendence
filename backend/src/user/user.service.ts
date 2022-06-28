import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getConnection, Not } from 'typeorm';
import User from './user.entity';
import { CreateUserDto, UpdateUserProfileDto } from './dto';
import { UserI } from './user.interface';
import { RoomService } from '../chat/room/room.service';
import { RoomEntity } from 'src/chat/room/entities/room.entity';
import { UserToRoomEntity } from 'src/chat/room/entities/user.to.room.entity';
import ConnectedUserEntity from 'src/chat/connected-user/connected-user.entity';
import { MessageEntity } from 'src/chat/message/message.entity';
import { UserRole } from 'src/chat/room/enums/user.role.enum';

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
		newUser.requestedFriends = [];
		newUser.friends = [];
		const createdUser: UserI = await this.userRepository.save(newUser);
		await this.roomService.addUserToRoom(
			createdUser.id,
			defaultRoom,
			UserRole.VISITOR,
		);

		//FIXME: temp for testing protected rooms:
		const protectedWithPassword: RoomEntity =
			await this.roomService.findRoomById(2);
		await this.roomService.addUserToRoom(
			createdUser.id,
			protectedWithPassword,
			UserRole.VISITOR,
		);

		return createdUser;
	}

	async createDefaultUser(): Promise<User> {
		const defaultUserData = {
			intraID: '00000',
			username: 'admin',
			avatar: '/default_avatar.png',
			socketCount: 0,
		};
		const defaultUser = this.userRepository.create(defaultUserData);
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
				isTwoFactorAuthEnabled: userData.isTwoFactorAuthEnabled,
			});
		} catch (error) {
			return undefined;
		}
		return await this.findByID(userData.id);
	}

	async getSocketCount(userId: number): Promise<number> {
		const user = await this.findByID(userId);
		return user.socketCount;
	}

	async resetAllSocketCount() {
		const userIdList = await this.userRepository
			.createQueryBuilder('user')
			.select(['user.id'])
			.getMany();
		for (let i = 0; i < userIdList.length; ++i) {
			await this.userRepository.update(userIdList[i], {
				socketCount: 0,
			});
		}
	}

	async increaseSocketCount(userId: number): Promise<UserI> {
		const currentSocketCount = await this.getSocketCount(userId);
		await this.userRepository.update(userId, {
			socketCount: currentSocketCount + 1,
		});
		return await this.getUserByID(userId);
	}

	async decreaseSocketCount(userId: number): Promise<UserI> {
		const currentSocketCount = await this.getSocketCount(userId);
		if (currentSocketCount > 0) {
			await this.userRepository.update(userId, {
				socketCount: currentSocketCount - 1,
			});
		}
		return await this.getUserByID(userId);
	}

	async deleteUser(userId: number) {
		await getConnection()
			.createQueryBuilder()
			.delete()
			.from(ConnectedUserEntity)
			.where('userId = :userId', { userId })
			.execute();
		await getConnection()
			.createQueryBuilder()
			.delete()
			.from(MessageEntity)
			.where('userId = :userId', { userId })
			.execute();
		await getConnection()
			.createQueryBuilder()
			.delete()
			.from(UserToRoomEntity)
			.where('userId = :userId', { userId })
			.execute();
		await getConnection()
			.createQueryBuilder()
			.delete()
			.from(User)
			.where('id = :userId', { userId })
			.execute();
	}

	async getAllRegisteredUsersExceptYourselfAndAdmin(
		userName: string,
	): Promise<UserI[]> {
		const userList = await this.userRepository
			.createQueryBuilder('user')
			.where({ username: Not(userName) })
			.andWhere({ username: Not('admin') })
			.getMany();
		return userList;
	}

	// async setTwoFactorAuthenticationSecret(secret: string, username: string) {
	async setTwoFactorAuthSecret(secret: string, id: number) {
		return this.userRepository.update(id, {
			//TODO understand user repository
			twoFactorAuthSecret: secret,
		});
	}

	async updateTwoFactorAuth(id: number, status: boolean) {
		return this.userRepository.update(id, {
			//TODO understand user repository
			isTwoFactorAuthenticated: status,
		});
	}

	async turnOnTwoFactorAuth(userId: number) {
		return this.userRepository.update(userId, {
			isTwoFactorAuthEnabled: true,
		});
	}
}
