import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

//TODO remove this ts file later, this is used to log the middleware information
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
	use(req: Request, res: Response, next: NextFunction) {
		console.log('Request body',req.body);
		console.log('Request cookies',req.cookies);
		console.log('Response code', res.statusCode);
		console.log(res.statusMessage);
		next();
	}
}