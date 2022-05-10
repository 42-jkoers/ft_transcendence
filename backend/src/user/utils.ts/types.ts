import { User } from "../user.entity"

export type UserDetails = {
	intraID: string;
	username: string;
};

export type Done = (err: Error, user: User) => void;
