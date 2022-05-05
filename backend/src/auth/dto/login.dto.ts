import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
	@IsEmail()
	email: string;

	@IsString()
	@IsNotEmpty()
	password: string;
}

export default LoginDto;
