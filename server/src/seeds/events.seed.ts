import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import { Event } from '../modules/associations/modules/events/entities/event.entity';
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
 * Seed events for associations
 */
export async function seedEvents(
  dataSource: DataSource,
  associations: Association[],
  userAssociations: UserAssociation[]
): Promise<Event[]> {
  const eventRepository = dataSource.getRepository(Event);
  const fileRepository = dataSource.getRepository(File);

  console.log('🌱 Seeding events...');

  // Get all existing events
  const existingEvents = await eventRepository.find({
    relations: ['association', 'createdBy'],
  });

  const uploadsDir = path.join(process.cwd(), 'uploads');

  // Ensure uploads directory exists
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  if (existingEvents.length > 0) {
    console.log(
      `⏭️  Events already exist (${existingEvents.length} found), checking for missing images...`
    );

    // Check and add images to existing events that don't have them
    for (const event of existingEvents) {
      const existingImage = await fileRepository.findOne({
        where: {
          relatedTo: 'Event',
          relatedBy: event.id,
          purpose: 'image',
          index: 0,
        },
      });

      if (!existingImage) {
        // Create user-specific directory for event images
        const userDir = path.join(uploadsDir, event.createdBy.userId);
        if (!fs.existsSync(userDir)) {
          fs.mkdirSync(userDir, { recursive: true });
        }

        // Create an image for this event
        const width = faker.number.int({ min: 800, max: 1200 });
        const height = faker.number.int({ min: 600, max: 900 });
        const imageId = faker.number.int({ min: 1, max: 1000 });

        const imageUrl = `https://picsum.photos/id/${imageId}/${width}/${height}`;
        const filename = `event_${event.id}_image`;
        const filepath = path.join(userDir, `${filename}.jpg`);

        try {
          // Download the image
          const { size, mimetype } = await downloadImage(imageUrl, filepath);

          // Create file entity
          const file = fileRepository.create({
            filename: filename, // Without extension - fullFilename() will add it
            relatedTo: 'Event',
            relatedBy: event.id,
            purpose: 'image',
            index: 0,
            userId: event.createdBy.userId,
            oldFilename: `event_image.jpg`,
            mimetype: mimetype,
            extension: 'jpg',
            size: size,
          });

          await fileRepository.save(file);

          console.log(`📸 Added image for existing event: ${filename}.jpg`);
        } catch (error) {
          console.error(`❌ Failed to add image for existing event ${event.id}:`, error);
        }
      }
    }

    return existingEvents;
  }

  const events: Event[] = [];

  for (const association of associations) {
    // Get accepted user associations for this association
    const acceptedUsers = userAssociations.filter(
      (ua) => ua.associationId === association.id && ua.status === 'accepted'
    );

    if (acceptedUsers.length === 0) continue;

    // Create 1-4 events per association
    const numEvents = faker.number.int({ min: 1, max: 4 });

    for (let i = 0; i < numEvents; i++) {
      const randomUser = faker.helpers.arrayElement(acceptedUsers);

      const startDate = faker.date.future({ years: 1 });
      const duration = faker.number.int({ min: 1, max: 8 }); // 1-8 hours
      const endDate = new Date(startDate.getTime() + duration * 60 * 60 * 1000);

      const event = eventRepository.create({
        title: faker.lorem.sentence({ min: 3, max: 8 }),
        description: faker.lorem.paragraphs({ min: 1, max: 2 }),
        amount: faker.number.float({ min: 0, max: 100, fractionDigits: 2 }),
        startDate: startDate,
        endDate: endDate,
        address: {
          street: faker.location.streetAddress(),
          city: faker.location.city(),
          state: faker.location.state(),
          postcode: faker.location.zipCode(),
          country: faker.location.country(),
        },
        createdBy: randomUser,
        association: association,
      });

      const savedEvent = await eventRepository.save(event);
      events.push(savedEvent);

      // Create user-specific directory for event images
      const userDir = path.join(uploadsDir, randomUser.userId);
      if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir, { recursive: true });
      }

      // Create an image for this event
      const width = faker.number.int({ min: 800, max: 1200 });
      const height = faker.number.int({ min: 600, max: 900 });
      const imageId = faker.number.int({ min: 1, max: 1000 });

      const imageUrl = `https://picsum.photos/id/${imageId}/${width}/${height}`;
      const filename = `event_${savedEvent.id}_image`;
      const filepath = path.join(userDir, `${filename}.jpg`);

      try {
        // Download the image
        const { size, mimetype } = await downloadImage(imageUrl, filepath);

        // Create file entity
        const file = fileRepository.create({
          filename: filename, // Without extension - fullFilename() will add it
          relatedTo: 'Event',
          relatedBy: savedEvent.id,
          purpose: 'image',
          index: 0,
          userId: randomUser.userId,
          oldFilename: `event_image.jpg`,
          mimetype: mimetype,
          extension: 'jpg',
          size: size,
        });

        await fileRepository.save(file);

        console.log(`📸 Downloaded and saved image for event: ${filename}.jpg`);
      } catch (error) {
        console.error(`❌ Failed to download image for event ${savedEvent.id}:`, error);
      }
    }
  }

  console.log(`✅ Created ${events.length} events`);
  return events;
}
