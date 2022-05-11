import { IsEmail, IsString, IsNotEmpty, MinLength, Matches } from 'class-validator';

export class RegisterDto {
	@IsEmail()
	@IsNotEmpty()
	email: string;

	@IsString()
	@IsNotEmpty()
	name: string;

	@IsString()
	@IsNotEmpty()
	@MinLength(4) // TODO: to change to longer
	password: string;
}

export default RegisterDto;

