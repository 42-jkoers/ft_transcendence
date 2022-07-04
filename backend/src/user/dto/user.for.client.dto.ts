import { Exclude, Expose } from 'class-transformer';

// the dto to keep info that is needed for client part only
@Exclude()
export class UserForClientDto {
	@Expose()
	readonly id: number;

	@Expose()
	readonly username: string;

	@Expose()
	readonly avatar: string;
}
