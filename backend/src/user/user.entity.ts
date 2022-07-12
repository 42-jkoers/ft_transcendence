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
import { GameResultEntity, PlayerEntry } from 'src/game/game.entity';
import { PlayerGameStatusType } from 'src/game/playergamestatus.enum';

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

	@ManyToMany(() => GameResultEntity, (game) => game.players)
	@JoinTable({ joinColumn: { name: 'playerId' } }) // the user is the owner of the game
	games: GameResultEntity[];

	@OneToMany(() => PlayerEntry, (playEntry) => playEntry.player)
	@JoinColumn()
	playEntry: PlayerEntry[];

	@ManyToMany(() => User)
	@JoinTable({ joinColumn: { name: 'sender_id' } })
	sentGameInvites: User[];

	//TODO how to set the gameresult all zero?
	@Column({ default: 0 })
	public ladder: number;

	@Column({ default: 0 })
	public wins: number;

	@Column({ default: 0 })
	public loses: number;
	@Column({ default: PlayerGameStatusType.IDLE })
	public gameStatus: PlayerGameStatusType;
}

export default User;
