import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getRepository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { RoomEntity } from './entities/room.entity';
import { RoomVisibilityType } from './enums/room.visibility.enum';
import { UserI } from 'src/user/user.interface';
import { User } from 'src/user/user.entity';
import { UserService } from '../../user/user.service';
import { createRoomDto } from './dto';
import { UserToRoomEntity } from './entities/user.to.room.entity';
import { UserRole } from './enums/user.role.enum';

@Injectable()
export class RoomService {
	constructor(
		@Inject(forwardRef(() => UserService))
		private readonly userService: UserService,
		@InjectRepository(RoomEntity)
		private readonly roomEntityRepository: Repository<RoomEntity>,
		@InjectRepository(User)
		private readonly userEntityRepository: Repository<User>,
		@InjectRepository(UserToRoomEntity)
		private readonly userToroomEntityRepository: Repository<UserToRoomEntity>,
	) {}

	async findRoomById(roomId: number): Promise<RoomEntity> {
		return await this.roomEntityRepository.findOne({
			where: { id: roomId },
		});
	}

	async findRoomByName(roomName: string): Promise<RoomEntity> {
		return await this.roomEntityRepository.findOne({
			where: { name: roomName },
		});
	}

	async createNewRoom(
		roomPayload: createRoomDto,
		userToAddToRoom: UserI,
	): Promise<RoomEntity | undefined> {
		const newRoom = this.roomEntityRepository.create(roomPayload);
		newRoom.name = roomPayload.name;
		newRoom.visibility = roomPayload.visibility;
		if (roomPayload.password !== null) {
			newRoom.password = await this.setRoomPassword(roomPayload.password);
		} else {
			newRoom.password = null;
		}
		try {
			await this.roomEntityRepository.save(newRoom); // Saves a given entity in the database if the new room name doesn't exist.
			await this.createManyToManyRelationship(
				newRoom,
				userToAddToRoom,
				UserRole.OWNER,
			);
		} catch (err) {
			// if promise rejects (in case the name is not unique,23505 - is the PostrgreSQL error code for unique constraint violation)
			if (err.code === '23505') {
				return undefined;
			}
		}
		return newRoom;
	}

	//FIXME: create one function that will throw exception which will be caught on frontend
	async createRoom(
		roomPayload: createRoomDto,
		userToAddToRoom: UserI,
	): Promise<{ status: string; data: string }> {
		const newRoom = await this.createNewRoom(roomPayload, userToAddToRoom);
		const response = {
			status: '',
			data: `${newRoom.name}`,
		};
		if (newRoom) {
			response.status = 'OK';
		} else {
			response.status = 'ERROR';
		}
		return response;
	}

	async createManyToManyRelationship(
		newRoom: RoomEntity,
		userToAddToRoom: UserI,
		userRole: UserRole,
	) {
		const userToRoom: UserToRoomEntity =
			this.userToroomEntityRepository.create();
		//FIXME: temp workaround getting user of type UserEntity instead of UserI
		const user: User = await this.userEntityRepository.findOne({
			where: { id: userToAddToRoom.id },
		});
		userToRoom.user = user;
		userToRoom.room = newRoom;
		userToRoom.role = userRole;
		await this.userToroomEntityRepository.save(userToRoom);
	}

	async getDefaultRoom() {
		let defaultRoom: RoomEntity | undefined = await this.findRoomById(1);
		if (defaultRoom === undefined) {
			defaultRoom = await this.createDefaultRoom();
		}
		return defaultRoom;
	}

	async createDefaultRoom() {
		const defaultUser = await this.userService.createDefaultUser();
		return await this.createNewRoom(
			{
				name: 'general',
				isDirectMessage: false,
				visibility: RoomVisibilityType.PUBLIC,
				password: null,
			},
			defaultUser,
		);
	}

	async updateRoom(roomToUpdate: RoomEntity) {
		await this.roomEntityRepository.save(roomToUpdate);
	}

	async addVisitorToRoom(userToAddToRoom: UserI, room: RoomEntity) {
		await this.createManyToManyRelationship(
			room,
			userToAddToRoom,
			UserRole.VISITOR,
		);
	}

	async getRoomsForUser(userId: number): Promise<RoomEntity[]> {
		//build SQL query to get rooms
		// leftJoin will be referencing the property 'users' defined in the RoomEntity.
		const userRooms = await getRepository(RoomEntity)
			.createQueryBuilder('room')
			.leftJoinAndSelect('room.userToRooms', 'userToRooms')
			.leftJoinAndSelect('userToRooms.user', 'user')
			.where('user.id = :userId', { userId })
			.getMany();
		return userRooms;
	}

	async setRoomPassword(roomPassword: string | null): Promise<string | null> {
		if (!roomPassword === null) {
			return null;
		}
		const hash = await this.encryptRoomPassword(roomPassword);
		return hash;
	}

	async encryptRoomPassword(password: string): Promise<string> {
		const saltRounds = 10;
		const hash = await bcrypt.hash(password, saltRounds);
		return hash;
	}

	async compareRoomPassword(
		password: string,
		hash: string,
	): Promise<boolean> {
		const isMatch = await bcrypt.compare(password, hash);
		return isMatch;
	}

	// async unlockProtectedRoom() {}
}
