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
  UseFilters,
  NotFoundException,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiCookieAuth } from '@nestjs/swagger';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { User } from '../../common/decorators/user.decorator';
import { FileCleanupFilter } from './filters/file-cleanup.filter';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(AuthenticatedGuard)
  @UseFilters(FileCleanupFilter)
  @ApiConsumes('multipart/form-data')
  @ApiCookieAuth()
  @ApiBody({ type: CreateFileDto })
  create(
    @Body() createFileDto: CreateFileDto,
    @User('id') userId: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    console.log('FilesController.create called');
    return this.filesService.create(createFileDto, file, userId);
  }

  @Get(':relatedTo/:relatedBy/metadata')
  async findOne(
    @Param('relatedTo') relatedTo: string,
    @Param('relatedBy') relatedBy: string,
    @Query('index') index: number,
    @Query('purpose') purpose?: string,
    @User('id') userId?: string
  ) {
    return this.filesService.findOne(relatedTo, relatedBy, index, userId, purpose);
  }

  @Patch(':relatedTo/:relatedBy')
  update(
    @Body() updateFileDto: UpdateFileDto,
    @Param('relatedTo') relatedTo: string,
    @Param('relatedBy') relatedBy: string,
    @Query('index') index?: number
  ) {
    return this.filesService.update(relatedTo, relatedBy, index, updateFileDto);
  }

  @Delete(':relatedTo/:relatedBy')
  remove(
    @Param('relatedTo') relatedTo: string,
    @Param('relatedBy') relatedBy: string,
    @Query('index') index?: number,
    @Query('purpose') purpose?: string
  ) {
    return this.filesService.remove(relatedTo, relatedBy, index, purpose);
  }

  @Get(':relatedTo/:relatedBy')
  async getFileStream(
    @Param('relatedTo') relatedTo: string,
    @Param('relatedBy') relatedBy: string,
    @Query('index') index: number,
    @Query('purpose') purpose?: string
  ): Promise<StreamableFile | null> {
    const file = await this.filesService.getFileStream(relatedTo, relatedBy, index, purpose);

    if (!file) {
      throw new NotFoundException('File not found');
    }

    return file;
  }
}
