import { Injectable } from "@nestjs/common";
import { PassportSerializer } from "@nestjs/passport";
import User from "../../user/user.entity";

@Injectable()
export class SessionSerializer extends PassportSerializer {
	// constructor() {
	// 	super();
	// }

	serializeUser(user: User, done: (err: Error, user: User) => void) {
		console.log('serializeUser')
		done(null, user);
	}

	deserializeUser(user: User, done:  (err: Error, user: User) => void) {
		let userDb;
		console.log('deserializeUser')
		done(null, userDb);
	}
}
