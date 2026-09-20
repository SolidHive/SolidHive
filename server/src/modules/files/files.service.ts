import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  StreamableFile,
} from '@nestjs/common';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { File } from './entities/file.entity';
import { v4 as uuidv4 } from 'uuid';
import * as sharpModule from 'sharp';

// sharp est un module CommonJS (`module.exports = sharp`) : sans esModuleInterop,
// `import sharp from 'sharp'` compile en `sharp_1.default`, qui vaut undefined à
// l'exécution. On prend `default` s'il existe, sinon le module lui-même.
type SharpFn = typeof sharpModule.default;
const sharp: SharpFn =
  (sharpModule as { default?: SharpFn }).default ?? (sharpModule as unknown as SharpFn);
import { fileKey, storage } from '../../common/storage/storage';
import { Role } from '../users/entities/role.entity';
import { AssociationRole } from '../associations/modules/roles/entities/association-role.entity';
import { User } from '../users/entities/user.entity';

/** Durée de validité d'une URL de lecture directe : au-delà, le navigateur redemande à l'API. */
export const FILE_URL_TTL_SECONDS = 60 * 60;

const MAX_IMAGE_WIDTH = 1600;

/**
 * Les photos arrivent souvent en plusieurs mégaoctets ; ramenées à 1600 px et
 * recompressées, elles pèsent dix fois moins sans perte visible à l'écran.
 * Les PNG gardent leur transparence (logos), le reste devient JPEG. Un
 * fichier qui n'est pas une image, ou que sharp ne lit pas, repart tel quel.
 */
async function optimizeImage(
  file: Express.Multer.File
): Promise<{ buffer: Buffer; mimetype: string; size: number }> {
  const original = { buffer: file.buffer, mimetype: file.mimetype, size: file.size };
  if (!file.mimetype?.startsWith('image/') || file.mimetype === 'image/svg+xml') return original;
  try {
    const image = sharp(file.buffer, { failOn: 'none' }).rotate().resize({
      width: MAX_IMAGE_WIDTH,
      withoutEnlargement: true,
    });
    const png = file.mimetype === 'image/png';
    const buffer = png
      ? await image.png({ compressionLevel: 9, palette: true }).toBuffer()
      : await image.jpeg({ quality: 82, mozjpeg: true }).toBuffer();
    return { buffer, mimetype: png ? 'image/png' : 'image/jpeg', size: buffer.length };
  } catch (error) {
    console.warn('Image conservée telle quelle, sharp a échoué :', (error as Error).message);
    return original;
  }
}

