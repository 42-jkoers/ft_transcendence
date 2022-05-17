import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoomEntity } from './entities/room.entity';
import { IRoom } from './room.interface';
import { IUser } from 'src/user/user.interface';
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
	async createRoom(room: IRoom, creator: IUser): Promise<IRoom> {
		const newRoom = await this.addCreatorToRoom(room, creator); // adding current creator to the array of users for this new room
		return this.RoomEntityRepository.save(newRoom); // Saves a given entity in the database. If entity does not exist in the database then inserts, otherwise updates.
	}

	async addCreatorToRoom(room: IRoom, creator: IUser): Promise<IRoom> {
		room.users.push(creator);
		return room;
	}

	async getRoomsForUser(
		userId: number,
		options: IPaginationOptions,
	): Promise<Pagination<IRoom>> {
		//build SQL query to get rooms
		// leftJoin will be referencing the property users defined in the RoomEntity.
		const query = this.RoomEntityRepository.createQueryBuilder('room')
			.leftJoin('room.users', 'user')
			.where('user.id = :userId', { userId });

		return paginate(query, options);
	}
}
