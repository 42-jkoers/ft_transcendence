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

	async getUserIDFromCookie(cookieString: string) {
		/* parse session cookie to sid (session id) */
		const parsedCookie = parse(cookieString);
		const decodeSid = cookieParser.signedCookie(parsedCookie['connect.sid'], this.configService.get('SESSION_SECRET'));
		if (!decodeSid) {
			throw new Error('invalid cookie');
		}

		/* retrieve session information from redis store */
		let RedisStore = connectRedis(session);
		let redisClient = redis.createClient({ url: this.configService.get('REDIS_URI')});
		const store = new RedisStore({ client: redisClient, prefix: 'sess:' });
		
		// Method1: use promisify
		// const value = await util.promisify(store.get)(String(decodeSid));
		// console.log(value);
		// return value;
		
		// Method2: use get
		const ret = store.get(String(decodeSid), function(err, reply): Promise<any>  {
			if (err) {
				console.log("err!!!");
			}
			else if (!reply) {
				console.log("Empty!!");
			}
			else {
				const userId = reply['passport']['user']['id'];
				console.log(">> 1. store.get(): ", userId);
				return userId;
			}
		});
		console.log(">> 2. auth service: ", ret);
		return ret;
	}
}

export default AuthService;
