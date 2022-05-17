import { Injectable } from '@nestjs/common';
import { parse } from 'cookie';
import { ValidateUserDto } from 'src/user/dto';
import { UserService } from '../user/user.service';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import * as redis from 'redis';
import * as connectRedis from 'connect-redis';
import * as session from 'express-session';
import User from '../user/user.entity';

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

	parseSessionUserFromCookie(cookieString: string): Promise< User | undefined > {
		/* parse cookie to session id(sid)) */
		const parsedCookie = parse(cookieString);
		const decodeSid = cookieParser.signedCookie(parsedCookie['connect.sid'], this.configService.get('SESSION_SECRET'));
		if (!decodeSid) {
			return null; // invalid cookie string
		}

		/* set up redis store to be able to retireve session */
		let RedisStore = connectRedis(session);
		let redisClient = redis.createClient({ url: this.configService.get('REDIS_URI')});
		const store = new RedisStore({ client: redisClient });

		/*
		** the RedisStore.get() contains callback function,
		** only way to return session info if to use new Promise(resolve, reject)
		** see: https://www.youtube.com/watch?v=ranuTFXPgbw&ab_channel=CodingWithChaim
		*/
		return new Promise((resolve, reject) => {
			store.get(String(decodeSid), function(err, sessionInfo) {
				resolve(sessionInfo['passport']['user']);
			})
		});
	}

	/*
	** return User entity if user is authorized (meaning: logged in)
	** return null if user is not authorized
	*/
	async getUserFromCookie(cookieString: string | undefined) {
		if (cookieString) {
			const sessionUser = await this.parseSessionUserFromCookie(cookieString);
			const userID: number = sessionUser['id'];
			if (userID) {
				return this.userService.findByID(Number(userID));
			}
		}
		return null;
	}


}

export default AuthService;
