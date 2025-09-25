import { Test, TestingModule } from '@nestjs/testing';
import { AssociationsAnnouncementsService } from './associations-announcements.service';

describe('AssociationsAnnouncementsService', () => {
  let service: AssociationsAnnouncementsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AssociationsAnnouncementsService],
    }).compile();

    service = module.get<AssociationsAnnouncementsService>(AssociationsAnnouncementsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
