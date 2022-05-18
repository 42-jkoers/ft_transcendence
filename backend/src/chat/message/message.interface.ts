import { UserI } from "src/user/user.interface";
import { IRoom } from "../room/room.interface";

export interface MessageI {
	id?: number;
	text: string;
	user: UserI;
	room: IRoom;
	created_at: Date;
	updated_at: Date;
}
