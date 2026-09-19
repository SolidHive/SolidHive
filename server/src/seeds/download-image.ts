import * as https from 'https';

/**
 * Télécharge une image (Lorem Picsum) en mémoire, en suivant une redirection.
 * Le contenu part ensuite dans le stockage de fichiers, jamais sur le disque.
 */
export function downloadImage(
  url: string
): Promise<{ buffer: Buffer; size: number; mimetype: string }> {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        const redirectUrl = res.headers.location;
        if (!redirectUrl) {
          reject(new Error('Redirect without location'));
          return;
        }
        downloadImage(redirectUrl).then(resolve).catch(reject);
        return;
      }

      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download: ${res.statusCode}`));
        return;
      }

      const mimetype = res.headers['content-type'] || 'image/jpeg';
      const chunks: Buffer[] = [];
      res.on('data', (chunk: Buffer) => chunks.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve({ buffer, size: buffer.length, mimetype });
      });
      res.on('error', reject);
    });

    request.on('error', reject);
  });
}
