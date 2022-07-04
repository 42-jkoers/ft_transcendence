import User from 'src/user/user.entity';
import {
	CreateDateColumn,
	Entity,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
	ManyToMany,
	Column,
} from 'typeorm';

// TODO: rename to GameHistory, or show that this game has been completed, and rename gameInPlay to game
@Entity()
export class GameEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

	@ManyToMany(() => User, (user) => user.games)
	players?: User[];

	@CreateDateColumn()
	created_at: Date;

	@UpdateDateColumn()
	updated_at: Date;
}
