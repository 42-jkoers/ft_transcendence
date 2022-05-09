import { UserDetails } from "../../user/utils.ts/types";

export interface AuthenticationProvider {
	validateUser(details: UserDetails);
	createUser(details: UserDetails);
	findUser(details: UserDetails);
}
