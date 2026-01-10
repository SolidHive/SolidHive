import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Association } from '../../associations/entities/association.entity';
import { EmailModule } from '../../../common/utils/email/email.module';
import { AssociationsModule } from '../../associations/associations.module';

@Module({
  imports: [TypeOrmModule.forFeature([Association]), EmailModule, AssociationsModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
