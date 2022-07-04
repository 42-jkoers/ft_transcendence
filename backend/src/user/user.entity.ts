import { ConnectedUserEntity } from 'src/chat/connected-user/connected-user.entity';
import { MessageEntity } from 'src/chat/message/message.entity';
import { UserToRoomEntity } from '../chat/room/entities/user.to.room.entity';

import {
	Column,
	Entity,
	JoinColumn,
	JoinTable,
	ManyToMany,
	OneToMany,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { GameEntity } from 'src/game/game.entity';

@Entity()
export class User {
	@PrimaryGeneratedColumn()
	public id?: number;

	@Column({ name: 'intra_ID', unique: true })
	public intraID: string;

	@Column({ unique: true, nullable: true })
	public username: string;

	@Column()
	public avatar: string;

	@Column()
	public socketCount: number;

	@ManyToMany(() => User)
	@JoinTable({ joinColumn: { name: 'sender_id' } })
	requestedFriends: User[];

	@ManyToMany(() => User, { cascade: true })
	@JoinTable({ joinColumn: { name: 'userId_1' } })
	// https://stackoverflow.com/questions/43747765/self-referencing-manytomany-relationship-typeorm
	friends: User[];

	@ManyToMany(() => User, { cascade: true })
	@JoinTable({ joinColumn: { name: 'userId_1' } })
	blocked: User[];

	@JoinColumn()
	@OneToMany(() => ConnectedUserEntity, (connection) => connection.user)
	connections: ConnectedUserEntity[];

	@OneToMany(() => UserToRoomEntity, (userToRoom) => userToRoom.user, {
		cascade: true,
	})
	public userToRooms!: UserToRoomEntity[];

	@OneToMany(() => MessageEntity, (message) => message.user)
	messages: MessageEntity[];

	@Column({ default: false })
	public isTwoFactorAuthEnabled: boolean;

	@Column({ default: false })
	public isTwoFactorAuthenticated: boolean;

	@Column({ nullable: true })
	public twoFactorAuthSecret?: string;
	@ManyToMany(() => GameEntity, (game) => game.players)
	@JoinTable() // the user is the owner of the game
	games: GameEntity[];

	@ManyToMany(() => User)
	@JoinTable({ joinColumn: { name: 'sender_id' } })
	sentGameInvites: User[];

	@Column({ default: false })
	public isGaming: boolean;
}

export default User;
