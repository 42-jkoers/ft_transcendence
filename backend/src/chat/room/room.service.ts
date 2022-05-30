import { forwardRef, Inject, Injectable } from '@nestjs/common';
// import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getRepository } from 'typeorm';
// import { RoomEntity, RoomVisibilityType } from './entities/room.entity';
import { RoomEntity } from './entities/room.entity';
import { RoomI } from './room.interface';
import { UserI } from 'src/user/user.interface';
import { UserService } from '../../user/user.service';

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
		room: RoomI,
		userToAddToRoom: UserI,
	): Promise<{ status: string; data: string }> {
		room.users = [];
		const newRoom = await this.addUserToRoom(room, userToAddToRoom); // adding current creator to the array of users for this new room
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

	async addUserToRoom(room: RoomI, userToAddToRoom: UserI): Promise<RoomI> {
		room.users.push(userToAddToRoom);
		return room;
	}

	async getRoomsForUser(userId: number): Promise<RoomI[]> {
		//build SQL query to get rooms
		// leftJoin will be referencing the property 'users' defined in the RoomEntity.
		const query = await getRepository(RoomEntity)
			.createQueryBuilder('room')
			.leftJoinAndSelect('room.users', 'user')
			.where('user.id = :userId', { userId })
			.getMany();
		return query;
	}
}
