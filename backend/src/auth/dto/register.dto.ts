import { IsEmail, IsString, IsNotEmpty, MinLength } from 'class-validator';

//TODO @Aileen do we need this?
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
