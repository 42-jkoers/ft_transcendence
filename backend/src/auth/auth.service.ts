import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import PostgresErrorCode from 'src/database/postgresErrorCode.enum';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
	constructor(
		private readonly userService: UserService
	) {}

	public async register(registrationData: RegisterDto) {
		// step 1: generate the password hash
		const hashedPassword = await bcrypt.hash(registrationData.password, 10);
		try {
			// step 2: save new user in the db
			const newUser = await this.userService.create({
				...registrationData,
				password: hashedPassword
			});
			newUser.password = undefined; // TODO: to improve
			// step 3: return the saved user
			return newUser;
		} catch (error) {
			if (error?.code === PostgresErrorCode.UniqueViolation) {
				throw new HttpException('User with this email already exists', HttpStatus.BAD_REQUEST);
			}
			throw error;
		}
	}
}
