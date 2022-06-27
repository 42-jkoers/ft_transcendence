import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OAuthGuard extends AuthGuard('oauth') {
	async canActivate(context: ExecutionContext): Promise<any> {
		const activate = (await super.canActivate(context)) as boolean;
		const request = context.switchToHttp().getRequest();
		await super.logIn(request);
		// console.log('cookies in the open auth', request.cookies);
		// console.log('sessions in the open auth', request.session);
		return activate;
	}
}

@Injectable()
export class AuthenticatedGuard implements CanActivate {
	async canActivate(context: ExecutionContext): Promise<boolean> {
		console.log('pass authentication guard');
		const req = context.switchToHttp().getRequest();
		console.log('result', req.isAuthenticated());
		return req.isAuthenticated();
	}
}
