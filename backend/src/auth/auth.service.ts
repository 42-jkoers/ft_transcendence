import { ForbiddenException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import PostgresErrorCode from '../database/postgresErrorCode.enum';
import { UserService } from '../user/user.service';
import LoginDto from './dto/login.dto';
import RegisterDto from './dto/register.dto';

@Injectable()
export class AuthService {
	constructor(
		private readonly userService: UserService
	) {}

	public async register(registrationData: RegisterDto) {
		// 1: generate the password hash
		const hashedPassword = await bcrypt.hash(registrationData.password, 10);
		try {
			// 2: save new user in the db
			const newUser = await this.userService.create({
				...registrationData,
				password: hashedPassword
			});
			newUser.password = undefined; // TODO: to improve
			// 3: return the saved user
			return newUser;
		} catch (error) {
			if (error?.code === PostgresErrorCode.UniqueViolation) {
				throw new ForbiddenException('User with this email already exists');
			}
			throw error;
		}
	}

	public async login(loginDto: LoginDto) {
		try {
			const user = await this.userService.getByEmail(loginDto.email);
			await this.verifyPassword(loginDto.password, user.password);
			user.password = undefined; // TODO: to improve
			return user;
			
		} catch (error) {
			throw new ForbiddenException('Wrong credentials provided'); // if email user does not exist
		}
	}
	
	private async verifyPassword(plainTextPassword: string, hashedPassword: string) {
		const isPasswordCorrect = await bcrypt.compare(
			plainTextPassword,
			hashedPassword
		);
		if (!isPasswordCorrect) {
			throw new ForbiddenException('Wrong credentials provided');
		}
	}
}
