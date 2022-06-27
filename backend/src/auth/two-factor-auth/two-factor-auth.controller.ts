import {
	Body,
	ClassSerializerInterceptor,
	Controller,
	Get,
	HttpCode,
	Injectable,
	Post,
	Req,
	Res,
	UnauthorizedException,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';
import { UserService } from 'src/user/user.service';
import { RequestWithUser } from '../interface/requestWithUser.interface';
import { TwoFactorAuthService } from './two-factor-auth.service';
import { AuthenticatedGuard } from '../oauth/oauth.guard';
import { TwoFactorAuthCodeDto } from '../dto/twoFactorAuthCode.dto';

@Controller('two-factor-auth')
@UseInterceptors(ClassSerializerInterceptor)
// @Injectable()
export class TwoFactorAuthController {
	constructor(
		private readonly twoFactorAuthenticationService: TwoFactorAuthService,
		private readonly usersService: UserService,
	) {}

	// @Post('generate')
	@Get('generate')
	@UseGuards(AuthenticatedGuard)
	//which guard should I use. if not JwtAuthenticationGuard
	async register(@Res() response: Response, @Req() request: RequestWithUser) {
		//TODO in tutorial, it is an interface of RequestWithUser, why?
		const { otpauthUrl } =
			await this.twoFactorAuthenticationService.generateTwoFactorAuthSecret(
				request.user,
			);
		console.log('url', otpauthUrl);
		// return otpauthUrl;

		//alternative, to serve image instead of pipestream
		// return this.twoFactorAuthenticationService.serveImage(
		// 	response,
		// 	otpauthUrl,
		// );

		return this.twoFactorAuthenticationService.pipeQrCodeStream(
			response,
			otpauthUrl,
		);

		// return otpauthUrl;
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
		// console.log("two factor code input:\n");
		// console.log(twoFactorAuthCode);
		if (!isCodeValid)
			throw new UnauthorizedException('Wrong authentication code');
		await this.usersService.turnOnTwoFactorAuth(request.user.id);
		// return request.user;
	}

	// @Post('authentication')
	// @HttpCode(200)
	// @UseGuards(AuthenticatedGuard)
	// async authenticate(
	// 	@Req() request: RequestWithUser,
	// 	@Body() { twoFactorAuthCode } : TwoFactorAuthCodeDto
	// ) {
	// 	const isCodeValid = this.twoFactorAuthenticationService.VerifyTwoFactorAuthCode(twoFactorAuthCode, request.user);
	// 	if(!isCodeValid)

	// }
}
