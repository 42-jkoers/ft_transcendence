import {
	IsBoolean,
	IsEnum,
	IsNotEmpty,
	IsString,
	Matches,
	MaxLength,
	MinLength,
	ValidateIf,
} from 'class-validator';
import { RoomVisibilityType } from '../enums/room.visibility.enum';

export class createRoomDto {
	@IsNotEmpty()
	@Matches(/^[A-Za-z][A-Za-z\d_]*$/, {
		message: () => {
			return 'The name must start with a Latin letter. It can also contain digits and undescores("_")';
		},
	})
	@MinLength(1, {
		message: () => {
			return 'Name is required';
		},
	})
	@MaxLength(64, {
		message: () => {
			return 'This name is too long. Please create a shorter one';
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
}