@Injectable()
export class FilesService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(AssociationRole)
    private associationRoleRepository: Repository<AssociationRole>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(File)
    private filesRepository: Repository<File>
  ) {}

  async create(createFileDto: CreateFileDto, file: Express.Multer.File, userId: string) {
    const extension = file.originalname.split('.').pop();
    const filename = uuidv4();

    // Vérifie que la cible existe
    const targetRepo = this.dataSource.getRepository(createFileDto.relatedTo);

    const target = await targetRepo.findOne({
      where: { id: createFileDto.relatedBy },
    });

    if (!target) {
      throw new HttpException(`${createFileDto.relatedTo} not found`, HttpStatus.NOT_FOUND);
    }

    let allowedSystemRoles: Role[] = [];
    if (createFileDto.allowedSystemRoles) {
      allowedSystemRoles = await this.roleRepository.find({
        where: { id: In(createFileDto.allowedSystemRoles) },
      });
    }

    let allowedAssociationRoles: AssociationRole[] = [];
    if (createFileDto.allowedAssociationRoles) {
      allowedAssociationRoles = await this.associationRoleRepository.find({
        where: { id: In(createFileDto.allowedAssociationRoles) },
      });
    }

    const addFile = this.filesRepository.create({
      ...createFileDto,
      userId,
      extension,
      oldFilename: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      filename,
      allowedSystemRoles,
      allowedAssociationRoles,
    });

    const { buffer, mimetype, size } = await optimizeImage(file);
    addFile.mimetype = mimetype;
    addFile.size = size;
    await storage.put(fileKey(userId, filename), buffer, mimetype);
    return this.filesRepository.save(addFile);
  }

  async findOne(
    relatedTo: string,
    relatedBy: string,
    index: number = 0,
    userId?: string,
    purpose?: string
  ) {
    const whereClause: any = { relatedTo, relatedBy, index };
    if (purpose) {
      whereClause.purpose = purpose;
    }

    const file = await this.filesRepository.findOne({
      where: whereClause,
      relations: ['allowedSystemRoles', 'allowedAssociationRoles'],
    });

    if (!file) {
      return null;
    }

    if (file.allowedAssociationRoles.length > 0 || file.allowedSystemRoles.length > 0) {
      if (!userId) {
        throw new ForbiddenException('You do not have permission to access this file');
      }

      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['roles', 'associations', 'associations.role'],
      });
      if (!user) {
        throw new ForbiddenException('You do not have permission to access this file');
      }

      let hasPermission =
        file.allowedAssociationRoles.length > 0 || file.allowedSystemRoles.length > 0
          ? false
          : true;
      // check if user has one of the allowed association roles
      if (
        file.allowedAssociationRoles.length > 0 &&
        user.associations.some((ua) =>
          file.allowedAssociationRoles.some((r) => r.id === ua.role.id)
        )
      ) {
        hasPermission = true;
      }

      // check if user has one of the allowed system roles
      if (
        file.allowedSystemRoles.length > 0 &&
        user.roles.some((role) => file.allowedSystemRoles.some((r) => r.id === role.id))
      ) {
        hasPermission = true;
      }

      if (!hasPermission) {
        throw new ForbiddenException('You do not have permission to access this file');
      }
    }

    return file;
  }

  async update(
    relatedTo: string,
    relatedBy: string,
    index: number = 0,
    updateFileDto: UpdateFileDto
  ) {
    let allowedSystemRoles: Role[] = [];
    if (updateFileDto.allowedSystemRoles) {
      allowedSystemRoles = await this.roleRepository.find({
        where: { id: In(updateFileDto.allowedSystemRoles) },
      });
    }

    let allowedAssociationRoles: AssociationRole[] = [];
    if (updateFileDto.allowedAssociationRoles) {
      allowedAssociationRoles = await this.associationRoleRepository.find({
        where: { id: In(updateFileDto.allowedAssociationRoles) },
      });
    }

    return this.filesRepository.update(
      { relatedTo, relatedBy, index },
      { ...updateFileDto, allowedSystemRoles, allowedAssociationRoles }
    );
  }

  /**
   * URL de lecture directe du fichier (stockage objet), après contrôle des
   * droits ; `null` en stockage local, où l'API diffuse elle-même le fichier.
   */
  async getFileUrl(
    relatedTo: string,
    relatedBy: string,
    index: number = 0,
    purpose?: string
  ): Promise<string | null> {
    const file = await this.findOne(relatedTo, relatedBy, index, undefined, purpose);
    if (!file) return null;
    return storage.url(fileKey(file.userId, file.filename), FILE_URL_TTL_SECONDS);
  }

  async getFileStream(
    relatedTo: string,
    relatedBy: string,
    index: number = 0,
    purpose?: string
  ): Promise<StreamableFile | null> {
    try {
      const file = await this.findOne(relatedTo, relatedBy, index, undefined, purpose);

      if (!file) {
        return null;
      }

      const fileStream = await storage.stream(fileKey(file.userId, file.filename));

      return new StreamableFile(fileStream, {
        type: file.mimetype,
        disposition: `inline; filename="${file.oldFilename}"`,
      });
    } catch (error) {
      console.error('Error getting file stream:', error);
      throw error;
    }
  }

  async remove(relatedTo: string, relatedBy: string, index: number = 0, purpose?: string) {
    // Récupérer le fichier avant de le supprimer pour avoir ses informations
    const file = await this.findOne(relatedTo, relatedBy, index, undefined, purpose);

    if (file) {
      try {
        await storage.delete(fileKey(file.userId, file.filename));
      } catch (error) {
        console.error(`Erreur lors de la suppression du fichier physique ${file.filename}:`, error);
      }
    } else {
      console.log(
        `Aucun fichier trouvé pour ${relatedTo}/${relatedBy}, index: ${index}, purpose: ${purpose}`
      );
    }

    const whereClause: any = { relatedTo, relatedBy, index };
    if (purpose) {
      whereClause.purpose = purpose;
    }

    const deleteResult = await this.filesRepository.delete(whereClause);

    // Ré-indexation automatique pour les galeries uniquement
    if (purpose === 'gallery' && file) {
      // Récupérer toutes les images de galerie avec un index supérieur
      const higherIndexFiles = await this.filesRepository.find({
        where: {
          relatedTo,
          relatedBy,
          purpose: 'gallery',
        },
        order: {
          index: 'ASC',
        },
      });

      // Filtrer celles qui ont un index supérieur à celui supprimé
      const filesToReindex = higherIndexFiles.filter((f) => f.index > index);

      // Décrémenter l'index de chacune
      for (const fileToReindex of filesToReindex) {
        await this.filesRepository.update(
          { filename: fileToReindex.filename },
          { index: fileToReindex.index - 1 }
        );
      }
    }

    return deleteResult;
  }
}
