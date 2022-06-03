import { MessageEntity } from 'src/chat/message/message.entity';
import User from 'src/user/user.entity';
import {
	Column,
	Entity,
	JoinTable,
	ManyToMany,
	OneToMany,
	PrimaryGeneratedColumn,
} from 'typeorm';

export enum RoomVisibilityType {
	PUBLIC,
	PRIVATE,
}

@Entity()
export class RoomEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ unique: true }) // UNIQUE constraint will maintain the uniqueness of the data in the column
	name: string;

	@Column({
		type: 'enum',
		enum: RoomVisibilityType,
		default: RoomVisibilityType.PUBLIC,
	})
	visibility: RoomVisibilityType;

	@Column({ nullable: true })
	password: string;

	@ManyToMany(() => User, (user) => user.rooms, { cascade: true }) //  describes relationship: multiple instances of rooms can contain multiple users and vv
	@JoinTable() //  is required for @ManyToMany relations. You must put @JoinTable on one (owning) side of relation.
	users: User[];

	@OneToMany(() => MessageEntity, (message) => message.room)
	messages: MessageEntity[];
}
