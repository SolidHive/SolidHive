import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventsPricingsService } from './events-pricings.service';
import { EventPricing } from './entities/event-pricing.entity';
import { Event } from '../../entities/event.entity';

describe('EventsPricingsService', () => {
  let service: EventsPricingsService;

  const eventPricingRepositoryMock = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const eventRepositoryMock = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsPricingsService,
        { provide: getRepositoryToken(EventPricing), useValue: eventPricingRepositoryMock },
        { provide: getRepositoryToken(Event), useValue: eventRepositoryMock },
      ],
    }).compile();

    service = module.get<EventsPricingsService>(EventsPricingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('crée un tarif d événement', async () => {
      const dto = { name: 'Tarif Normal', amount: 100 };
      const event = { id: 'event-1' };
      const created = { ...dto, eventId: 'event-1' };
      const saved = { id: 'pricing-1', ...created };

      eventRepositoryMock.findOne.mockResolvedValue(event);
      eventPricingRepositoryMock.create.mockReturnValue(created);
      eventPricingRepositoryMock.save.mockResolvedValue(saved);

      const result = await service.create(dto as any, 'event-1');

      expect(eventPricingRepositoryMock.save).toHaveBeenCalled();
      expect(result).toEqual(saved);
    });
  });

  describe('findAll', () => {
    it('retourne tous les tarifs d un événement', async () => {
      const pricings = [{ id: 'pricing-1', name: 'Tarif Normal' }];
      eventPricingRepositoryMock.find.mockResolvedValue(pricings);

      const _result = await service.findAll('event-1');

      expect(eventPricingRepositoryMock.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('retourne un tarif par id', async () => {
      const pricing = { id: 'pricing-1', name: 'Tarif Normal' };
      eventPricingRepositoryMock.findOne.mockResolvedValue(pricing);

      const result = await service.findOne('pricing-1', 'event-1');

      expect(result).toEqual(pricing);
    });
  });

  describe('update', () => {
    it('met à jour un tarif', async () => {
      const updateDto = { amount: 150 };
      const updated = { id: 'pricing-1', name: 'Tarif Normal', ...updateDto };
      eventPricingRepositoryMock.update.mockResolvedValue({ affected: 1 });
      eventPricingRepositoryMock.findOne.mockResolvedValue(updated);

      await service.update('pricing-1', 'event-1', updateDto as any);

      expect(eventPricingRepositoryMock.update).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('supprime un tarif', async () => {
      eventPricingRepositoryMock.delete.mockResolvedValue({ affected: 1 });

      await service.remove('pricing-1', 'event-1');

      expect(eventPricingRepositoryMock.delete).toHaveBeenCalled();
    });
  });
});
