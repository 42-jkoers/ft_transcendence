import { IsEnum, IsNumber, IsString } from 'class-validator';
import { UserRole } from '../enums/user.role.enum';

export class SetRoomRoleDto {
	@IsEnum(UserRole)
	newRole: UserRole;

	@IsNumber()
	userToGetNewRoleId: number;

	@IsString()
	roomName: string;
}
