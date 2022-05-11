import User from 'src/user/user.entity';
import {
	Column,
	Entity,
	JoinTable,
	ManyToMany,
	PrimaryGeneratedColumn,
} from 'typeorm';

export enum RoomVisibilityType {
	PUBLIC,
	PRIVATE,
	PROTECTED,
}

@Entity()
export class Room {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

	@Column({
		type: 'enum',
		enum: RoomVisibilityType,
		default: RoomVisibilityType.PUBLIC,
	})
	visibility: RoomVisibilityType;

	@ManyToMany(() => User) //  describes relationship: multiple instances of rooms can contain multiple users and vv
	@JoinTable()
	users: User[];
}
