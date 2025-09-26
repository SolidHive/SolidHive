import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UseGuards,
  UploadedFile,
  StreamableFile,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiCookieAuth } from '@nestjs/swagger';
import { RateLimitGuard } from '../../common/guards/rate-limit.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { User } from '../../common/decorators/user.decorator';
import * as fs from 'fs';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(RateLimitGuard, AuthenticatedGuard)
  @ApiConsumes('multipart/form-data')
  @ApiCookieAuth()
  @ApiBody({ type: CreateFileDto })
  create(
    @Body() createFileDto: CreateFileDto,
    @User('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      return this.filesService.create(createFileDto, file, userId);
    } catch (error) {
      if (file) {
        fs.unlink(file.path, (err) => {
          if (err) {
            console.error('Error deleting file after failed upload:', err);
          }
        });
        throw error;
      }
    }
  }

  @Get()
  findAll() {
    return this.filesService.findAll();
  }

  @Get(':relatedTo/:relatedBy/metadata')
  async findOne(
    @Param('relatedTo') relatedTo: string,
    @Param('relatedBy') relatedBy: string,
    @Query('index') index: number,
  ) {
    return this.filesService.findOne(relatedTo, relatedBy, index);
  }

  @Patch(':relatedTo/:relatedBy')
  update(
    @Body() updateFileDto: UpdateFileDto,
    @Param('relatedTo') relatedTo: string,
    @Param('relatedBy') relatedBy: string,
    @Query('index') index?: number,
  ) {
    return this.filesService.update(relatedTo, relatedBy, index, updateFileDto);
  }

  @Delete(':relatedTo/:relatedBy')
  remove(
    @Param('relatedTo') relatedTo: string,
    @Param('relatedBy') relatedBy: string,
    @Query('index') index?: number,
  ) {
    return this.filesService.remove(relatedTo, relatedBy, index);
  }

  @Get(':relatedTo/:relatedBy')
  getFileStream(
    @Param('relatedTo') relatedTo: string,
    @Param('relatedBy') relatedBy: string,
    @Query('index') index: number,
  ): Promise<StreamableFile | null> {
    return this.filesService.getFileStream(relatedTo, relatedBy, index);
  }
}
