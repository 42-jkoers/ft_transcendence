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
	@IsString()
	@Length(1, 20)
	time: string;

	@Column()
	@IsNumber()
	userId: number;

	@ManyToOne(() => RoomEntity, (room) => room.mutes, { onDelete: 'CASCADE' })
	@JoinColumn()
	room: RoomEntity;
}
