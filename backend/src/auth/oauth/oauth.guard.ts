import { ExecutionContext } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

export class OAuthGuard extends AuthGuard('oauth') {
	async canActivate(context: ExecutionContext): Promise<any> {
		const activate = (await super.canActivate(context)) as boolean;
		console.log(activate);
		const request = context.switchToHttp().getRequest();
		console.log(request);
		await super.logIn(request);
		return activate; 
	}
}

export default OAuthGuard
