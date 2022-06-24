import { UserI } from 'src/user/user.interface';

export interface GameI {
	id: number;
	players?: UserI[];
	created_at: Date;
	updated_at: Date;
}
