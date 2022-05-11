import { Room } from 'src/chat/room/entities/room.entity';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
	@PrimaryGeneratedColumn()
	public id?: number;

	@Column({ name: 'intra_ID', unique: true })
	public intraID: string;

	@Column({ unique: true })
	public username: string;

	@Column({ nullable: true })
	public avatar: string;

	@ManyToMany(() => Room, (room) => room.users)
	rooms: Room[];
}

export default User;
