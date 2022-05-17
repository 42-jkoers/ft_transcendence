import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserI } from 'src/user/user.interface';
import { Repository } from 'typeorm';
import { ConnectedUserEntity } from './connected-user.entity';
import { ConnectedUserI } from './connected-user.interface';

@Injectable()
export class ConnectedUserService {
	constructor(
		@InjectRepository(ConnectedUserEntity)
		private readonly connectedUserRepository: Repository<ConnectedUserEntity>, //built-in repo
	) {}
	//create function
	async createConnectedUser(connectedUser: ConnectedUserI,): Promise<ConnectedUserI> {
		//it's already created and this.userService.findOneById helps you get it back in handleConnection;
		return this.connectedUserRepository.save(connectedUser);
	}

	async findByUser(user: UserI): Promise<ConnectedUserI[]> {
		return this.connectedUserRepository.find({ user });
	}

	async deleteBySocketId(socketID: string) {
		return this.connectedUserRepository.delete({ socketID });
	}
}
