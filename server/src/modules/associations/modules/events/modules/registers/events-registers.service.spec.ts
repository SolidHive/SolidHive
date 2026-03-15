import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventsRegistersService } from './events-registers.service';
import { EventRegister } from './entities/event-register.entity';
import { EventPricing } from '../pricings/entities/event-pricing.entity';
import { User } from '../../../../../users/entities/user.entity';
import { Transaction } from '../../../../../transactions/entities/transaction.entity';
import { File } from '../../../../../files/entities/file.entity';
import { EventPaymentService } from '../../../../../payments/services/event-payment.service';
import { EmailService } from '../../../../../../common/utils/email/email.service';
import { InvoicesService } from '../../../../../invoices/invoices.service';

describe('EventsRegistersService', () => {
  let service: EventsRegistersService;

  const queryBuilderMock = {
    leftJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    getMany: jest.fn().mockResolvedValue([]),
    getCount: jest.fn().mockResolvedValue(0),
    getRawOne: jest.fn().mockResolvedValue({ totalCollected: 0 }),
    clone: jest.fn().mockReturnThis(),
  };

  const eventRegisterRepositoryMock = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn().mockResolvedValue([[], 0]),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(() => queryBuilderMock),
  };

  const eventPricingRepositoryMock = {
    findOne: jest.fn(),
  };

  const userRepositoryMock = {
    findOne: jest.fn(),
  };

  const transactionRepositoryMock = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const fileRepositoryMock = {};

  const eventPaymentServiceMock = {
    handleRegistrationPayment: jest.fn(),
  };

  const emailServiceMock = {
    sendEmail: jest.fn(),
  };

  const invoicesServiceMock = {
    createInvoice: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsRegistersService,
        { provide: getRepositoryToken(EventRegister), useValue: eventRegisterRepositoryMock },
        { provide: getRepositoryToken(EventPricing), useValue: eventPricingRepositoryMock },
        { provide: getRepositoryToken(User), useValue: userRepositoryMock },
        { provide: getRepositoryToken(Transaction), useValue: transactionRepositoryMock },
        { provide: getRepositoryToken(File), useValue: fileRepositoryMock },
        { provide: EventPaymentService, useValue: eventPaymentServiceMock },
        { provide: EmailService, useValue: emailServiceMock },
        { provide: InvoicesService, useValue: invoicesServiceMock },
      ],
    }).compile();

    service = module.get<EventsRegistersService>(EventsRegistersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('enregistre un participant à un événement', async () => {
      const dto = { eventPricingId: 'pricing-1' };
      const pricing = { id: 'pricing-1', amount: 100 };
      const user = { id: 'user-1' };
      const created = { ...dto, user };
      const saved = { id: 'register-1', ...created };

      eventPricingRepositoryMock.findOne.mockResolvedValue(pricing);
      userRepositoryMock.findOne.mockResolvedValue(user);
      eventRegisterRepositoryMock.create.mockReturnValue(created);
      eventRegisterRepositoryMock.save.mockResolvedValue(saved);

      const result = await service.create(dto as any, 'user-1');

      expect(eventRegisterRepositoryMock.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('findOne', () => {
    it('retourne un enregistrement par id', async () => {
      const register = { id: 'register-1', eventId: 'event-1' };
      eventRegisterRepositoryMock.findOne.mockResolvedValue(register);

      const result = await service.findOne('register-1', 'event-1');

      expect(result).toEqual(register);
    });
  });

  describe('remove', () => {
    it('supprime un enregistrement', async () => {
      eventRegisterRepositoryMock.delete.mockResolvedValue({ affected: 1 });

      await service.remove('register-1', 'event-1');

      expect(eventRegisterRepositoryMock.delete).toHaveBeenCalled();
    });
  });
});
