import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import { AssociationAnnouncement } from '../modules/associations/modules/announcements/entities/association-announcement.entity';
import { Association } from '../modules/associations/entities/association.entity';
import { UserAssociation } from '../modules/associations/modules/users/entities/user-association.entity';
import { File } from '../modules/files/entities/file.entity';
import { fileKey, storage } from '../common/storage/storage';
import { downloadImage } from './download-image';

export async function seedAnnouncements(
  dataSource: DataSource,
  associations: Association[],
  userAssociations: UserAssociation[]
): Promise<AssociationAnnouncement[]> {
  const announcementRepository = dataSource.getRepository(AssociationAnnouncement);
  const fileRepository = dataSource.getRepository(File);

  console.log('🌱 Seeding announcements...');

  // Check if announcements already exist
  const existingCount = await announcementRepository.count();
  if (existingCount > 0) {
    console.log(`⏭️  Announcements already exist (${existingCount} found), skipping...`);
    return [];
  }

  const announcements: AssociationAnnouncement[] = [];

  for (const association of associations) {
    // Get accepted user associations for this association
    const acceptedUsers = userAssociations.filter(
      (ua) => ua.associationId === association.id && ua.status === 'accepted'
    );

    if (acceptedUsers.length === 0) continue;

    // Create 2-5 announcements per association
    const numAnnouncements = faker.number.int({ min: 2, max: 5 });

    for (let i = 0; i < numAnnouncements; i++) {
      const randomUser = faker.helpers.arrayElement(acceptedUsers);

      const announcement = announcementRepository.create({
        title: faker.lorem.sentence({ min: 3, max: 8 }),
        content: faker.lorem.paragraphs({ min: 1, max: 3 }),
        isActive: faker.datatype.boolean({ probability: 0.8 }), // 80% chance of being active
        createdBy: randomUser,
        association: association,
      });

      const savedAnnouncement = await announcementRepository.save(announcement);
      announcements.push(savedAnnouncement);

      // Create an image for this announcement
      const width = faker.number.int({ min: 800, max: 1200 });
      const height = faker.number.int({ min: 600, max: 900 });
      const imageId = faker.number.int({ min: 1, max: 1000 });

      const imageUrl = `https://picsum.photos/id/${imageId}/${width}/${height}`;
      const filename = `announcement_${savedAnnouncement.id}_image`;

      try {
        // Télécharge l'image et la dépose dans le stockage
        const { buffer, size, mimetype } = await downloadImage(imageUrl);
        await storage.put(fileKey(randomUser.userId, filename), buffer, mimetype);

        // Create file entity
        const file = fileRepository.create({
          filename: filename, // Without extension - fullFilename() will add it
          relatedTo: 'AssociationAnnouncement',
          relatedBy: savedAnnouncement.id,
          purpose: 'image',
          index: 0,
          userId: randomUser.userId,
          oldFilename: `announcement_image`,
          mimetype: mimetype,
          extension: 'jpg',
          size: size,
        });

        await fileRepository.save(file);

        console.log(`📸 Downloaded and saved image for announcement: ${filename}`);
      } catch (error) {
        console.error(
          `❌ Failed to download image for announcement ${savedAnnouncement.id}:`,
          error
        );
      }
    }
  }

  console.log(`✅ Created ${announcements.length} announcements`);
  return announcements;
}
