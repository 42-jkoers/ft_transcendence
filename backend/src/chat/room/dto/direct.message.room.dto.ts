import { IsArray, IsBoolean, ValidateIf } from 'class-validator';

export class directMessageDto {
	@IsBoolean()
	isDirectMessage: boolean;

	// conditional validation:
	@ValidateIf((obj) => obj.isDirectMessage === true)
	@IsArray()
	userIds: number[];
}
