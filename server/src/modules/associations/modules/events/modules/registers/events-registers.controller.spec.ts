import { Test, TestingModule } from '@nestjs/testing';
import { EventsRegistersController } from './events-registers.controller';
import { EventsRegistersService } from './events-registers.service';

describe('EventsRegistersController', () => {
  let controller: EventsRegistersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsRegistersController],
      providers: [EventsRegistersService],
    }).compile();

    controller = module.get<EventsRegistersController>(EventsRegistersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
