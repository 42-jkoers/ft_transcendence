import { PassportStrategy } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import { Injectable } from "@nestjs/common";
import { Strategy } from "passport-oauth2"
import AuthService from "../auth.service";
import { HttpService } from "@nestjs/axios";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class OAuthStrategy extends PassportStrategy(Strategy, 'oauth') {
	constructor(
		private readonly config: ConfigService,
		private readonly authService: AuthService,
		private readonly httpService: HttpService,
		private readonly jwtService: JwtService,
		) {
		super ({
			authorizationURL: config.get('INTRA_AUTH_URL'),
			tokenURL: config.get('INTRA_TOKEN_URL'),
			clientID: config.get('INTRA_CLIENT_ID'),
			clientSecret: config.get('INTRA_CLIENT_SECRET'),
			callbackURL: config.get('INTRA_CALLBACK_URL'),
		});
	}

	async validate(accessToken: string, refreshToken: string, profile: any, done: any) {
		const data = await this.httpService.get(this.config.get('INTRA_GET_ME_URL'), {
			headers: { Authorization: `Bearer ${ accessToken }` }, }
		).toPromise();
		const intraID = data.data.id;
		const username = data.data.usual_full_name;
		const validateUserDto = { intraID, username};
		return this.authService.validateUser(validateUserDto);
		// const jwt = await this.jwtService.signAsync({ id: data.data.id });
		// return jwt;
	}
}