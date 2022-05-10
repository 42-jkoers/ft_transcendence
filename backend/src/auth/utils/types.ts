import { User } from "../../user/user.entity"

export type Done = (err: Error, user: User) => void;
