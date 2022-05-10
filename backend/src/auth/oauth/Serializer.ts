import { Injectable } from "@nestjs/common";
import { PassportSerializer } from "@nestjs/passport";
import User from "../../user/user.entity";
import { Done } from "../../user/utils/types"

@Injectable()
export class SessionSerializer extends PassportSerializer {

	serializeUser(user: User, done: Done) {
		console.log('serializeUser')
		done(null, user);
	}

	deserializeUser(user: User, done: Done) {
		let userDb;
		console.log('deserializeUser')
		done(null, userDb);
	}
}
