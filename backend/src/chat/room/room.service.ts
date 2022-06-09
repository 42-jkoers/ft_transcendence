import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getRepository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { RoomEntity, RoomVisibilityType } from './entities/room.entity';
import { RoomI } from './room.interface';
import { UserI } from 'src/user/user.interface';
import { User } from 'src/user/user.entity';
import { UserService } from '../../user/user.service';
import { createRoomDto } from './dto';

@Injectable()
export class RoomService {
	constructor(
		@Inject(forwardRef(() => UserService))
		private readonly userService: UserService,
		@InjectRepository(RoomEntity)
		private readonly RoomEntityRepository: Repository<RoomEntity>, // private readonly UserService: UserService,
	) {}

	async findByName(roomName: string): Promise<RoomI> {
		return await this.RoomEntityRepository.findOne({
			where: { name: roomName },
		});
	}

	async createRoom(
		room: createRoomDto,
		userToAddToRoom: UserI,
	): Promise<{ status: string; data: string }> {
		room.users = [];
		const newRoom = await this.addUserToRoom(room, userToAddToRoom); // adding current creator to the array of users for this new room
		if (room.password !== null) {
			const hash = await this.encryptRoomPassword(room.password);
			room.password = hash;
		}
		const response = {
			status: '',
			data: '',
		};
		try {
			await this.RoomEntityRepository.save(newRoom); // Saves a given entity in the database if the new room name doesn't exist.
			response.status = 'OK';
			response.data = `${newRoom.name}`;
		} catch (err) {
			// if promise rejects (in case the name is not unique,23505 - is the PostrgreSQL error code for unique constraint violation)
			if (err.code === '23505') {
				response.status = 'ERROR';
				response.data = `${newRoom.name}`;
			}
		}
		return response;
	}

	async createDefaultRoom() {
		const defaultUser = await this.userService.createDefaultUser();
		await this.createRoom(
			{
				name: 'general',
				isDirectMessage: false,
				visibility: RoomVisibilityType.PUBLIC,
				password: null,
				users: [],
			},
			defaultUser,
		);
	}

	async updateRoom(roomToUpdate: RoomI) {
		await this.RoomEntityRepository.save(roomToUpdate);
	}

	async addUserToRoom(room: RoomI, userToAddToRoom: UserI): Promise<RoomI> {
		room.users.push(userToAddToRoom);
		return room;
	}

	async getRoomsForUser(userId: number): Promise<RoomI[]> {
		//build SQL query to get rooms
		// leftJoin will be referencing the property 'users' defined in the RoomEntity.
		const userRooms = await getRepository(RoomEntity)
			.createQueryBuilder('room')
			.leftJoinAndSelect('room.users', 'user')
			.where('user.id = :userId', { userId })
			.getMany();
		return userRooms;
	}

	async getUsersForRoom(roomName: string): Promise<UserI[]> {
		const usersInRoom = await getRepository(User)
			.createQueryBuilder('user')
			.leftJoinAndSelect('user.rooms', 'room')
			.where('room.name = :roomName', { roomName })
			.getMany();
		return usersInRoom;
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
