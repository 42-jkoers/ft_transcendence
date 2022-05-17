import { Injectable } from '@nestjs/common';
import { parse } from 'cookie';
import { ValidateUserDto } from 'src/user/dto';
import { UserService } from '../user/user.service';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import * as redis from 'redis';
import * as connectRedis from 'connect-redis';
import * as session from 'express-session';
import * as util from 'util';

@Injectable()
export class AuthService {
	constructor(
		private readonly userService: UserService,
		private readonly configService: ConfigService,
	) {}
	async validateUser(userDto: ValidateUserDto) {
		const intraID = userDto.intraID;
		const user = await this.userService.findByIntraID(intraID);
		if (user) {
			return user;
		}
		const username = userDto.username;
		const avatar = "default avatar"; // TODO: to change to default image
		const createUserDto = { intraID, username, avatar};
		return this.userService.createUser(createUserDto);
	}

	getUserIDFromCookie(cookieString: string) {
		/* parse session cookie to sid (session id) */
		const parsedCookie = parse(cookieString);
		const decodeSid = cookieParser.signedCookie(parsedCookie['connect.sid'], this.configService.get('SESSION_SECRET'));
		if (!decodeSid) {
			throw new Error('invalid cookie');
		}

		/* set up redis store to be able to retireve session */
		let RedisStore = connectRedis(session);
		let redisClient = redis.createClient({ url: this.configService.get('REDIS_URI')});
		const store = new RedisStore({ client: redisClient });
		
		/*
		** the RedisStore.get() contains callback function, 
		** only way to return user ID if to use new Promise(resolve, reject)
		** see: https://www.youtube.com/watch?v=ranuTFXPgbw&ab_channel=CodingWithChaim
		*/
		return new Promise((resolve, reject) => {
			store.get(String(decodeSid), function(err, sessionInfo) {
				resolve(sessionInfo['passport']['user']['id']);
			})
		});
	}

	async getUserFromCookie(cookieString: string) {
		const userID = await this.getUserIDFromCookie(cookieString);
		return this.userService.findByID(Number(userID));
	}

	}

export default AuthService;
