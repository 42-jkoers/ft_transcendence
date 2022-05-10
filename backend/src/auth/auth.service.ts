import { Injectable } from '@nestjs/common';
import { ValidateUserDto } from 'src/user/dto';
import { UserService } from '../user/user.service';
// import { ConfigService } from '@nestjs/config';
// import { JwtService } from '@nestjs/jwt';
// import * as bcrypt from 'bcrypt';
// import PostgresErrorCode from '../database/postgresErrorCode.enum';
// import { UserService } from '../user/user.service';
// import RegisterDto from './dto/register.dto';


@Injectable()
export class AuthService {
	constructor(
		private readonly userService: UserService,
	) {}
	async validateUser(userDto: ValidateUserDto) {
		const intraID = userDto.intraID;
		const user = await this.userService.findByIntraID(intraID);
		if (user) {
			return user;
		}
		const username = userDto.username;
		const avatar = "default avatar";
		const createUserDto = { intraID, username, avatar};
		return this.userService.createUser(createUserDto);
	}
	
	async createUser(userDto: ValidateUserDto) {
	}

	findUser(details: any) {
	}

}

export default AuthService;
/*
@Injectable()
export class AuthService {
	constructor(
		private readonly userService: UserService,
		private readonly jwt: JwtService,
		private readonly config: ConfigService,
	) {}

	async register(registrationData: RegisterDto) {
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
			return this.signToken(newUser.id, newUser.email);
		} catch (error) {
			if (error?.code === PostgresErrorCode.UniqueViolation) {
				throw new ForbiddenException('User already exists');
			}
			throw error;
		}
	}

	async login(loginDto: LoginDto) {
		try {
			const user = await this.userService.getByEmail(loginDto.email);
			await this.verifyPassword(loginDto.password, user.password);
			user.password = undefined; // TODO: to improve
			return this.signToken(user.id, user.email);
			
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

	async signToken(userId: number, email: string): Promise<{ access_token: string }> {
		const payload = {
			sub: userId,
			email
		};

		const secret = this.config.get('JWT_SECRET');
		const expireTime = this.config.get('JWT_EXPIRATION_TIME');

		const token = await this.jwt.signAsync(
			payload, {
				expiresIn: expireTime,
				secret: secret
			}
		);

		return { access_token: token };
	}
}
*/