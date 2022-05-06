import { PassportStrategy } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import { Injectable } from "@nestjs/common";
import { UserService } from "../../user/user.service";
import { Strategy } from "passport-oauth2"

@Injectable()
export class OAuthStrategy extends PassportStrategy(Strategy, 'oauth') {
	constructor(
		private readonly config: ConfigService,
		private readonly userService: UserService,
	) {
		super ({
			authorizationURL: config.get('INTRA_AUTH_URL'),
			tokenURL: config.get('INTRA_TOKEN_URL'),
			clientID: config.get('INTRA_CLIENT_ID'),
			clientSecrete: config.get('INTRA_CLIENT_SECRET'),
			callbackURL: config.get('INTRA_CALLBACK_URL'),
		});
	}

	validate(payload: unknown): unknown {
		console.log("this is payload:");
		return payload;
	}

	// async validate(
	// 	payload: {
	// 		sub: number;
	// 		email: string;
	// 	}) {
	// 	const user = await this.userService.getByID(payload.sub);
	// 	return user;
	// }
}
