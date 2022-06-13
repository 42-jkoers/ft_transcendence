import { MessageEntity } from 'src/chat/message/message.entity';
import { RoomVisibilityType } from '../enums/room.visibility.enum';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserToRoomEntity } from './user.to.room.entity';
import { Exclude } from 'class-transformer';

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
	@Exclude()
	password: string;

	@OneToMany(() => UserToRoomEntity, (userToRoom) => userToRoom.room, {
		cascade: true,
	})
	public userToRooms!: UserToRoomEntity[];

	@OneToMany(() => MessageEntity, (message) => message.room)
	messages: MessageEntity[];
}
