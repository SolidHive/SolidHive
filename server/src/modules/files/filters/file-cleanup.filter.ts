import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response, Request } from 'express';
import * as fs from 'fs';

@Catch()
export class FileCleanupFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    // Nettoyage du fichier uploadé en cas d'erreur
    const file = (req as any).file;
    if (file && file.path && typeof file.path === 'string') {
      fs.unlink(file.path as fs.PathLike, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }

    // Gestion des différents types d'exceptions
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let response: any = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    };

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      response = exception.getResponse();
    } else if (exception instanceof Error) {
      response = {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: exception.message || 'Internal server error',
      };
    }

    return res.status(status).json(response);
  }
}
