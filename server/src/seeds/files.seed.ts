import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import { Association } from '../modules/associations/entities/association.entity';
import { File } from '../modules/files/entities/file.entity';
import { fileKey, storage } from '../common/storage/storage';
import { downloadImage } from './download-image';

/**
 * Seed files/images for associations
 * Creates logo, banner, about_image, and gallery images for each association
 */
export async function seedFiles(
  dataSource: DataSource,
  associations: Association[]
): Promise<File[]> {
  const fileRepository = dataSource.getRepository(File);

  console.log('🌱 Seeding files...');

  const files: File[] = [];

  for (const association of associations) {
    // Create images for this association
    const imageTypes = [
      { purpose: 'logo', index: 0 },
      { purpose: 'banner', index: 1 },
      { purpose: 'about_image', index: 2 },
    ];

    // Add logo, banner, and about_image
    for (const imageType of imageTypes) {
      const width = faker.number.int({ min: 800, max: 1200 });
      const height = faker.number.int({ min: 600, max: 900 });
      const imageId = faker.number.int({ min: 1, max: 1000 });

      const imageUrl = `https://picsum.photos/id/${imageId}/${width}/${height}`;
      const filename = `association_${association.id}_${imageType.purpose}`;

      try {
        // Télécharge l'image et la dépose dans le stockage
        const { buffer, size, mimetype } = await downloadImage(imageUrl);
        await storage.put(fileKey(association.createdBy.id, filename), buffer, mimetype);

        // Create file entity
        const file = fileRepository.create({
          filename: filename, // Without extension - fullFilename() will add it
          relatedTo: 'Association',
          relatedBy: association.id,
          purpose: imageType.purpose,
          index: imageType.index,
          userId: association.createdBy.id,
          oldFilename: imageType.purpose,
          mimetype: mimetype,
          extension: 'jpg',
          size: size,
        });

        const savedFile = await fileRepository.save(file);
        files.push(savedFile);

        console.log(`📸 Downloaded and saved ${imageType.purpose}: ${filename}`);
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

      try {
        // Télécharge l'image et la dépose dans le stockage
        const { buffer, size, mimetype } = await downloadImage(imageUrl);
        await storage.put(fileKey(association.createdBy.id, filename), buffer, mimetype);

        // Create file entity
        const file = fileRepository.create({
          filename: filename, // Without extension - fullFilename() will add it
          relatedTo: 'Association',
          relatedBy: association.id,
          purpose: 'gallery',
          index: i + 3, // Start from index 3 (after logo:0, banner:1, about_image:2)
          userId: association.createdBy.id,
          oldFilename: `gallery_${i + 1}`,
          mimetype: mimetype,
          extension: 'jpg',
          size: size,
        });

        const savedFile = await fileRepository.save(file);
        files.push(savedFile);

        console.log(`📸 Downloaded and saved gallery image: ${filename}`);
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
