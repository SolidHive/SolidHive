import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

/**
 * Met en forme les erreurs de l'envoi de fichier. Le fichier reçu ne vit qu'en
 * mémoire (Multer `memoryStorage`) : rien à nettoyer sur disque en cas d'échec,
 * le stockage n'est écrit qu'une fois les vérifications passées.
 */
@Catch()
export class FileCleanupFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();

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
