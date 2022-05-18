import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import User from './user.entity';
import { CreateUserDto } from './dto';
import { UserI } from './user.interface';

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User)
		private userRepository: Repository<User>,
	) {}

	async findByID(id: number): Promise<UserI> {
		return await this.userRepository.findOne({ id });
	}

	async findByIntraID(intraID: string): Promise<UserI> {
		return await this.userRepository.findOne({ intraID });
	}

	async createUser(userData: CreateUserDto) {
		const newUser = this.userRepository.create(userData);
		return await this.userRepository.save(newUser);
	}
}
