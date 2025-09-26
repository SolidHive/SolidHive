import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from './entities/file.entity';
import { User } from '../users/entities/user.entity';
import { MulterModule } from '@nestjs/platform-express';
import { v4 as uuidv4 } from 'uuid';
import { diskStorage } from 'multer';
import * as fs from 'fs';

const storage = diskStorage({
  destination(req, file, cb) {
    const user = req.user;
    if (!user) {
      return cb(new Error('User not found in request'), '');
    }
    const userId = user['id'] as string | undefined;
    if (!userId) {
      return cb(new Error('User ID not found in request'), '');
    }
    const path = `./uploads/${userId}`;
    fs.mkdirSync(path, { recursive: true });
    cb(null, path);
  },
  filename(req, file, cb) {
    const user = req.user;
    if (!user) {
      return cb(new Error('User not found in request'), '');
    }
    const userId = user['id'] as string | undefined;
    if (!userId) {
      return cb(new Error('User ID not found in request'), '');
    }
    cb(null, uuidv4());
  },
});

@Module({
  imports: [
    TypeOrmModule.forFeature([File, User]),
    MulterModule.registerAsync({
      useFactory: () => ({ storage }),
    }),
  ],
  controllers: [FilesController],
  providers: [FilesService],
})
export class FilesModule {}
