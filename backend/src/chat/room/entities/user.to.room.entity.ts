import {
	Column,
	Entity,
	ManyToOne,
	PrimaryGeneratedColumn,
	JoinColumn,
} from 'typeorm';
import User from 'src/user/user.entity';
import { RoomEntity } from './room.entity';
import { UserRole } from '../enums/user.role.enum';

@Entity()
export class UserToRoomEntity {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column()
	public userId!: number;

	@Column()
	public roomId!: number;

	@Column()
	public role!: UserRole;

	@ManyToOne(() => User, (user) => user.userToRooms)
	@JoinColumn({ name: 'userId' })
	public user!: User;

	@ManyToOne(() => RoomEntity, (room) => room.userToRooms)
	@JoinColumn({ name: 'roomId' })
	public room!: RoomEntity;
}
