import { Test, TestingModule } from '@nestjs/testing';
import { EventsPricingsController } from './events-pricings.controller';
import { EventsPricingsService } from './events-pricings.service';

describe('EventsPricingsController', () => {
  let controller: EventsPricingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsPricingsController],
      providers: [EventsPricingsService],
    }).compile();

    controller = module.get<EventsPricingsController>(EventsPricingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
