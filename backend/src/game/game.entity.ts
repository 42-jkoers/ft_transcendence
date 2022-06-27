import User from 'src/user/user.entity';
import {
	CreateDateColumn,
	Entity,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
	ManyToMany,
	Column,
} from 'typeorm';

@Entity()
export class GameEntity {
	@PrimaryGeneratedColumn()
	id: string;

	@Column()
	name: string;

	@ManyToMany(() => User, (user) => user.games)
	players?: User[];

	@CreateDateColumn()
	created_at: Date;

	@UpdateDateColumn()
	updated_at: Date;
}
