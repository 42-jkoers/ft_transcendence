import { IsNumber, IsPositive } from 'class-validator';

export class UserIdDto {
	@IsNumber()
	@IsPositive()
	id: number;
}
