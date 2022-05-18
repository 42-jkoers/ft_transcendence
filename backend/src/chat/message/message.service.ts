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

	// async findMessagesForRoom(room: RoomI...) {
	//     return paginate(?) //Min 26 in 14/17 video of tutorial
	// }
}
