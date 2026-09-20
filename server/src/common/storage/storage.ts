import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createReadStream } from 'fs';
import { access, mkdir, readFile, unlink, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { Readable } from 'stream';

/**
 * Stockage des fichiers (images envoyées, factures et billets PDF).
 *
 * Deux implémentations derrière la même interface : un bucket S3 quand les
 * variables `AWS_ENDPOINT_URL_S3` et `STORAGE_BUCKET` sont définies (Neon
 * Object Storage en production, dont le disque de l'hébergeur est effacé à
 * chaque déploiement), le dossier `uploads/` sinon (développement et
 * docker-compose). La clé d'un objet est `<userId>/<filename>`, le même
 * découpage que l'ancien dossier par utilisateur.
 *
 * Ce n'est pas un provider Nest : les seeds et les scripts en ont besoin hors
 * injection, et les services l'importent directement.
 */
export interface ObjectStorage {
  put(key: string, body: Buffer, contentType?: string): Promise<void>;
  get(key: string): Promise<Buffer>;
  stream(key: string): Promise<Readable>;
  exists(key: string): Promise<boolean>;
  delete(key: string): Promise<void>;
  /**
   * URL de lecture directe, limitée dans le temps, ou `null` si le moteur ne
   * sait pas en produire : le navigateur va alors chercher l'objet lui-même au
   * lieu de le faire transiter par l'API.
   */
  url(key: string, ttlSeconds: number): Promise<string | null>;
}

export const fileKey = (userId: string, filename: string): string => `${userId}/${filename}`;

class LocalStorage implements ObjectStorage {
  constructor(private readonly root = join(process.cwd(), 'uploads')) {}

  private path(key: string) {
    return join(this.root, key);
  }

  async put(key: string, body: Buffer): Promise<void> {
    await mkdir(dirname(this.path(key)), { recursive: true });
    await writeFile(this.path(key), body);
  }

  get(key: string): Promise<Buffer> {
    return readFile(this.path(key));
  }

  async stream(key: string): Promise<Readable> {
    await access(this.path(key));
    return createReadStream(this.path(key));
  }

  async exists(key: string): Promise<boolean> {
    try {
      await access(this.path(key));
      return true;
    } catch {
      return false;
    }
  }

  async url(): Promise<string | null> {
    return null;
  }

  async delete(key: string): Promise<void> {
    try {
      await unlink(this.path(key));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }
  }
}

class S3Storage implements ObjectStorage {
  private readonly client: S3Client;

  constructor(
    private readonly bucket: string,
    endpoint: string,
    region: string
  ) {
    this.client = new S3Client({
      region,
      endpoint,
      // Chemin dans l'URL plutôt que sous-domaine : exigé par les S3 compatibles.
      forcePathStyle: true,
      // Les sommes de contrôle CRC que le SDK ajoute par défaut ne sont pas
      // comprises par tous les S3 compatibles ; on ne les envoie que sur demande.
      requestChecksumCalculation: 'WHEN_REQUIRED',
      responseChecksumValidation: 'WHEN_REQUIRED',
    });
  }

  async put(key: string, body: Buffer, contentType?: string): Promise<void> {
    await this.client.send(
      new PutObjectCommand({ Bucket: this.bucket, Key: key, Body: body, ContentType: contentType })
    );
  }

  async get(key: string): Promise<Buffer> {
    const { Body } = await this.client.send(
      new GetObjectCommand({ Bucket: this.bucket, Key: key })
    );
    if (!Body) throw new Error(`Objet vide : ${key}`);
    return Buffer.from(await Body.transformToByteArray());
  }

  async stream(key: string): Promise<Readable> {
    const { Body } = await this.client.send(
      new GetObjectCommand({ Bucket: this.bucket, Key: key })
    );
    if (!Body) throw new Error(`Objet vide : ${key}`);
    return Body as Readable;
  }

  async exists(key: string): Promise<boolean> {
    try {
      await this.client.send(new HeadObjectCommand({ Bucket: this.bucket, Key: key }));
      return true;
    } catch (error) {
      const status = (error as { $metadata?: { httpStatusCode?: number } }).$metadata
        ?.httpStatusCode;
      if (status === 404) return false;
      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }

  url(key: string, ttlSeconds: number): Promise<string | null> {
    return getSignedUrl(this.client, new GetObjectCommand({ Bucket: this.bucket, Key: key }), {
      expiresIn: ttlSeconds,
    });
  }
}

export const createStorage = (env: NodeJS.ProcessEnv = process.env): ObjectStorage => {
  const endpoint = env.AWS_ENDPOINT_URL_S3;
  const bucket = env.STORAGE_BUCKET;
  if (endpoint && bucket) {
    return new S3Storage(bucket, endpoint, env.AWS_REGION || 'auto');
  }
  return new LocalStorage();
};

let instance: ObjectStorage | undefined;

/** L'instance partagée, choisie d'après l'environnement au premier appel. */
export const storage: ObjectStorage = {
  put: (...args) => (instance ??= createStorage()).put(...args),
  get: (...args) => (instance ??= createStorage()).get(...args),
  stream: (...args) => (instance ??= createStorage()).stream(...args),
  exists: (...args) => (instance ??= createStorage()).exists(...args),
  delete: (...args) => (instance ??= createStorage()).delete(...args),
  url: (...args) => (instance ??= createStorage()).url(...args),
};
