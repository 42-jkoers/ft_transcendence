import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getRepository } from 'typeorm';
import User from './user.entity';
import { CreateUserDto, ValidateUserDto } from './dto';
import { UserDetails } from './utils.ts/types';
 
@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User)
		private userRepository: Repository<User>,
		) {}

	async findByID(id: number) {
		const user = await this.userRepository.findOne({ id });
		if (user) {
		  return user;
		}
		throw new NotFoundException('User not found'); 
	}

	async findByIntraID(intraID: string) {
		return await this.userRepository.findOne({ intraID });
	}

	createUser(userData: CreateUserDto) {
		const newUser = this.userRepository.create(userData);
		return this.userRepository.save(newUser);
	}

}
