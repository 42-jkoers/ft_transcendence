import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import User from 'src/user/user.entity';
import {
	CreateDateColumn,
	Entity,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
	ManyToMany,
	Column,
	OneToMany,
	ManyToOne,
	JoinColumn,
} from 'typeorm';

export enum Result {
	WON,
	LOST,
	NO_RESULT,
}

@Entity()
export class GameResultEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToMany(() => User, (user) => user.games)
	players: User[];

	@ValidateNested({ each: true })
	@Type(() => PlayerEntry)
	@OneToMany(() => PlayerEntry, (playerEntry) => playerEntry.game)
	@JoinColumn()
	playerEntry: PlayerEntry[];

	@CreateDateColumn()
	created_at: Date;

	@UpdateDateColumn()
	updated_at: Date;
}

@Entity()
export class PlayerEntry {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	score: number;

	@ManyToOne(() => User, (player) => player.playEntry)
	player: User;

	@Column({ type: 'enum', enum: Result, default: Result.NO_RESULT })
	result: Result;

	@ManyToOne(() => GameResultEntity, (game) => game.playerEntry)
	game: GameResultEntity;
}
