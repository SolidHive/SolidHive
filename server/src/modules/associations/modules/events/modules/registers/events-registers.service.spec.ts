import { Test, TestingModule } from '@nestjs/testing';
import { EventsRegistersService } from './events-registers.service';

describe('EventsRegistersService', () => {
  let service: EventsRegistersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventsRegistersService],
    }).compile();

    service = module.get<EventsRegistersService>(EventsRegistersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
