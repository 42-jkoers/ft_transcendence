import { Type } from 'class-transformer';
import { maxLength, ValidateNested } from 'class-validator';
import User from 'src/user/user.entity';
import {
	CreateDateColumn,
	Entity,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
	ManyToMany,
	Column,
	JoinTable,
	OneToMany,
	ManyToOne,
	JoinColumn,
} from 'typeorm';

// export enum Result {
// 	WON = 'won',
// 	LOST = 'lost',
// }

// TODO: rename to GameHistory, or show that this game has been completed, and rename gameInPlay to game
@Entity()
export class GameEntity {
	@PrimaryGeneratedColumn()
	id: number;

	//TODO why do we need name? @Joppe
	//for now I changed to optional and nullable
	@Column({ nullable: true })
	name?: string;

	//not needed since this will be stored in the playerEntry
	// @Column('int', { array: true })
	// score: number[];

	//TODO why players are not required? @Joppe
	@ManyToMany(() => User, (user) => user.games)
	players?: User[];

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

	// @Column({ type: 'enum', enum: 'Result' })
	@Column()
	result: string;

	@ManyToOne(() => GameEntity, (game) => game.playerEntry)
	game: GameEntity;
}
