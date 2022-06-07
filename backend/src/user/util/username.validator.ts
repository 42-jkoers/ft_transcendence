export class UserNameValidator {
	static isValid(input: string) {
		for (const c of input) {
			if (
				((c >= '0' && c <= '9') ||
					(c >= 'a' && c <= 'z') ||
					(c >= 'A' && c <= 'Z')) === false
			) {
				return false;
			}
		}
		return true;
	}
}
export default UserNameValidator;
