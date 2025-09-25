import { Test, TestingModule } from '@nestjs/testing';
import { EventsPricingsService } from './events-pricings.service';

describe('EventsPricingsService', () => {
  let service: EventsPricingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventsPricingsService],
    }).compile();

    service = module.get<EventsPricingsService>(EventsPricingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
