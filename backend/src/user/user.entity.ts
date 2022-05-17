import { ConnectedUserEntity } from 'src/chat/connected-user/connected-user.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
 
@Entity()
export class User {
	@PrimaryGeneratedColumn()
	public id?: number;
	
	@Column({ name: "intra_ID", unique: true })
	public intraID: string;
	
	@Column({ unique: true })
	public username: string;

	@Column({ nullable: true })
	public avatar: string;
	
	@OneToMany(() => ConnectedUserEntity, connection => connection.user)
	connections: ConnectedUserEntity[];

}
 
export default User;
