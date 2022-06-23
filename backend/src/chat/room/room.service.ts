import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getRepository, getConnection, Not } from 'typeorm';
import { plainToClass } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { RoomEntity } from './entities/room.entity';
import { RoomVisibilityType } from './enums/room.visibility.enum';
import { User } from 'src/user/user.entity';
import { UserService } from '../../user/user.service';
import { createRoomDto, RoomForUserDto } from './dto';
import { directMessageDto } from './dto';
import { UserToRoomEntity } from './entities/user.to.room.entity';
import { UserRole } from './enums/user.role.enum';

@Injectable()
export class RoomService {
	constructor(
		@Inject(forwardRef(() => UserService))
		private readonly userService: UserService,
		@InjectRepository(RoomEntity)
		private readonly roomEntityRepository: Repository<RoomEntity>,
		@InjectRepository(User)
		private readonly userEntityRepository: Repository<User>,
		@InjectRepository(UserToRoomEntity)
		private readonly userToroomEntityRepository: Repository<UserToRoomEntity>,
	) {}

	async findRoomById(roomId: number): Promise<RoomEntity> {
		return await this.roomEntityRepository.findOne({
			where: { id: roomId },
		});
	}

	async findRoomByName(roomName: string): Promise<RoomEntity> {
		return await this.roomEntityRepository.findOne({
			where: { name: roomName },
		});
	}

	async createPrivateChatRoom(
		dMRoom: directMessageDto,
		userIdToAdd: number,
	): Promise<RoomForUserDto | undefined> {
		const id: string = uuid();
		const room: createRoomDto = {
			name: `${id}`,
			isDirectMessage: true,
			visibility: RoomVisibilityType.PRIVATE,
			password: null,
		};
		const newRoom: RoomEntity = await this.createAndSaveNewRoom(
			room,
			userIdToAdd,
		);
		await this.addUserToRoom(dMRoom.userIds[0], newRoom, UserRole.OWNER);
		const response = plainToClass(RoomForUserDto, newRoom);
		const secondUser = await this.userService.findByID(dMRoom.userIds[0]);
		response.secondParticipant = [secondUser.id, secondUser.username];
		return response;
	}

	// emit
	async createRoom(
		roomPayload: createRoomDto,
		userIdToAdd: number,
	): Promise<{ status: string; data: string }> {
		const newRoom: RoomEntity = await this.createAndSaveNewRoom(
			roomPayload,
			userIdToAdd,
		);
		console.log('owner id in create room:', userIdToAdd);
		return { status: newRoom ? 'OK' : 'ERROR', data: `${newRoom.name}` };
	}

	async createAndSaveNewRoom(
		roomPayload: createRoomDto,
		userIdToAdd: number,
	): Promise<RoomEntity | undefined> {
		const newRoom = this.roomEntityRepository.create(roomPayload);
		newRoom.name = roomPayload.name;
		newRoom.visibility = roomPayload.visibility;
		newRoom.isDirectMessage = roomPayload.isDirectMessage;
		newRoom.password = await this.setRoomPassword(roomPayload.password);
		try {
			await this.roomEntityRepository.save(newRoom); // Saves a given entity in the database if the new room name doesn't exist.
			// manyToOne and oneToMany with additional userToRoomEntity makes manyToMany relationship
			await this.createManyToManyRelationship(
				newRoom,
				userIdToAdd,
				UserRole.OWNER,
			);
		} catch (err) {
			// if promise rejects (in case the name is not unique,23505 - is the PostrgreSQL error code for unique constraint violation)
			if (err.code === '23505') {
				return undefined;
			}
		}
		return newRoom;
	}

	async createManyToManyRelationship(
		newRoom: RoomEntity,
		userIdToAdd: number,
		userRole: UserRole,
	) {
		const userToRoom: UserToRoomEntity =
			this.userToroomEntityRepository.create();
		//FIXME: temp workaround getting user of type UserEntity instead of UserI. Will be replaced with UserEntity
		const user: User = await this.userService.getUserByID(userIdToAdd);
		userToRoom.user = user;
		userToRoom.room = newRoom;
		userToRoom.role = userRole;
		await this.userToroomEntityRepository.save(userToRoom);
	}

