import { Injectable } from "@nestjs/common";
import { PassportSerializer } from "@nestjs/passport";
import { Done } from "./types";
import User from "../../user/user.entity";
import { UserService } from "../../user/user.service";

@Injectable()
export class SessionSerializer extends PassportSerializer {
	constructor(
		private readonly userService: UserService,
	) {
		super();
	}

	serializeUser(user: User, done: Done) {
		done(null, user);
	}

	async deserializeUser(user: User, done: Done) {
		const userDB = await this.userService.findByIntraID(user.intraID);
		return userDB ? done(null, userDB) : done(null, null);
	}
}
