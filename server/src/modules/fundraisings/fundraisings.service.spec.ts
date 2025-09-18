import { Test, TestingModule } from '@nestjs/testing';
import { FundraisingsService } from './fundraisings.service';

describe('FundraisingsService', () => {
  let service: FundraisingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FundraisingsService],
    }).compile();

    service = module.get<FundraisingsService>(FundraisingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
