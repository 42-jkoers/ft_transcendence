import { UserI } from "src/user/user.interface";

export type Done = (err: Error, user: UserI) => void;
