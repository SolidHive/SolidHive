import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import { Fundraising } from '../modules/associations/modules/fundraisings/entities/fundraising.entity';
import { Association } from '../modules/associations/entities/association.entity';
import { UserAssociation } from '../modules/associations/modules/users/entities/user-association.entity';
import { File } from '../modules/files/entities/file.entity';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

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
 * Seed fundraisings (campaigns) for associations
 */
export async function seedFundraisings(
  dataSource: DataSource,
  associations: Association[],
  userAssociations: UserAssociation[]
): Promise<Fundraising[]> {
  const fundraisingRepository = dataSource.getRepository(Fundraising);
  const fileRepository = dataSource.getRepository(File);

  console.log('🌱 Seeding fundraisings...');

  // Get all existing fundraisings
  const existingFundraisings = await fundraisingRepository.find({
    relations: ['association', 'createdBy'],
  });

  const uploadsDir = path.join(process.cwd(), 'uploads');

  // Ensure uploads directory exists
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  if (existingFundraisings.length > 0) {
    console.log(
      `⏭️  Fundraisings already exist (${existingFundraisings.length} found), checking for missing images...`
    );

    // Check and add images to existing fundraisings that don't have them
    for (const fundraising of existingFundraisings) {
      const existingImage = await fileRepository.findOne({
        where: {
          relatedTo: 'Fundraising',
          relatedBy: fundraising.id,
          purpose: 'image',
          index: 0,
        },
      });

      if (!existingImage) {
        // Create user-specific directory for fundraising images
        const userDir = path.join(uploadsDir, fundraising.createdBy.userId);
        if (!fs.existsSync(userDir)) {
          fs.mkdirSync(userDir, { recursive: true });
        }

        // Create an image for this fundraising
        const width = faker.number.int({ min: 800, max: 1200 });
        const height = faker.number.int({ min: 600, max: 900 });
        const imageId = faker.number.int({ min: 1, max: 1000 });

        const imageUrl = `https://picsum.photos/id/${imageId}/${width}/${height}`;
        const filename = `fundraising_${fundraising.id}_image`;
        const filepath = path.join(userDir, `${filename}.jpg`);

        try {
          // Download the image
          const { size, mimetype } = await downloadImage(imageUrl, filepath);

          // Create file entity
          const file = fileRepository.create({
            filename: filename, // Without extension - fullFilename() will add it
            relatedTo: 'Fundraising',
            relatedBy: fundraising.id,
            purpose: 'image',
            index: 0,
            userId: fundraising.createdBy.userId,
            oldFilename: `fundraising_image.jpg`,
            mimetype: mimetype,
            extension: 'jpg',
            size: size,
          });

          await fileRepository.save(file);

          console.log(`📸 Added image for existing fundraising: ${filename}.jpg`);
        } catch (error) {
          console.error(
            `❌ Failed to add image for existing fundraising ${fundraising.id}:`,
            error
          );
        }
      }
    }

    return existingFundraisings;
  }

  const fundraisings: Fundraising[] = [];

  for (const association of associations) {
    // Get accepted user associations for this association
    const acceptedUsers = userAssociations.filter(
      (ua) => ua.associationId === association.id && ua.status === 'accepted'
    );

    if (acceptedUsers.length === 0) continue;

    // Create 1-3 fundraisings per association
    const numFundraisings = faker.number.int({ min: 1, max: 3 });

    for (let i = 0; i < numFundraisings; i++) {
      const randomUser = faker.helpers.arrayElement(acceptedUsers);
      const wantedAmount = faker.number.float({ min: 500, max: 10000, fractionDigits: 2 });
      const currentAmount = faker.number.float({ min: 0, max: wantedAmount, fractionDigits: 2 });

      const startDate = faker.date.past({ years: 1 });
      const endDate = faker.date.future({ years: 1 });

      const fundraising = fundraisingRepository.create({
        title: faker.lorem.sentence({ min: 3, max: 8 }),
        description: faker.lorem.paragraphs({ min: 1, max: 2 }),
        amount: currentAmount,
        wantedAmount: wantedAmount,
        startDate: startDate,
        endDate: endDate,
        createdBy: randomUser,
        association: association,
      });

      const savedFundraising = await fundraisingRepository.save(fundraising);
      fundraisings.push(savedFundraising);

      // Create user-specific directory for fundraising images
      const userDir = path.join(uploadsDir, randomUser.userId);
      if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir, { recursive: true });
      }

      // Create an image for this fundraising
      const width = faker.number.int({ min: 800, max: 1200 });
      const height = faker.number.int({ min: 600, max: 900 });
      const imageId = faker.number.int({ min: 1, max: 1000 });

      const imageUrl = `https://picsum.photos/id/${imageId}/${width}/${height}`;
      const filename = `fundraising_${savedFundraising.id}_image`;
      const filepath = path.join(userDir, `${filename}.jpg`);

      try {
        // Download the image
        const { size, mimetype } = await downloadImage(imageUrl, filepath);

        // Create file entity
        const file = fileRepository.create({
          filename: filename, // Without extension - fullFilename() will add it
          relatedTo: 'Fundraising',
          relatedBy: savedFundraising.id,
          purpose: 'image',
          index: 0,
          userId: randomUser.userId,
          oldFilename: `fundraising_image.jpg`,
          mimetype: mimetype,
          extension: 'jpg',
          size: size,
        });

        await fileRepository.save(file);

        console.log(`📸 Downloaded and saved image for fundraising: ${filename}.jpg`);
      } catch (error) {
        console.error(`❌ Failed to download image for fundraising ${savedFundraising.id}:`, error);
      }
    }
  }

  console.log(`✅ Created ${fundraisings.length} fundraisings`);
  return fundraisings;
}
