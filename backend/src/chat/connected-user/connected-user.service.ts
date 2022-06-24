import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserI } from 'src/user/user.interface';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { ConnectedUserEntity } from './connected-user.entity';
import { ConnectedUserI } from './connected-user.interface';

@Injectable()
export class ConnectedUserService {
	constructor(
		@InjectRepository(ConnectedUserEntity)
		private readonly connectedUserRepository: Repository<ConnectedUserEntity>, //built-in repo
		@Inject(forwardRef(() => UserService))
		private readonly userService: UserService,
	) {}
	//create function
	async createConnectedUser(
		connectedUser: ConnectedUserI,
	): Promise<ConnectedUserI> {
		return this.connectedUserRepository.save(connectedUser);
	}

	async findByUser(user: UserI): Promise<ConnectedUserI[]> {
		return this.connectedUserRepository.find({ user });
	}
	async findByUserId(id: number): Promise<ConnectedUserI[]> {
		const user = await this.userService.findByID(id);
		return this.connectedUserRepository.find({ user });
	}

	async deleteBySocketId(socketID: string) {
		return this.connectedUserRepository.delete({ socketID });
	}
}
