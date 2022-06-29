import {
	IsString,
	IsNotEmpty,
	MinLength,
	MaxLength,
	Matches,
} from 'class-validator';

export class UpdateUserProfileDto {
	id: number;

	@IsString()
	@IsNotEmpty()
	@MinLength(1)
	@MaxLength(15)
	@Matches(/^[A-Za-z0-9][A-Za-z0-9 ]*[A-Za-z0-9]$/) // only allow digit and alphabet letters, with space in between (not first/last)
	username: string;

	@IsString()
	@IsNotEmpty()
	avatar: string;

	isTwoFactorAuthEnabled: boolean;
}
