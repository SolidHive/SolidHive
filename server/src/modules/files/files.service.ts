import { Injectable, StreamableFile } from '@nestjs/common';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from './entities/file.entity';
import { createReadStream } from 'fs';
import { join } from 'path';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(File)
    private filesRepository: Repository<File>,
  ) {}

  async create(
    createFileDto: CreateFileDto,
    file: Express.Multer.File,
    userId: string,
  ) {
    const extension = file.originalname.split('.').pop();

    const addFile = this.filesRepository.create({
      ...createFileDto,
      userId,
      extension,
      oldFilename: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      filename: file.filename,
    });

    return this.filesRepository.save(addFile);
  }

  findAll() {
    return this.filesRepository.find();
  }

  findOne(relatedTo: string, relatedBy: string, index: number = 0) {
    return this.filesRepository.findOne({
      where: { relatedTo, relatedBy, index },
    });
  }

  update(
    relatedTo: string,
    relatedBy: string,
    index: number = 0,
    updateFileDto: UpdateFileDto,
  ) {
    return this.filesRepository.update(
      { relatedTo, relatedBy, index },
      updateFileDto,
    );
  }

  async getFileStream(
    relatedTo: string,
    relatedBy: string,
    index: number = 0,
  ): Promise<StreamableFile | null> {
    const file = await this.findOne(relatedTo, relatedBy, index);

    if (!file) {
      return null;
    }

    const fileStream = createReadStream(
      join(process.cwd(), 'uploads', file.userId, file.filename),
    );

    return new StreamableFile(fileStream, {
      type: file.mimetype,
      disposition: `attachment; filename="${file.oldFilename}"`,
    });
  }

  remove(relatedTo: string, relatedBy: string, index: number = 0) {
    return this.filesRepository.delete({ relatedTo, relatedBy, index });
  }
}
