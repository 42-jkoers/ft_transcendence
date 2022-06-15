// import { Request } from "express";
import User from "src/user/user.entity";
import { Request } from "@nestjs/common";

export interface RequestWithUser extends Request {
	user: User;
}