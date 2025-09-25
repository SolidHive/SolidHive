import { Test, TestingModule } from '@nestjs/testing';
import { FundraisingsController } from './fundraisings.controller';
import { FundraisingsService } from './fundraisings.service';

describe('FundraisingsController', () => {
  let controller: FundraisingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FundraisingsController],
      providers: [FundraisingsService],
    }).compile();

    controller = module.get<FundraisingsController>(FundraisingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
