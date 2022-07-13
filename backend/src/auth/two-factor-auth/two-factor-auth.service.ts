import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { ConfigService } from '@nestjs/config';
import User from 'src/user/user.entity';
import { authenticator } from 'otplib';
import { toFileStream, toDataURL } from 'qrcode';

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
		);
		await this.usersService.setTwoFactorAuthSecret(secret, user.id);
		return {
			secret,
			otpauthUrl,
		};
	}

	public async pipeQrCodeStream(stream: Response, otpauthUrl: string) {
		return toFileStream(stream, otpauthUrl);
	}

	public async serveImage(otpauthUrl: string) {
		toDataURL(otpauthUrl, function (err, qrImage) {
			if (!err) {
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
