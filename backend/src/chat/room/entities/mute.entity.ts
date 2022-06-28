import { IsNumber, IsString, Length } from 'class-validator';
import { RoomEntity } from './room.entity';
import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class MuteEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	@IsNumber()
	userId: number;

	@Column()
	muteDeadline: Date;

	@ManyToOne(() => RoomEntity, (room) => room.mutes, { onDelete: 'CASCADE' })
	@JoinColumn()
	room: RoomEntity;
}
