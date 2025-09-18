import { Test, TestingModule } from '@nestjs/testing';
import { AssociationsRolesController } from './associations-roles.controller';
import { AssociationsRolesService } from './associations-roles.service';

describe('AssociationsRolesController', () => {
  let controller: AssociationsRolesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssociationsRolesController],
      providers: [AssociationsRolesService],
    }).compile();

    controller = module.get<AssociationsRolesController>(
      AssociationsRolesController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
