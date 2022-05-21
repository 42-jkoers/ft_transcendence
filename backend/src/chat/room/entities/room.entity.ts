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
	PROTECTED,
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

	@ManyToMany(() => User) //  describes relationship: multiple instances of rooms can contain multiple users and vv
	@JoinTable()
	users: User[];

	@OneToMany(() => MessageEntity, (message) => message.room)
	messages: MessageEntity[];
}
