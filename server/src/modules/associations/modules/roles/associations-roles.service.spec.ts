import { Test, TestingModule } from '@nestjs/testing';
import { AssociationsRolesService } from './associations-roles.service';

describe('AssociationsRolesService', () => {
  let service: AssociationsRolesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AssociationsRolesService],
    }).compile();

    service = module.get<AssociationsRolesService>(AssociationsRolesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
