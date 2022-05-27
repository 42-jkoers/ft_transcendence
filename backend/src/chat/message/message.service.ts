import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// import { RoomI } from '../room/room.interface';
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
			.where('room.name = :name', { name: roomName })
			// .leftJoinAndSelect('message.user', 'user')
			// .orderBy('message.created_at', 'DESC')
			.getMany();
		return query;
	}

	// findAll() {
	// 	return `This action returns all Message`;
	// }

	// findOne(id: number) {
	// 	return `This action returns a #${id} Message`;
	// }

	// update(id: number, updateMessageDto: UpdateMessageDto) {
	// 	return `This action updates a #${id} Message`;
	// }

	// remove(id: number) {
	// 	return `This action removes a #${id} Message`;
	// }
}
