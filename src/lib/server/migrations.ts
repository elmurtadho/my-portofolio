import { DatabaseSchema } from './models';
import {
  initialProfile,
  initialAbout,
  initialSkills,
  initialCategories,
  initialProjects,
  initialContact,
} from '../mock-data';

export const CURRENT_SCHEMA_VERSION = 2;

/**
 * Initial seed migration (Version 2)
 */
export function getInitialSeedData(): DatabaseSchema {
  const now = new Date().toISOString();

  return {
    version: CURRENT_SCHEMA_VERSION,
    migratedAt: now,
    profile: {
      ...initialProfile,
      updatedAt: now,
    },
    about: {
      ...initialAbout,
      updatedAt: now,
    },
    skills: initialSkills.map((s, idx) => ({
      ...s,
      order: idx + 1,
      createdAt: now,
      updatedAt: now,
    })),
    categories: initialCategories.map((c, idx) => ({
      ...c,
      order: idx + 1,
      createdAt: now,
      updatedAt: now,
    })),
    projects: initialProjects.map((p, idx) => ({
      ...p,
      order: idx + 1,
      createdAt: now,
      updatedAt: now,
    })),
    contact: {
      ...initialContact,
      updatedAt: now,
    },
    inquiries: [
      {
        id: 'inq-initial-1',
        name: 'Ahmad Fauzi',
        email: 'ahmad.fauzi@example.com',
        subject: 'Tawaran Proyek Desain 3D & UI/UX',
        message:
          'Halo, saya sangat terkesan dengan portofolio interaktif Anda. Kami membutuhkan visualisator 3D dan desainer UI/UX untuk peluncuran produk kami bulan depan.',
        read: false,
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      },
    ],
    settings: {
      siteTitle: 'MintFolio Interaktif',
      adminEmail: 'admin@mintfolio.local',
      theme: 'dark-mint',
      maintenanceMode: false,
      updatedAt: now,
    },
  };
}

/**
 * Migration runner: checks current version and applies sequential migrations.
 */
export function runMigrations(existingData: Partial<DatabaseSchema> | null): DatabaseSchema {
  if (!existingData || typeof existingData.version !== 'number') {
    return getInitialSeedData();
  }

  let data = { ...existingData } as DatabaseSchema;
  const now = new Date().toISOString();

  // Migration v0 -> v1
  if (data.version < 1) {
    const seed = getInitialSeedData();
    data = {
      ...seed,
      ...data,
      version: 1,
      migratedAt: now,
    };
  }

  // Migration v1 -> v2: Add admin settings & schema normalization
  if (data.version < 2) {
    data = {
      ...data,
      version: 2,
      migratedAt: now,
      settings: data.settings || {
        siteTitle: 'MintFolio Interaktif',
        adminEmail: 'admin@mintfolio.local',
        theme: 'dark-mint',
        maintenanceMode: false,
        updatedAt: now,
      },
      skills: (data.skills || []).map((s, idx) => ({
        ...s,
        level: typeof s.level === 'number' ? s.level : 80,
        category: s.category || 'Design & UI/UX',
        order: s.order || idx + 1,
        createdAt: s.createdAt || now,
        updatedAt: s.updatedAt || now,
      })),
      categories: (data.categories || []).map((c, idx) => ({
        ...c,
        order: c.order || idx + 1,
        createdAt: c.createdAt || now,
        updatedAt: c.updatedAt || now,
      })),
      projects: (data.projects || []).map((p, idx) => ({
        ...p,
        mediaType: p.mediaType || 'image',
        thumbnailUrl: p.thumbnailUrl || p.mediaUrl || '',
        order: p.order || idx + 1,
        createdAt: p.createdAt || now,
        updatedAt: p.updatedAt || now,
      })),
    };
  }

  return data;
}
