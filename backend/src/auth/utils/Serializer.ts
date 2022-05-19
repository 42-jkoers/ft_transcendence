import { Injectable } from "@nestjs/common";
import { PassportSerializer } from "@nestjs/passport";
import { Done } from "./types";
import User from "../../user/user.entity";
import { UserService } from "../../user/user.service";
import { UserI } from "src/user/user.interface";

@Injectable()
export class SessionSerializer extends PassportSerializer {
	constructor(
		private readonly userService: UserService,
	) {
		super();
	}

	/* passport uses serializeUser function to persist user data (after successful authentication) into session. */
	serializeUser(user: User, done: Done) {
		done(null, user);
	}

	/* 
	** function deserializeUser is used to retrieve user data from session. 
	** the object passed in Done (UserI) will be retrieved by req.user.
	*/
	async deserializeUser(user: User, done: Done) {
		const userDB: UserI = await this.userService.findByIntraID(user.intraID);
		return userDB ? done(null, userDB) : done(null, null);
	}
}
