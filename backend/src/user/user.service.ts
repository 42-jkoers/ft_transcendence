import { Injectable } from '@nestjs/common';
// import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import User from './user.entity';
import { CreateUserDto } from './dto';
import { UserI } from './user.interface';
import { RoomI } from '../chat/room/room.interface';
import { RoomService } from '../chat/room/room.service';

@Injectable()
export class UserService {
	constructor(
		// @Inject(forwardRef(() => RoomService))
		private roomService: RoomService,
		@InjectRepository(User)
		private userRepository: Repository<User>,
	) {}

	async findByID(idToFind: number): Promise<UserI> {
		return await this.userRepository.findOne({
			where: { id: idToFind },
		});
	}

	async findByIntraID(intraID: string): Promise<UserI> {
		return await this.userRepository.findOne({ intraID });
	}

	async createUser(userData: CreateUserDto): Promise<UserI> {
		// if user entity is empty it will create a default user in db and make him the admin of default room:
		const defaultUser: UserI | undefined = await this.findByID(1);
		if (defaultUser === undefined) {
			await this.roomService.createDefaultRoom();
		}

		const newUser = this.userRepository.create(userData);
		const createdUser: UserI = await this.userRepository.save(newUser);

		const defaultRoom: RoomI = await this.roomService.findByName('general');
		defaultRoom.users = await this.roomService.getUsersForRoom('general');
		defaultRoom.users.push(newUser);
		await this.roomService.updateRoom(defaultRoom);
		return createdUser;
	}

	async createDefaultUser(): Promise<UserI> {
		const defaultUserData = {
			intraID: '00000',
			username: 'admin',
			avatar: 'admin',
		};
		const defaultUser = this.userRepository.create(defaultUserData);
		const createdUser: UserI = await this.userRepository.save(defaultUser);
		return createdUser;
	}

	/* return undefined if username is duplicated */
	async updateUserProfile(
		id: number,
		newName: string,
		newAvatar: string,
	): Promise<UserI | undefined> {
		try {
			await this.userRepository.update(id, {
				username: newName,
				avatar: newAvatar,
			});
		} catch (error) {
			return undefined;
		}
		return await this.findByID(id);
	}

	// async setTwoFactorAuthenticationSecret(secret: string, username: string) {
	async setTwoFactorAuthSecret(secret: string, id: number) {
		return this.userRepository.update(id, {
			twoFactorAuthSecret: secret
		});
	}
}
