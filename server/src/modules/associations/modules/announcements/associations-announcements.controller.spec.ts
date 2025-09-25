import { Test, TestingModule } from '@nestjs/testing';
import { AssociationsAnnouncementsController } from './associations-announcements.controller';
import { AssociationsAnnouncementsService } from './associations-announcements.service';

describe('AssociationsAnnouncementsController', () => {
  let controller: AssociationsAnnouncementsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssociationsAnnouncementsController],
      providers: [AssociationsAnnouncementsService],
    }).compile();

    controller = module.get<AssociationsAnnouncementsController>(
      AssociationsAnnouncementsController
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
