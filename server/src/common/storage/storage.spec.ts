import { mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { createStorage, fileKey } from './storage';

describe('storage', () => {
  it('compose la clé <userId>/<filename>', () => {
    expect(fileKey('user-1', 'abc.pdf')).toBe('user-1/abc.pdf');
  });

  it('choisit S3 seulement quand endpoint et bucket sont définis', () => {
    expect(createStorage({}).constructor.name).toBe('LocalStorage');
    expect(createStorage({ AWS_ENDPOINT_URL_S3: 'https://x' }).constructor.name).toBe(
      'LocalStorage'
    );
    expect(
      createStorage({
        AWS_ENDPOINT_URL_S3: 'https://x',
        STORAGE_BUCKET: 'b',
        AWS_ACCESS_KEY_ID: 'k',
        AWS_SECRET_ACCESS_KEY: 's',
      }).constructor.name
    ).toBe('S3Storage');
  });

  describe('disque local', () => {
    let dir: string;
    const cwd = process.cwd;

    beforeEach(() => {
      dir = mkdtempSync(join(tmpdir(), 'solidhive-storage-'));
      process.cwd = () => dir;
    });
    afterEach(() => {
      process.cwd = cwd;
      rmSync(dir, { recursive: true, force: true });
    });

    it('écrit, relit, diffuse, teste et supprime un objet', async () => {
      const local = createStorage({});
      const key = fileKey('user-1', 'file.txt');

      expect(await local.exists(key)).toBe(false);
      await local.put(key, Buffer.from('bonjour'), 'text/plain');
      expect(await local.exists(key)).toBe(true);
      expect((await local.get(key)).toString()).toBe('bonjour');

      const chunks: Buffer[] = [];
      for await (const chunk of await local.stream(key)) chunks.push(chunk as Buffer);
      expect(Buffer.concat(chunks).toString()).toBe('bonjour');

      await local.delete(key);
      expect(await local.exists(key)).toBe(false);
      await expect(local.delete(key)).resolves.toBeUndefined();
    });
  });
});
