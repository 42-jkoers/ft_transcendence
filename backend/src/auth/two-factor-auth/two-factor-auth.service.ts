import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { ConfigService } from '@nestjs/config';
import User from 'src/user/user.entity';
import { authenticator } from 'otplib';
import { toFileStream, toDataURL } from 'qrcode';
import { response } from 'express';
import { secureHeapUsed } from 'crypto';

@Injectable()
export class TwoFactorAuthService {
	constructor(
		private readonly usersService: UserService,
		private readonly configService: ConfigService,
	) {}

	public async generateTwoFactorAuthSecret(user: User) {
		const secret = authenticator.generateSecret();
		const otpauthUrl = authenticator.keyuri(
			user.username,
			this.configService.get('TWO_FACTOR_AUTHENTICATION_APP_NAME'),
			secret,
		); //TODO should it be username?
		console.log(secret);
		await this.usersService.setTwoFactorAuthSecret(secret, user.id);
		return {
			secret,
			otpauthUrl, //TODO why return both secret and url instead of only url
		};
	}

	public async pipeQrCodeStream(stream: Response, otpauthUrl: string) {
		return toFileStream(stream, otpauthUrl);
	}

	public async serveImage(response: Response, otpauthUrl: string) {
		toDataURL(otpauthUrl, function (err, qrImage) {
			if (!err) {
				// response.send(qrImage);
				console.log(qrImage);
				return qrImage;
			} else {
				throw new BadRequestException('cannot generate QR');
			}
		});
	}

	public VerifyTwoFactorAuthCode(twoFactorAuthCode: string, user: User) {
		return authenticator.verify({
			token: twoFactorAuthCode,
			secret: user.twoFactorAuthSecret,
		});
	}
}
