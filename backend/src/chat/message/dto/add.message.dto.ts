import { IsNumber, IsString, ValidateIf } from 'class-validator';

export class AddMessageDto {
	@IsString()
	text: string;

	@IsString()
	room: { name: string };

	@ValidateIf((obj) => obj.secondUserId !== undefined)
	@IsNumber()
	secondUserId: number;
}
