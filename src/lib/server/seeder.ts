import { getDatabase, saveDatabase } from './db';
import { getInitialSeedData } from './migrations';

/**
 * Seeds the database with default data for all portfolio sections:
 * - Profile (name, greeting, roles, tagline, bio)
 * - About Me (story, stats, milestones, philosophy)
 * - Skills (UI/UX, 3D, Video, Graphic Design, Web)
 * - Categories (Graphic Design, UI/UX, Video Editor, 3D Modeling)
 * - Projects (image, video, model3d showcase)
 * - Contact (email, phone, location, social networks)
 * - Inquiries (sample starter contact messages)
 */
export async function seedDatabase(force: boolean = false) {
  const currentDb = await getDatabase();

  if (!force && currentDb.projects && currentDb.projects.length > 0) {
    console.log('✓ Database already populated. Skipping seeder.');
    return currentDb;
  }

  const seedData = getInitialSeedData();
  await saveDatabase(seedData);
  console.log('✓ Database successfully seeded for all sections.');
  return seedData;
}

// Auto-run if executed directly via node
if (typeof require !== 'undefined' && require.main === module) {
  seedDatabase(true)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seeding failed:', err);
      process.exit(1);
    });
}
