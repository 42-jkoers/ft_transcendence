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
import { MuteEntity } from './entities/mute.entity';
import { MuteService } from './mute.service';

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
		@Inject(forwardRef(() => MuteService))
		private readonly muteService: MuteService,
	) {}

	/***** Find rooms *****/

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
	async findUserToRoomRelationship(
		currentUserId: number,
		roomId: number,
	): Promise<UserToRoomEntity> {
		const userToRoomEntity =
			await this.userToroomEntityRepository.findOneOrFail({
				where: {
					userId: currentUserId,
					roomId: roomId,
				},
			});
		return userToRoomEntity;
	}

	async findRoomAdmin(selectedRoomId: number): Promise<UserToRoomEntity> {
		const adminInRoom = await this.userToroomEntityRepository.findOne({
			where: {
				roomId: selectedRoomId,
				role: UserRole.ADMIN,
			},
		});
		return adminInRoom;
	}

	async findDMRoom(user1Id: number, user2Id: number): Promise<RoomEntity> {
		const dmRoom = await getRepository(RoomEntity)
			.createQueryBuilder('room')
			.leftJoinAndSelect('room.userToRooms', 'userToRooms')
			.where('userToRooms.userId = :userId', {
				userId: user1Id,
			})
			.andWhere('userToRooms.userId = :userId', {
				userId: user2Id,
			})
			.andWhere('room.isDirectMessage = :isDirectMessage', {
				isDirectMessage: true,
			})
			.getOne();
		return dmRoom;
	}

	async isUserInRoom(
		selectedUserId: number,
		selectedRoomId: number,
	): Promise<boolean> {
		const findResult = await this.userToroomEntityRepository.findOne({
			where: {
				userId: selectedUserId,
				roomId: selectedRoomId,
			},
		});
		return findResult ? true : false;
	}

	/***** Create rooms *****/

	async createRoom(
		roomPayload: createRoomDto,
		userIdToAdd: number,
	): Promise<{ status: string; data: string }> {
		const newRoom: RoomEntity = await this.createAndSaveNewRoom(
			roomPayload,
			userIdToAdd,
		);
		return {
			status: newRoom ? 'OK' : 'ERROR',
			data: `${roomPayload.name}`,
		};
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
			const userRole = newRoom.isDirectMessage
				? UserRole.VISITOR
				: UserRole.OWNER;
			await this.createManyToManyRelationship(
				newRoom,
				userIdToAdd,
				userRole,
			);
		} catch (err) {
			// if promise rejects (in case the name is not unique,23505 - is the PostrgreSQL error code for unique constraint violation)
			if (err.code === '23505') {
				return undefined;
			}
		}
		return newRoom;
	}

	async createDirectMessageRoom(
		dMRoom: directMessageDto,
		firstUserId: number,
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
			firstUserId,
		);
		await this.addUserToRoom(dMRoom.userIds[0], newRoom, UserRole.VISITOR);
		const response = plainToClass(RoomForUserDto, newRoom);
		const secondUser = await this.userService.findByID(dMRoom.userIds[0]);
		response.secondParticipant = [secondUser.id, secondUser.username];
		return response;
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
		return defaultRoom;
	}

	async addUserToRoom(
		userToAddId: number,
		room: RoomEntity,
		userRole: UserRole,
	) {
		await this.createManyToManyRelationship(room, userToAddId, userRole);
		await this.roomEntityRepository.save(room);
	}

	/***** Create/remove relationships *****/

	async createManyToManyRelationship(
		newRoom: RoomEntity,
		userIdToAdd: number,
		userRole: UserRole,
	) {
		const userToRoom: UserToRoomEntity =
			this.userToroomEntityRepository.create();
		const user: User = await this.userService.getUserByID(userIdToAdd);
		userToRoom.user = user;
		userToRoom.room = newRoom;
		userToRoom.role = userRole;
		await this.userToroomEntityRepository.save(userToRoom);
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

	/***** Rooms getters *****/

	async getDefaultRoom() {
		let defaultRoom: RoomEntity | undefined = await this.findRoomById(1);
		if (defaultRoom === undefined) {
			defaultRoom = await this.createDefaultRoom();
		}
		return defaultRoom;
	}

	async getSpecificRoomWithUserToRoomRelations(
		roomName: string,
	): Promise<RoomEntity> {
		const specificRoom = await getRepository(RoomEntity)
			.createQueryBuilder('room')
			.where('room.name = :roomName', { roomName })
			.leftJoinAndSelect('room.userToRooms', 'userToRooms')
			.leftJoinAndSelect('userToRooms.user', 'user')
			.getOne();
		return specificRoom;
	}

	async getPublicRoomsList(userId: number) {
		const publicRooms: RoomEntity[] =
			await this.getAllPublicRoomsWithUserRole(userId);
		const response = await this.transformDBDataToDtoForClient(
			publicRooms,
			userId,
		);
		return response;
	}

	// we are looking for all public rooms and also private room where user is part of that room
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
			.orderBy('room.visibility')
			.addOrderBy('room.name')
			.getMany();

		const filteredRooms = userRooms.filter((room) => {
			const found = room.userToRooms.find(
				(relation) => relation.role === UserRole.BANNED,
			);
			if (!found) return room;
		});
		return filteredRooms;
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

	/***** Retrieving users in room *****/

	// this function returns only one user if at least one is there, needed for finding out if room is empty
	async getOneUserLeftInRoom(
		room: RoomEntity,
	): Promise<UserToRoomEntity | undefined> {
		const userNumber = await this.userToroomEntityRepository.findOne({
			where: {
				roomId: room.id,
			},
		});
		return userNumber;
	}

	async getSecondUserInDMRoom(
		currentUserId: number,
		dMRoomId: number,
	): Promise<User> {
		const secondParticipant = await getRepository(User)
			.createQueryBuilder('user')
			.innerJoin('user.userToRooms', 'userToRooms')
			.where('userToRooms.roomId = :dMRoomId', { dMRoomId })
			.andWhere({ id: Not(currentUserId) })
			.getOne();
		return secondParticipant;
	}

	async deleteRoom(room: RoomEntity) {
		await getConnection()
			.createQueryBuilder()
			.delete()
			.from(RoomEntity)
			.where('id = :roomId', { roomId: room.id })
			.execute();
	}

	/***** Password: *****/

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

	async isUserAllowedToViewContent(
		userId: number,
		roomName: string,
	): Promise<boolean> {
		const room: RoomEntity = await this.findRoomByName(roomName);
		if (room.visibility === RoomVisibilityType.PRIVATE || room.password) {
			const isInRoom = await this.isUserInRoom(userId, room.id);
			if (!isInRoom) {
				return false;
			}
		}
		return true;
	}

	/***** User roles: *****/

	async setAdminAsOwner(room: RoomEntity) {
		const admin = await this.findRoomAdmin(room.id);
		if (admin) {
			await this.setUserRole(admin.userId, room.id, UserRole.OWNER);
		}
		return admin;
	}

	async IsUserEligibleToSetRole(
		currentUserId: number,
		roomId: number,
		anotherUserNewRole: UserRole,
	): Promise<boolean> {
		const userToRoomEntity =
			await this.userToroomEntityRepository.findOneOrFail({
				where: {
					userId: currentUserId,
					roomId: roomId,
				},
			});
		if (!userToRoomEntity) return false;
		const currentUserRole = userToRoomEntity.role;
		return (
			currentUserRole === UserRole.OWNER ||
			(currentUserRole === UserRole.ADMIN &&
				anotherUserNewRole > currentUserRole)
		);
	}

	async setUserRole(userId: number, roomId: number, newRole: UserRole) {
		const result = await getConnection()
			.createQueryBuilder()
			.update(UserToRoomEntity)
			.set({ role: newRole })
			.where('userId = :userId', { userId })
			.andWhere('roomId = :roomId', { roomId })
			.execute();
		return result.affected;
	}

	/***** Muting: *****/

	async muteUserInRoom(
		userId: number,
		roomName,
		durationInMinutes: number,
		adminId: number,
	) {
		const roomWithMutes = await getRepository(RoomEntity)
			.createQueryBuilder('room')
			.where('room.name = :roomName', { roomName })
			.leftJoinAndSelect('room.mutes', 'mutes')
			.getOne();

		await this.userService.isOwnerOrAdmin(adminId, roomWithMutes.id);

		const currentDate = new Date();
		const muteLimitEnd = new Date(
			currentDate.getTime() + durationInMinutes * 60000,
		);
		const newMute: MuteEntity = await this.muteService.create(
			userId,
			muteLimitEnd,
			roomWithMutes,
		);
		roomWithMutes.mutes.push(newMute);
		await this.roomEntityRepository.save(roomWithMutes);
		await this.setUserRole(userId, roomWithMutes.id, UserRole.MUTED);
	}

	async checkIfMutedAndMuteDeadlineAndRemoveMute(
		userId: number,
		roomName: string,
	) {
		const room = await getRepository(RoomEntity)
			.createQueryBuilder('room')
			.where('room.name = :roomName', { roomName })
			.leftJoinAndSelect('room.mutes', 'mutes')
			.getOne();
		const muteIndex = room.mutes.findIndex(
			(element) => element.userId == userId,
		);
		const currentDate = new Date();
		if (muteIndex != -1) {
			if (currentDate < room.mutes[muteIndex].muteDeadline) {
				return false;
			} else {
				room.mutes.splice(muteIndex, 1);
				await this.roomEntityRepository.save(room);
				await this.setUserRole(userId, room.id, UserRole.VISITOR);
				return true;
			}
		}
		return true;
	}

	/***** Banning: *****/

	async banUserFromRoom(
		userId: number,
		room: RoomEntity,
		banningUserId: number,
	) {
		await this.userService.isOwnerOrAdmin(banningUserId, room.id);
		const bannedUser = room.bannedUserIds.find(
			(element) => element == userId,
		);
		//check if user is already banned
		if (!bannedUser) {
			// setting user role as banned
			await this.setUserRole(userId, room.id, UserRole.BANNED);
			// add user's id to banned users
			room.bannedUserIds.push(userId);
			await this.roomEntityRepository.save(room);
		}
	}

	async unBanUserFromRoom(userId: number, room: RoomEntity, adminId: number) {
		await this.userService.isOwnerOrAdmin(adminId, room.id);
		//check if user is already banned
		const banIndex = room.bannedUserIds.findIndex(
			(element) => element == userId,
		);
		if (banIndex) {
			room.bannedUserIds.splice(banIndex, 1);
			await this.roomEntityRepository.save(room);
			//setting user a visitor if he has not left the room, otherwise no action taken
			if (await this.isUserInRoom(userId, room.id)) {
				await this.setUserRole(userId, room.id, UserRole.VISITOR);
			}
		}
	}

	async isUserBannedFromRoom(userId: number, room: RoomEntity) {
		const banIndex = room.bannedUserIds.findIndex(
			(element) => element == userId,
		);
		return banIndex === -1 ? false : true;
	}

	async transformDBDataToDtoForClient(
		rooms: RoomEntity[],
		currentUserId: number,
	) {
		const roomsForClient = await Promise.all(
			rooms.map(async (room) => {
				const listedRoom = plainToClass(RoomForUserDto, room);
				if (room.isDirectMessage) {
					const secondParticipant = await this.getSecondUserInDMRoom(
						currentUserId,
						room.id,
					);
					listedRoom.secondParticipant = secondParticipant
						? [secondParticipant.id, secondParticipant.username]
						: [];
					listedRoom.displayName = secondParticipant
						? secondParticipant.username
						: room.name;
				} else {
					listedRoom.displayName = room.name;
				}
				listedRoom.userRole = room.userToRooms[0]?.role; // getting role from userToRooms array
				listedRoom.protected = room.password ? true : false; // we don't pass the password back to user
				return listedRoom;
			}),
		);
		return roomsForClient;
	}
}
