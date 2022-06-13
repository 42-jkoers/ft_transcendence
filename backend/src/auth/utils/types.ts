import { UserI } from '../../user/user.interface';

export type Done = (err: Error, user: UserI) => void;
