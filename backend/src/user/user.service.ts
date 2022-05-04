import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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

	async getByEmail(email: string) {
		const user = await this.userRepository.findOne({ email });
		if (user) {
		  return user;
		}
		throw new HttpException('User with this email does not exist', HttpStatus.NOT_FOUND);
	}

	async create(userData: CreateUserDto) {
		const newUser = await this.userRepository.create(userData);
		await this.userRepository.save(newUser);
		return newUser;
	}
}
