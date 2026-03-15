import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventsService } from './events.service';
import { Event } from './entities/event.entity';
import { File } from '../../../files/entities/file.entity';
import { EventPricing } from './modules/pricings/entities/event-pricing.entity';
import { EventRegister } from './modules/registers/entities/event-register.entity';
import { FilesService } from '../../../files/files.service';

describe('EventsService', () => {
  let service: EventsService;

  const eventsRepositoryMock = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const fileRepositoryMock = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const eventPricingRepositoryMock = {
    find: jest.fn(),
    delete: jest.fn(),
  };

  const eventRegisterRepositoryMock = {
    find: jest.fn(),
    count: jest.fn(),
    delete: jest.fn(),
  };

  const filesServiceMock = {
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        { provide: getRepositoryToken(Event), useValue: eventsRepositoryMock },
        { provide: getRepositoryToken(File), useValue: fileRepositoryMock },
        { provide: getRepositoryToken(EventPricing), useValue: eventPricingRepositoryMock },
        { provide: getRepositoryToken(EventRegister), useValue: eventRegisterRepositoryMock },
        { provide: FilesService, useValue: filesServiceMock },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('crée un événement', async () => {
      const dto = { name: 'Événement Test', description: 'Test' };
      const userAssociation = { id: 'ua-1', associationId: 'assoc-1' };
      const created = { ...dto, createdBy: userAssociation };
      const saved = { id: 'event-1', ...created };

      eventsRepositoryMock.create.mockReturnValue(created);
      eventsRepositoryMock.save.mockResolvedValue(saved);

      const result = await service.create(dto as any, userAssociation as any);

      expect(eventsRepositoryMock.save).toHaveBeenCalled();
      expect(result).toEqual(saved);
    });
  });

  describe('findAll', () => {
    it('retourne les événements', async () => {
      const events = [{ id: 'event-1', name: 'Événement' }];
      eventsRepositoryMock.find.mockResolvedValue(events);

      const _result = await service.findAll('assoc-1');

      expect(eventsRepositoryMock.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('retourne un événement par id', async () => {
      const event = { id: 'event-1', name: 'Événement' };
      eventsRepositoryMock.findOne.mockResolvedValue(event);
      fileRepositoryMock.findOne.mockResolvedValue(null);
      eventPricingRepositoryMock.find.mockResolvedValue([]);

      const result = await service.findOne('event-1', 'assoc-1');

      expect(eventsRepositoryMock.findOne).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result?.id).toBe('event-1');
    });
  });

  describe('update', () => {
    it('met à jour un événement', async () => {
      const updateDto = { name: 'Updated' };
      const updated = { id: 'event-1', ...updateDto };
      eventsRepositoryMock.update.mockResolvedValue({ affected: 1 });
      eventsRepositoryMock.findOne.mockResolvedValue(updated);
      fileRepositoryMock.findOne.mockResolvedValue(null);
      eventPricingRepositoryMock.find.mockResolvedValue([]);

      const _result = await service.update('event-1', 'assoc-1', updateDto as any);

      expect(eventsRepositoryMock.update).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('supprime un événement', async () => {
      eventPricingRepositoryMock.find.mockResolvedValue([{ id: 'pricing-1' }]);
      eventRegisterRepositoryMock.count.mockResolvedValue(0);
      eventRegisterRepositoryMock.delete.mockResolvedValue({ affected: 0 });
      eventPricingRepositoryMock.delete.mockResolvedValue({ affected: 1 });
      filesServiceMock.remove.mockResolvedValue(void 0);
      eventsRepositoryMock.delete.mockResolvedValue({ affected: 1 });

      await service.remove('event-1', 'assoc-1');

      expect(eventsRepositoryMock.delete).toHaveBeenCalled();
    });
  });
});
