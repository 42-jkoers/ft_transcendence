import { Injectable } from '@nestjs/common';
import { parse } from 'cookie';
import { ValidateUserDto } from 'src/user/dto';
import { UserService } from '../user/user.service';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import * as redis from 'redis';
import * as connectRedis from 'connect-redis';
import * as session from 'express-session';
import { UserI } from '../user/user.interface';

@Injectable()
export class AuthService {
	constructor(
		private readonly userService: UserService,
		private readonly configService: ConfigService,
	) {}

	/*
	 ** if user is already in database: return user if it's already registered
	 ** if user is not yet in database: create new user (with empty username and default avatar)
	 */
	async validateUser(userDto: ValidateUserDto): Promise<UserI> {
		const user = await this.userService.findByIntraID(userDto.intraID);
		if (user) {
			return user;
		}
		return await this.registerUser(userDto.intraID);
	}

	private async registerUser(intraID: string): Promise<UserI> {
		const username = null;
		const avatar = '/default_avatar.png';
		const createUserDto = { intraID, username, avatar };
		return await this.userService.createUser(createUserDto);
	}

	parseSessionUserFromCookie(cookieString: string): Promise<UserI> {
		/* parse cookie to session id(sid)) */
		const parsedCookie = parse(cookieString); // return empty object if cookieString is incorrect
		const sid = parsedCookie['connect.sid']; // return undefined if no 'connect.sid' present
		const secret = this.configService.get('SESSION_SECRET');
		const decodeSid = cookieParser.signedCookie(sid, secret);
		if (!decodeSid) {
			throw new Error('invalid cookie'); // invalid cookie string
		}

		/* set up redis store to be able to retireve session */
		const RedisStore = connectRedis(session);
		const redisClient = redis.createClient({
			url: this.configService.get('REDIS_URI'),
		});
		const store = new RedisStore({ client: redisClient });

		/*
		 ** the RedisStore.get() contains callback function,
		 ** only way to return session info if to use new Promise(resolve, reject)
		 ** see: https://www.youtube.com/watch?v=ranuTFXPgbw&ab_channel=CodingWithChaim
		 */
		return new Promise((resolve) => {
			store.get(String(decodeSid), function (err, sessionInfo) {
				resolve(sessionInfo['passport']['user']);
			});
		});
	}

	/*
	 ** return UserInterface if user is authorized (meaning: logged in)
	 ** return undefined if user is not authorized
	 */
	async getUserFromCookie(
		cookieString: string | undefined,
	): Promise<UserI | undefined> {
		try {
			const sessionUser = await this.parseSessionUserFromCookie(
				cookieString,
			);
			const userID = sessionUser['id'];
			return this.userService.findByID(userID);
		} catch (error) {
			return undefined;
		}
	}
}

export default AuthService;
