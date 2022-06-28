export class AddMessageDto {
	text: string;
	room: { name: string };
	secondUserId: number | undefined;
}
