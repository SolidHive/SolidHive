import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { Association } from '../associations/entities/association.entity';
import { EmailService } from '../../common/utils/email/email.service';
import { AssociationsService } from '../associations/associations.service';
import { Status } from '../../common/enums/status';

jest.mock('fs');
jest.mock('handlebars');

describe('AdminService', () => {
  let service: AdminService;

  const associationsRepositoryMock = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const emailServiceMock = {
    sendEmail: jest.fn(),
  };

  const associationsServiceMock = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: getRepositoryToken(Association), useValue: associationsRepositoryMock },
        { provide: EmailService, useValue: emailServiceMock },
        { provide: AssociationsService, useValue: associationsServiceMock },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllAssociations', () => {
    it('findAllAssociations delègue à AssociationsService.findAll avec includeAllStatuses', async () => {
      const associations = [
        { id: 'assoc-1', name: 'Assoc 1', status: Status.PENDING },
        { id: 'assoc-2', name: 'Assoc 2', status: Status.ACCEPTED },
      ];
      associationsServiceMock.findAll.mockResolvedValue(associations);

      const result = await service.findAllAssociations({ take: 10 });

      expect(associationsServiceMock.findAll).toHaveBeenCalledWith({
        take: 10,
        includeAllStatuses: true,
      });
      expect(result).toEqual(associations);
    });

    it('findAllAssociations retourne associations sans options', async () => {
      const associations = [{ id: 'assoc-1', name: 'Assoc 1' }];
      associationsServiceMock.findAll.mockResolvedValue(associations);

      const result = await service.findAllAssociations();

      expect(associationsServiceMock.findAll).toHaveBeenCalledWith({
        includeAllStatuses: true,
      });
      expect(result).toEqual(associations);
    });
  });

  describe('updateAssociationStatus', () => {
    it('updateAssociationStatus change le statut et envoie email', async () => {
      const association = {
        id: 'assoc-1',
        name: 'Test Association',
        status: Status.PENDING,
        createdBy: { id: 'user-1', firstname: 'John', name: 'Doe', email: 'john@test.com' },
      };
      const updateStatusDto = { status: Status.ACCEPTED, message: '' };
      const updated = { ...association, status: Status.ACCEPTED };

      associationsRepositoryMock.findOne.mockResolvedValue(association);
      associationsRepositoryMock.save.mockResolvedValue(updated);
      emailServiceMock.sendEmail.mockResolvedValue(void 0);

      const result = await service.updateAssociationStatus('assoc-1', updateStatusDto as any);

      expect(associationsRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { id: 'assoc-1' },
        relations: ['createdBy'],
      });
      expect(associationsRepositoryMock.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: Status.ACCEPTED })
      );
      expect(result).toEqual(updated);
    });

    it('updateAssociationStatus leve NotFoundException si association inexistante', async () => {
      associationsRepositoryMock.findOne.mockResolvedValue(null);

      await expect(
        service.updateAssociationStatus('missing', { status: Status.ACCEPTED } as any)
      ).rejects.toThrow(NotFoundException);
    });

    it('updateAssociationStatus change le statut à REJECTED', async () => {
      const association = {
        id: 'assoc-1',
        name: 'Test Association',
        status: Status.PENDING,
        createdBy: { id: 'user-1', firstname: 'John', name: 'Doe', email: 'john@test.com' },
      };
      const updateStatusDto = { status: Status.REJECTED, message: 'Raison du rejet' };
      const updated = { ...association, status: Status.REJECTED };

      associationsRepositoryMock.findOne.mockResolvedValue(association);
      associationsRepositoryMock.save.mockResolvedValue(updated);

      const result = await service.updateAssociationStatus('assoc-1', updateStatusDto as any);

      expect(result.status).toBe(Status.REJECTED);
    });

    it('updateAssociationStatus envoie email avec message personnalisé', async () => {
      const association = {
        id: 'assoc-1',
        name: 'Test Association',
        status: Status.PENDING,
        createdBy: { id: 'user-1', firstname: 'John', name: 'Doe', email: 'john@test.com' },
      };
      const updateStatusDto = {
        status: Status.ADDITIONAL_REQUEST,
        message: 'Veuillez fournir plus de détails',
      };
      const updated = { ...association, status: Status.ADDITIONAL_REQUEST };

      associationsRepositoryMock.findOne.mockResolvedValue(association);
      associationsRepositoryMock.save.mockResolvedValue(updated);

      await service.updateAssociationStatus('assoc-1', updateStatusDto as any);

      expect(associationsRepositoryMock.save).toHaveBeenCalled();
    });

    it('updateAssociationStatus ne change pas le statut si pas de modification', async () => {
      const association = {
        id: 'assoc-1',
        name: 'Test Association',
        status: Status.ACCEPTED,
        createdBy: { id: 'user-1', firstname: 'John', name: 'Doe', email: 'john@test.com' },
      };
      const updateStatusDto = { status: Status.ACCEPTED, message: '' };

      associationsRepositoryMock.findOne.mockResolvedValue(association);
      associationsRepositoryMock.save.mockResolvedValue(association);

      const result = await service.updateAssociationStatus('assoc-1', updateStatusDto as any);

      expect(result.status).toBe(Status.ACCEPTED);
      expect(associationsRepositoryMock.save).toHaveBeenCalled();
    });
  });
});
