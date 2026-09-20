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
  UseFilters,
  NotFoundException,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { FILE_URL_TTL_SECONDS, FilesService } from './files.service';
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

  /**
   * En stockage objet, l'API ne diffuse pas le fichier : elle renvoie le
   * navigateur vers une URL signée, valable une heure. Une instance à 0,1 CPU
   * ne fait plus transiter les images, et le navigateur les garde en cache.
   */
  @Get(':relatedTo/:relatedBy')
  async getFile(
    @Param('relatedTo') relatedTo: string,
    @Param('relatedBy') relatedBy: string,
    @Query('index') index: number,
    @Query('purpose') purpose: string | undefined,
    @Res() res: Response
  ): Promise<void> {
    const url = await this.filesService.getFileUrl(relatedTo, relatedBy, index, purpose);
    if (url) {
      res.setHeader('Cache-Control', `private, max-age=${FILE_URL_TTL_SECONDS - 60}`);
      res.redirect(302, url);
      return;
    }

    const file = await this.filesService.getFileStream(relatedTo, relatedBy, index, purpose);
    if (!file) {
      throw new NotFoundException('File not found');
    }
    const headers = file.getHeaders();
    res.setHeader('Content-Type', headers.type ?? 'application/octet-stream');
    if (headers.disposition) res.setHeader('Content-Disposition', headers.disposition);
    res.setHeader('Cache-Control', 'private, max-age=86400');
    file.getStream().pipe(res);
  }
}
