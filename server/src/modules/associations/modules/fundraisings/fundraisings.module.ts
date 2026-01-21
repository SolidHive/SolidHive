import { Module } from '@nestjs/common';
import { FundraisingsService } from './fundraisings.service';
import { FundraisingsController } from './fundraisings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAssociation } from '../users/entities/user-association.entity';
import { Fundraising } from './entities/fundraising.entity';
import { File } from '../../../files/entities/file.entity';
import { PermissionAccess } from 'src/modules/admin/permissions-access/entities/permission-access.entity';
import { FilesModule } from '../../../files/files.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Fundraising, UserAssociation, File, PermissionAccess]),
    FilesModule,
  ],
  controllers: [FundraisingsController],
  providers: [FundraisingsService],
  exports: [TypeOrmModule],
})
export class FundraisingsModule {}
