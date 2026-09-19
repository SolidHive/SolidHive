import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import { Fundraising } from '../modules/associations/modules/fundraisings/entities/fundraising.entity';
import { Association } from '../modules/associations/entities/association.entity';
import { UserAssociation } from '../modules/associations/modules/users/entities/user-association.entity';
import { File } from '../modules/files/entities/file.entity';
import { fileKey, storage } from '../common/storage/storage';
import { downloadImage } from './download-image';

/**
 * Seed fundraisings (cagnottes) for associations
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
        // Create an image for this fundraising
        const width = faker.number.int({ min: 800, max: 1200 });
        const height = faker.number.int({ min: 600, max: 900 });
        const imageId = faker.number.int({ min: 1, max: 1000 });

        const imageUrl = `https://picsum.photos/id/${imageId}/${width}/${height}`;
        const filename = `fundraising_${fundraising.id}_image`;

        try {
          // Télécharge l'image et la dépose dans le stockage
          const { buffer, size, mimetype } = await downloadImage(imageUrl);
          await storage.put(fileKey(fundraising.createdBy.userId, filename), buffer, mimetype);

          // Create file entity
          const file = fileRepository.create({
            filename: filename, // Without extension - fullFilename() will add it
            relatedTo: 'Fundraising',
            relatedBy: fundraising.id,
            purpose: 'image',
            index: 0,
            userId: fundraising.createdBy.userId,
            oldFilename: `fundraising_image`,
            mimetype: mimetype,
            extension: 'jpg',
            size: size,
          });

          await fileRepository.save(file);

          console.log(`📸 Added image for existing fundraising: ${filename}`);
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

      // Create an image for this fundraising
      const width = faker.number.int({ min: 800, max: 1200 });
      const height = faker.number.int({ min: 600, max: 900 });
      const imageId = faker.number.int({ min: 1, max: 1000 });

      const imageUrl = `https://picsum.photos/id/${imageId}/${width}/${height}`;
      const filename = `fundraising_${savedFundraising.id}_image`;

      try {
        // Télécharge l'image et la dépose dans le stockage
        const { buffer, size, mimetype } = await downloadImage(imageUrl);
        await storage.put(fileKey(randomUser.userId, filename), buffer, mimetype);

        // Create file entity
        const file = fileRepository.create({
          filename: filename, // Without extension - fullFilename() will add it
          relatedTo: 'Fundraising',
          relatedBy: savedFundraising.id,
          purpose: 'image',
          index: 0,
          userId: randomUser.userId,
          oldFilename: `fundraising_image`,
          mimetype: mimetype,
          extension: 'jpg',
          size: size,
        });

        await fileRepository.save(file);

        console.log(`📸 Downloaded and saved image for fundraising: ${filename}`);
      } catch (error) {
        console.error(`❌ Failed to download image for fundraising ${savedFundraising.id}:`, error);
      }
    }
  }

  console.log(`✅ Created ${fundraisings.length} fundraisings`);
  return fundraisings;
}
