import { Test, TestingModule } from '@nestjs/testing';
import { MainGateway } from './main.gateway';

describe('ChatGateway', () => {
	let gateway: MainGateway;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [MainGateway],
		}).compile();

		gateway = module.get<MainGateway>(MainGateway);
	});

	it('should be defined', () => {
		expect(gateway).toBeDefined();
	});
});
