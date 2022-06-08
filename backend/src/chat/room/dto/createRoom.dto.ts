import {
	IsBoolean,
	IsEmpty,
	IsEnum,
	IsNotEmpty,
	IsString,
	Matches,
	MaxLength,
	MinLength,
	ValidateIf,
} from 'class-validator';
import { RoomVisibilityType } from '../entities/room.entity';
import { UserI } from 'src/user/user.interface';

export class createRoomDto {
	@IsNotEmpty()
	@Matches(/^[A-Za-z0-9][A-Za-z0-9 ]*[A-Za-z0-9]*$/, {
		message: () => {
			return 'The name can contain letters of Latin alphabet, digits or whitespace. It cannot start or end with a whitespace.';
		},
	})
	@MinLength(2, {
		message: () => {
			return 'Name is required';
		},
	})
	@MaxLength(64, {
		message: () => {
			return 'The name is too long. Please create a shorter one';
		},
	})
	name: string;

	@IsBoolean()
	isDirectMessage: boolean;

	@IsEnum(RoomVisibilityType)
	visibility: RoomVisibilityType;

	@ValidateIf((obj) => obj.visibility === RoomVisibilityType.PUBLIC)
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

	@IsEmpty()
	users?: UserI[];
}
