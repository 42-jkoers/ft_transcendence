import {
	Body,
	ClassSerializerInterceptor,
	Controller,
	Get,
	HttpCode,
	Post,
	Req,
	Res,
	UnauthorizedException,
	UseGuards,
	UseInterceptors,
	Response,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { RequestWithUser } from '../interface/requestWithUser.interface';
import { TwoFactorAuthService } from './two-factor-auth.service';
import { AuthenticatedGuard } from '../oauth/oauth.guard';
import { TwoFactorAuthCodeDto } from '../dto/twoFactorAuthCode.dto';

@Controller('two-factor-auth')
@UseInterceptors(ClassSerializerInterceptor)
export class TwoFactorAuthController {
	constructor(
		private readonly twoFactorAuthenticationService: TwoFactorAuthService,
		private readonly usersService: UserService,
	) {}

	@Get('generate')
	@UseGuards(AuthenticatedGuard)
	async register(@Res() response: Response, @Req() request: RequestWithUser) {
		const { otpauthUrl } =
			await this.twoFactorAuthenticationService.generateTwoFactorAuthSecret(
				request.user,
			);
		return this.twoFactorAuthenticationService.pipeQrCodeStream(
			response,
			otpauthUrl,
		);
	}

	@Post('turn-on')
	@HttpCode(200)
	@UseGuards(AuthenticatedGuard)
	async turnOneTwoFactorAuth(
		@Req() request: RequestWithUser,
		@Body() { twoFactorAuthCode }: TwoFactorAuthCodeDto,
	) {
		const isCodeValid =
			this.twoFactorAuthenticationService.VerifyTwoFactorAuthCode(
				twoFactorAuthCode,
				request.user,
			);
		if (!isCodeValid)
			throw new UnauthorizedException('Wrong authentication code');
		await this.usersService.turnOnTwoFactorAuth(request.user.id);
	}
}
