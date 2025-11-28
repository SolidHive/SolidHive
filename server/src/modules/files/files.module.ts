import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from './entities/file.entity';
import { User } from '../users/entities/user.entity';
import { MulterModule } from '@nestjs/platform-express';
import { storage } from './file-storage';
import { AssociationRole } from '../associations/modules/roles/entities/association-role.entity';
import { Role } from '../users/entities/role.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([File, User, Role, AssociationRole]),
    MulterModule.registerAsync({
      useFactory: () => ({ storage }),
    }),
  ],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
