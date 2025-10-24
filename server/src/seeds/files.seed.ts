import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import { Association } from '../modules/associations/entities/association.entity';
import { File } from '../modules/files/entities/file.entity';

/**
 * Download an image from Lorem Picsum and save it locally
 */
async function downloadImage(
  url: string,
  filepath: string
): Promise<{ size: number; mimetype: string }> {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        // Follow redirect
        const redirectUrl = res.headers.location;
        if (redirectUrl) {
          return downloadImage(redirectUrl, filepath).then(resolve).catch(reject);
        } else {
          reject(new Error('Redirect without location'));
          return;
        }
      }

      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download: ${res.statusCode}`));
        return;
      }

      const mimetype = res.headers['content-type'] || 'image/jpeg';
      let size = 0;
      const fileStream = fs.createWriteStream(filepath);

      res.on('data', (chunk) => {
        size += chunk.length;
      });

      res.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        resolve({ size, mimetype });
      });

      fileStream.on('error', reject);
    });

    request.on('error', reject);
  });
}

/**
 * Seed files/images for associations
 * Creates logo, main_image, about_image, and gallery images for each association
 */
export async function seedFiles(
  dataSource: DataSource,
  associations: Association[]
): Promise<File[]> {
  const fileRepository = dataSource.getRepository(File);

  console.log('🌱 Seeding files...');

  const files: File[] = [];
  const uploadsDir = path.join(process.cwd(), 'uploads');

  // Ensure uploads directory exists
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  for (const association of associations) {
    // Create user-specific directory
    const userDir = path.join(uploadsDir, association.createdBy.id);
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }

    // Create images for this association
    const imageTypes = [
      { purpose: 'logo', index: 0 },
      { purpose: 'main_image', index: 1 },
      { purpose: 'about_image', index: 2 },
    ];

    // Add logo, main_image, and about_image
    for (const imageType of imageTypes) {
      const width = faker.number.int({ min: 800, max: 1200 });
      const height = faker.number.int({ min: 600, max: 900 });
      const imageId = faker.number.int({ min: 1, max: 1000 });

      const imageUrl = `https://picsum.photos/id/${imageId}/${width}/${height}`;
      const filename = `association_${association.id}_${imageType.purpose}`;
      const filepath = path.join(userDir, `${filename}.jpg`);

      try {
        // Download the image
        const { size, mimetype } = await downloadImage(imageUrl, filepath);

        // Create file entity
        const file = fileRepository.create({
          filename: filename, // Without extension - fullFilename() will add it
          relatedTo: 'Association',
          relatedBy: association.id,
          purpose: imageType.purpose,
          index: imageType.index,
          userId: association.createdBy.id,
          oldFilename: `${imageType.purpose}.jpg`,
          mimetype: mimetype,
          extension: 'jpg',
          size: size,
        });

        const savedFile = await fileRepository.save(file);
        files.push(savedFile);

        console.log(`📸 Downloaded and saved ${imageType.purpose}: ${filename}.jpg in ${userDir}`);
      } catch (error) {
        console.error(
          `❌ Failed to download ${imageType.purpose} for association ${association.id}:`,
          error
        );
      }
    }

    // Create 2-4 gallery images per association
    const numGalleryImages = faker.number.int({ min: 2, max: 4 });

    for (let i = 0; i < numGalleryImages; i++) {
      const width = faker.number.int({ min: 800, max: 1200 });
      const height = faker.number.int({ min: 600, max: 900 });
      const imageId = faker.number.int({ min: 1, max: 1000 });

      const imageUrl = `https://picsum.photos/id/${imageId}/${width}/${height}`;
      const filename = `association_${association.id}_gallery_${i + 1}`;
      const filepath = path.join(userDir, `${filename}.jpg`);

      try {
        // Download the image
        const { size, mimetype } = await downloadImage(imageUrl, filepath);

        // Create file entity
        const file = fileRepository.create({
          filename: filename, // Without extension - fullFilename() will add it
          relatedTo: 'Association',
          relatedBy: association.id,
          purpose: 'gallery',
          index: i + 3, // Start from index 3 (after logo:0, main_image:1, about_image:2)
          userId: association.createdBy.id,
          oldFilename: `gallery_${i + 1}.jpg`,
          mimetype: mimetype,
          extension: 'jpg',
          size: size,
        });

        const savedFile = await fileRepository.save(file);
        files.push(savedFile);

        console.log(`📸 Downloaded and saved gallery image: ${filename}.jpg in ${userDir}`);
      } catch (error) {
        console.error(
          `❌ Failed to download gallery image for association ${association.id}:`,
          error
        );
      }
    }
  }

  console.log(`✅ Created ${files.length} files`);
  return files;
}
