import {
	Controller,
	Get,
	Post,
	Body,
	UseGuards,
	UseInterceptors,
	UploadedFile,
	Query,
	ParseIntPipe,
	Req,
	HttpException,
	HttpStatus,
} from '@nestjs/common';
import { AuthenticatedGuard } from '../auth/oauth/oauth.guard';
import { UserI } from './user.interface';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Express, Request } from 'express';
import { UploadFileHelper } from './util/uploadfile.helper';
import { DeleteUserDto, UpdateUserProfileDto } from './dto';

@UseGuards(AuthenticatedGuard)
@Controller('user')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Post('profile/update-userprofile')
	async updateUserProfile(@Body() userDto: UpdateUserProfileDto) {
		return await this.userService.updateUserProfile(userDto);
	}

	@Post('avatar')
	@UseInterceptors(
		FileInterceptor('file', {
			storage: diskStorage({
				destination: '../upload',
				filename: UploadFileHelper.customFileName,
			}),
		}),
	)
	async uploadAvatar(@UploadedFile() file: Express.Multer.File) {
		return file.filename;
	}

	@Get('find-by-id?')
	async findUser(@Query('id', ParseIntPipe) id: number) {
		const user: UserI = await this.userService.findByID(id);
		return user;
	}

	@Post('deregister')
	async deregisterUser(@Req() req: Request, @Body() userDto: DeleteUserDto) {
		const user: UserI = req.user;
		if (user.id === userDto.id) {
			await this.userService.deleteUser(userDto.id);
		} else {
			throw new HttpException(
				'User is unauthorized.',
				HttpStatus.UNAUTHORIZED,
			);
		}
	}
}
