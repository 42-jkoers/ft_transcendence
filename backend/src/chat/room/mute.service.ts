import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MuteEntity } from './entities/mute.entity';
import { RoomEntity } from './entities/room.entity';

@Injectable()
export class MuteService {
	constructor(
		@InjectRepository(MuteEntity)
		private readonly muteUserRepository: Repository<MuteEntity>,
	) {}

	async create(
		userId: number,
		muteDeadline: Date,
		room: RoomEntity,
	): Promise<MuteEntity> {
		const mute = this.muteUserRepository.create({
			userId: userId,
			muteDeadline: muteDeadline,
			room: room,
		});
		return await this.muteUserRepository.save(mute);
	}
}
