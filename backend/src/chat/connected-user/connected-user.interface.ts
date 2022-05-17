import { UserI } from "src/user/user.interface";

export interface ConnectedUserI {
    id?: number;
    socketID?: string; //FIXME optional or not?
    user: UserI;
}
