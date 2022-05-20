import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoomEntity } from './entities/room.entity';
import { RoomI } from './room.interface';
import { UserI } from 'src/user/user.interface';
import {
	IPaginationOptions,
	paginate,
	Pagination,
} from 'nestjs-typeorm-paginate';

@Injectable()
export class RoomService {
	constructor(
		@InjectRepository(RoomEntity)
		private readonly RoomEntityRepository: Repository<RoomEntity>,
	) {}
	async createRoom(room: RoomI, creator: UserI): Promise<RoomI> {
		const emptyRoom: RoomI = {
			name: room.name,
			visibility: room.visibility, //FIXME: visibiity undefined
			users: [],
		};
		const newRoom = await this.addCreatorToRoom(emptyRoom, creator); // adding current creator to the array of users for this new room

		return this.RoomEntityRepository.save(newRoom); // Saves a given entity in the database. If entity does not exist in the database then inserts, otherwise updates.
	}

	async addCreatorToRoom(room: RoomI, creator: UserI): Promise<RoomI> {
		console.log('passed room from DB: ', room);
		room.users.push(creator);
		return room;
	}

	async getRoomsForUser(
		userId: number,
		options: IPaginationOptions,
	): Promise<Pagination<RoomI>> {
		//build SQL query to get rooms
		// leftJoin will be referencing the property users defined in the RoomEntity.
		const query = this.RoomEntityRepository.createQueryBuilder('room')
			.leftJoin('room.users', 'user')
			.where('user.id = :userId', { userId });

		return paginate(query, options);
	}
}