	async getDefaultRoom() {
		let defaultRoom: RoomEntity | undefined = await this.findRoomById(1);
		if (defaultRoom === undefined) {
			defaultRoom = await this.createDefaultRoom();
		}
		return defaultRoom;
	}

	async createDefaultRoom() {
		const defaultUser = await this.userService.createDefaultUser();
		const defaultRoom: RoomEntity = await this.createAndSaveNewRoom(
			{
				name: 'general',
				isDirectMessage: false,
				visibility: RoomVisibilityType.PUBLIC,
				password: null,
			},
			defaultUser.id,
		);
		await this.createDefaultProtectedRoom();
		return defaultRoom;
	}

	// TODO: remove this temp room for testing protected
	async createDefaultProtectedRoom() {
		const defaultUser: User = await this.userService.getUserByID(1);
		return await this.createAndSaveNewRoom(
			{
				name: 'general protected',
				isDirectMessage: false,
				visibility: RoomVisibilityType.PUBLIC,
				password: '1',
			},
			defaultUser.id,
		);
	}

	async addUserToRoom(
		userToAddId: number,
		room: RoomEntity,
		userRole: UserRole,
	) {
		await this.createManyToManyRelationship(room, userToAddId, userRole);
		await this.roomEntityRepository.save(room);
	}

	async deleteUserRoomRelationship(userToRemoveId: number, room: RoomEntity) {
		await getConnection()
			.createQueryBuilder()
			.delete()
			.from(UserToRoomEntity)
			.where('userId = :userToRemoveId and roomId = :roomId', {
				userToRemoveId,
				roomId: room.id,
			})
			.execute();
		await this.roomEntityRepository.save(room);
	}

	async getNonCurrentUserInDMRoom(
		currentUserId: number,
		dMRoomId: number,
	): Promise<User> {
		console.log('currentUserId, ', currentUserId);
		console.log('dMRoomId, ', dMRoomId);

		const secondParticipant = await getRepository(User)
			.createQueryBuilder('user')
			.leftJoin('user.userToRooms', 'userToRooms')
			.where('userToRooms.roomId = :dMRoomId', { dMRoomId })
			.andWhere({ id: Not(currentUserId) })
			.getOne();
		console.log('secondParticipant', secondParticipant);
		return secondParticipant;
	}

	async getAllPublicRoomsWithUserRole(userId: number): Promise<RoomEntity[]> {
		const userRooms = await getRepository(RoomEntity)
			.createQueryBuilder('room')
			// conditional 'join'; joins userToRooms if the condition 'userToRooms.userId = :userId' is true
			// if user is not in the room leftjoin returns null and [] is empty
			.leftJoinAndSelect(
				'room.userToRooms',
				'userToRooms',
				'userToRooms.userId = :userId',
				{
					userId,
				},
			)
			.where(
				'room.visibility = :publicRoom or userToRooms.userId is not null',
				{
					publicRoom: RoomVisibilityType.PUBLIC,
				},
			)
			.orderBy('userToRooms.role')
			.addOrderBy('room.name')
			.getMany();
		return userRooms;
	}

	async getRoomsForUser(userId: number): Promise<RoomEntity[]> {
		//build SQL query to get rooms
		// leftJoin will be referencing the property 'users' defined in the RoomEntity.
		const userRooms = await getRepository(RoomEntity)
			.createQueryBuilder('room')
			.leftJoinAndSelect('room.userToRooms', 'userToRooms')
			.leftJoinAndSelect('userToRooms.user', 'user')
			.where('user.id = :userId', { userId })
			.getMany();
		return userRooms;
	}

	async updateRoomPassword(room: RoomEntity, newPassword: string | null) {
		room.password = await this.setRoomPassword(newPassword);
		await this.roomEntityRepository.save(room);
	}

	async setRoomPassword(roomPassword: string | null): Promise<string | null> {
		if (!roomPassword) {
			return null;
		}
		const hash = await this.encryptRoomPassword(roomPassword);
		return hash;
	}

	async encryptRoomPassword(password: string): Promise<string> {
		const saltRounds = 10;
		const hash = await bcrypt.hash(password, saltRounds);
		return hash;
	}

	async compareRoomPassword(
		password: string,
		hash: string,
	): Promise<boolean> {
		const isMatch = await bcrypt.compare(password, hash);
		return isMatch;
	}
}
