import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getRepository } from 'typeorm';
import { RoomEntity } from './entities/room.entity';
import { RoomI } from './room.interface';
import { UserI } from 'src/user/user.interface';

@Injectable()
export class RoomService {
	constructor(
		@InjectRepository(RoomEntity)
		private readonly RoomEntityRepository: Repository<RoomEntity>,
	) {}

	async createRoom(
		room: RoomI,
		creator: UserI,
	): Promise<{ status: string; data: string }> {
		const emptyRoom: RoomI = {
			name: room.name,
			visibility: room.visibility, //FIXME: visibiity undefined
			users: [],
		};
		const newRoom = await this.addCreatorToRoom(emptyRoom, creator); // adding current creator to the array of users for this new room
		const response = {
			status: '',
			data: '',
		};
		try {
			await this.RoomEntityRepository.save(newRoom); // Saves a given entity in the database if the new room name doesn't exist.
			response.status = 'OK';
			response.data = `${newRoom.name}`;
		} catch (err) {
			// if promise rejects (in case the name is not unique)
			if (err.code === '23505') {
				response.status = 'ERROR';
				response.data = `${newRoom.name}`;
			}
		}
		return response;
	}

	async addCreatorToRoom(room: RoomI, creator: UserI): Promise<RoomI> {
		room.users.push(creator);
		return room;
	}

	async getRoomsForUser(userId: number): Promise<RoomI[]> {
		//build SQL query to get rooms
		// leftJoin will be referencing the property 'users' defined in the RoomEntity.
		const query = await getRepository(RoomEntity)
			.createQueryBuilder('room')
			.leftJoinAndSelect('room.users', 'users')
			.where('users.id = :userId', { userId })
			.getMany();
		return query;
	}
}
