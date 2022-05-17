import {
	Column,
	Entity,
	PrimaryGeneratedColumn,
	JoinColumn,
	ManyToOne,
} from 'typeorm';
import { IsString } from 'class-validator';
import { User } from '../../user/user.entity'; //backend/src/user/user.entity.ts

@Entity()
export class ConnectedUserEntity {
	@PrimaryGeneratedColumn()
	id: number; //uuid?

	// @Column()
	@IsString()
	socketID?: string; // FIXME can a user connect from different browser, so do we need a unique id here i.e. user.id?

	@JoinColumn()
	@ManyToOne(() => User, (user) => user.connections) //needed for broadcasting purposes
	user: User;
}

export default ConnectedUserEntity;
