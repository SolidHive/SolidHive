import { ExceptionFilter, Catch, ArgumentsHost, BadRequestException } from '@nestjs/common';
import { Response, Request } from 'express';
import * as fs from 'fs';

@Catch(BadRequestException)
export class FileCleanupFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    // si multer a stocké un fichier → on le supprime
    const file = (req as any).file;
    if (file && file.path && typeof file.path === 'string') {
      fs.unlink(file.path as fs.PathLike, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }

    return res.status(400).json(exception.getResponse());
  }
}
