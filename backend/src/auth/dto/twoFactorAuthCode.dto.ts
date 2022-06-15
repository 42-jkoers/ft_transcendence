import { IsNotEmpty, IsString } from "class-validator";

export class TwoFactorAuthCodeDto {
	@IsNotEmpty()
	@IsString()
	twoFactorAuthCode: string
}