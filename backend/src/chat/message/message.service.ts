import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageEntity } from './message.entity';
import { MessageI } from './message.interface';

@Injectable()
export class MessageService {
	constructor(
		@InjectRepository(MessageEntity)
		private readonly messageRepository: Repository<MessageEntity>,
	) {}

	async create(message: MessageI): Promise<MessageI> {
		return this.messageRepository.save(
			this.messageRepository.create(message),
		);
	}

	async findMessagesForRoom(roomName: string): Promise<MessageI[]> {
		const query = this.messageRepository
			.createQueryBuilder('message')
			.leftJoinAndSelect('message.room', 'room')
			.where('room.name = :roomName', { roomName })
			.orderBy('message.created_at', 'DESC') //helps to display msg in order
			.getMany();
		return query;
	}
}
