import { IsNotEmpty, IsString, MaxLength, ValidateIf } from 'class-validator';

export class RoomPasswordDto {
	@IsString()
	@IsNotEmpty()
	roomName: string;

	@ValidateIf((obj) => {
		return obj && obj.password !== null;
	})
	@IsString()
	@MaxLength(64, {
		message: () => {
			return 'This password is too long. Please create a shorter one';
		},
	}) // Maximum password length should not be set too low, as it will prevent users from creating passphrases
	password: string;
}
