import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class IntegerDto {
	@IsNotEmpty()
	@IsNumber()
	@IsPositive()
	data: number;
}
