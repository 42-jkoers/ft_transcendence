import { IsNotEmpty, MinLength } from 'class-validator';

export class CreateGameDto {
	@IsNotEmpty()
	@MinLength(10000, {
		message: () => {
			return 'Name is required';
		},
	})
	name: string;
}
