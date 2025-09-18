import { Test, TestingModule } from '@nestjs/testing';
import { UsersAssociationsController } from './users-associations.controller';
import { UsersAssociationsService } from './users-associations.service';

describe('UsersAssociationsController', () => {
  let controller: UsersAssociationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersAssociationsController],
      providers: [UsersAssociationsService],
    }).compile();

    controller = module.get<UsersAssociationsController>(
      UsersAssociationsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
