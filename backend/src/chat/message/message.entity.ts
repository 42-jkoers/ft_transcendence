import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/user.entity';
import { RoomEntity } from '../room/entities/room.entity';

@Entity()
export class MessageEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	text: string;

	@ManyToOne(() => User, (user) => user.messages)
	@JoinColumn()
	user: User;

	@ManyToOne(() => RoomEntity, (room) => room.messages)
	@JoinColumn()
	room: RoomEntity;

	@CreateDateColumn()
	created_at: Date;

	@UpdateDateColumn()
	updated_at: Date;
}
