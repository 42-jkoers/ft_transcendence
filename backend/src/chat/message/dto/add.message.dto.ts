import { IsNotEmpty, IsNumber, IsString, ValidateIf } from 'class-validator';

export class AddMessageDto {
	@IsString()
	text: string;

	@IsString()
	@IsNotEmpty()
	roomName: string;

	@ValidateIf((obj) => obj.secondUserId !== undefined)
	@IsNumber()
	secondUserId: number;
}
