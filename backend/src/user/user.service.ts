import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getRepository } from 'typeorm';
import User from './user.entity';
import CreateUserDto from './dto/createUser.dto';
 
@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User)
		private userRepository: Repository<User>,
		) {}

	// async getByEmail(email: string) {
	// 	const user = await this.userRepository.findOne({ email });
	// 	if (user) {
	// 	  return user;
	// 	}
	// 	throw new NotFoundException('User not found'); 
	// }

	async getByID(id: number) {
		const user = await this.userRepository.findOne({ id });
		if (user) {
		  return user;
		}
		throw new NotFoundException('User not found'); 
	}

	async create(userData: CreateUserDto) {
		const newUser = this.userRepository.create(userData);
		await this.userRepository.save(newUser);
		return newUser;
	}
}
