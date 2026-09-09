import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import {
  DatabaseSchema,
  ProfileModel,
  AboutModel,
  SkillModel,
  CategoryModel,
  ProjectModel,
  ContactModel,
  InquiryModel,
  AdminSettingsModel,
} from './models';
import { runMigrations, CURRENT_SCHEMA_VERSION } from './migrations';

const DATA_DIR = path.join(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'portfolio.json');

let cachedDb: DatabaseSchema | null = null;

// Ensure directory exists
function ensureDataDir() {
  try {
    if (!fsSync.existsSync(DATA_DIR)) {
      fsSync.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch {
    // Read-only filesystem in serverless environments (e.g. Vercel)
  }
}

/**
 * Reads and initializes database with automated migration.
 */
export async function getDatabase(): Promise<DatabaseSchema> {
  if (cachedDb) {
    return cachedDb;
  }
  ensureDataDir();

  try {
    const raw = await fs.readFile(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    const migrated = runMigrations(parsed);
    if (migrated.version !== parsed.version) {
      await saveDatabase(migrated).catch(() => {});
    }
    cachedDb = migrated;
    return migrated;
  } catch {
    // File missing or invalid: run migrations from scratch
    const initialData = runMigrations(null);
    await saveDatabase(initialData).catch(() => {});
    cachedDb = initialData;
    return initialData;
  }
}

/**
 * Atomic write to avoid file corruption with serverless read-only fallback.
 */
export async function saveDatabase(data: DatabaseSchema): Promise<void> {
  cachedDb = data;
  ensureDataDir();
  const tempFile = `${DB_FILE}.${Date.now()}.tmp`;
  try {
    await fs.writeFile(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    await fs.rename(tempFile, DB_FILE);
  } catch (err) {
    console.warn('[db] Running in read-only environment, persistent file write skipped:', err);
  }
}

/* ============================================================
   Profile Repository
   ============================================================ */
export async function getProfile(): Promise<ProfileModel> {
  const db = await getDatabase();
  return db.profile;
}

export async function updateProfile(updates: Partial<ProfileModel>): Promise<ProfileModel> {
  const db = await getDatabase();
  db.profile = {
    ...db.profile,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  await saveDatabase(db);
  return db.profile;
}

/* ============================================================
   About Repository
   ============================================================ */
export async function getAbout(): Promise<AboutModel> {
  const db = await getDatabase();
  return db.about;
}

export async function updateAbout(updates: Partial<AboutModel>): Promise<AboutModel> {
  const db = await getDatabase();
  db.about = {
    ...db.about,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  await saveDatabase(db);
  return db.about;
}

/* ============================================================
   Skills Repository
   ============================================================ */
export async function getSkills(): Promise<SkillModel[]> {
  const db = await getDatabase();
  return db.skills;
}

export async function createSkill(skill: Omit<SkillModel, 'id' | 'createdAt' | 'updatedAt'>): Promise<SkillModel> {
  const db = await getDatabase();
  const nextId = db.skills.length > 0 ? Math.max(...db.skills.map((s) => s.id)) + 1 : 1;
  const now = new Date().toISOString();
  const newSkill: SkillModel = {
    ...skill,
    id: nextId,
    createdAt: now,
    updatedAt: now,
  };
  db.skills.push(newSkill);
  await saveDatabase(db);
  return newSkill;
}

export async function updateSkill(id: number, updates: Partial<SkillModel>): Promise<SkillModel | null> {
  const db = await getDatabase();
  const index = db.skills.findIndex((s) => s.id === id);
  if (index === -1) return null;

  db.skills[index] = {
    ...db.skills[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  await saveDatabase(db);
  return db.skills[index];
}

export async function deleteSkill(id: number): Promise<boolean> {
  const db = await getDatabase();
  const initialLen = db.skills.length;
  db.skills = db.skills.filter((s) => s.id !== id);
  if (db.skills.length === initialLen) return false;
  await saveDatabase(db);
  return true;
}

export async function reorderSkills(orderedIds: number[]): Promise<SkillModel[]> {
  const db = await getDatabase();
  const idToOrder = new Map<number, number>();
  orderedIds.forEach((id, index) => {
    idToOrder.set(id, index + 1);
  });

  db.skills.forEach((s) => {
    if (idToOrder.has(s.id)) {
      s.order = idToOrder.get(s.id)!;
      s.updatedAt = new Date().toISOString();
    }
  });

  db.skills.sort((a, b) => (a.order || 0) - (b.order || 0));
  await saveDatabase(db);
  return db.skills;
}

/* ============================================================
   Categories Repository
   ============================================================ */
export async function getCategories(): Promise<CategoryModel[]> {
  const db = await getDatabase();
  return db.categories;
}

export async function createCategory(cat: Omit<CategoryModel, 'id' | 'createdAt' | 'updatedAt'>): Promise<CategoryModel> {
  const db = await getDatabase();
  const nextId = db.categories.length > 0 ? Math.max(...db.categories.map((c) => c.id)) + 1 : 1;
  const now = new Date().toISOString();
  const newCat: CategoryModel = {
    ...cat,
    id: nextId,
    createdAt: now,
    updatedAt: now,
  };
  db.categories.push(newCat);
  await saveDatabase(db);
  return newCat;
}

export async function updateCategory(id: number, updates: Partial<CategoryModel>): Promise<CategoryModel | null> {
  const db = await getDatabase();
  const index = db.categories.findIndex((c) => c.id === id);
  if (index === -1) return null;

  db.categories[index] = {
    ...db.categories[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  await saveDatabase(db);
  return db.categories[index];
}

export async function deleteCategory(id: number): Promise<boolean> {
  const db = await getDatabase();
  const initialLen = db.categories.length;
  db.categories = db.categories.filter((c) => c.id !== id);
  if (db.categories.length === initialLen) return false;
  await saveDatabase(db);
  return true;
}

/* ============================================================
   Projects Repository
   ============================================================ */
export async function getProjects(): Promise<ProjectModel[]> {
  const db = await getDatabase();
  return db.projects;
}

export async function createProject(project: Omit<ProjectModel, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProjectModel> {
  const db = await getDatabase();
  const nextId = db.projects.length > 0 ? Math.max(...db.projects.map((p) => p.id)) + 1 : 1;
  const now = new Date().toISOString();
  const newProject: ProjectModel = {
    ...project,
    id: nextId,
    createdAt: now,
    updatedAt: now,
  };
  db.projects.push(newProject);
  await saveDatabase(db);
  return newProject;
}

export async function updateProject(id: number, updates: Partial<ProjectModel>): Promise<ProjectModel | null> {
  const db = await getDatabase();
  const index = db.projects.findIndex((p) => p.id === id);
  if (index === -1) return null;

  db.projects[index] = {
    ...db.projects[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  await saveDatabase(db);
  return db.projects[index];
}

export async function deleteProject(id: number): Promise<boolean> {
  const db = await getDatabase();
  const initialLen = db.projects.length;
  db.projects = db.projects.filter((p) => p.id !== id);
  if (db.projects.length === initialLen) return false;
  await saveDatabase(db);
  return true;
}

export async function reorderProjects(orders: { id: number; order: number }[]): Promise<ProjectModel[]> {
  const db = await getDatabase();
  const idToOrder = new Map(orders.map((o) => [o.id, o.order]));

  db.projects.forEach((p) => {
    if (idToOrder.has(p.id)) {
      p.order = idToOrder.get(p.id)!;
      p.updatedAt = new Date().toISOString();
    }
  });

  db.projects.sort((a, b) => (a.order || 0) - (b.order || 0));
  await saveDatabase(db);
  return db.projects;
}

/* ============================================================
   Contact Repository
   ============================================================ */
export async function getContact(): Promise<ContactModel> {
  const db = await getDatabase();
  return db.contact;
}

export async function updateContact(updates: Partial<ContactModel>): Promise<ContactModel> {
  const db = await getDatabase();
  db.contact = {
    ...db.contact,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  await saveDatabase(db);
  return db.contact;
}

/* ============================================================
   Inquiries Repository
   ============================================================ */
export async function getInquiries(): Promise<InquiryModel[]> {
  const db = await getDatabase();
  return db.inquiries || [];
}

export async function createInquiry(inquiry: Omit<InquiryModel, 'id' | 'read' | 'createdAt'>): Promise<InquiryModel> {
  const db = await getDatabase();
  const newInquiry: InquiryModel = {
    ...inquiry,
    id: `inq-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    read: false,
    createdAt: new Date().toISOString(),
  };
  if (!db.inquiries) db.inquiries = [];
  db.inquiries.unshift(newInquiry);
  await saveDatabase(db);
  return newInquiry;
}

export async function markInquiryRead(id: string, read: boolean = true): Promise<boolean> {
  const db = await getDatabase();
  if (!db.inquiries) return false;
  const inq = db.inquiries.find((i) => i.id === id);
  if (!inq) return false;
  inq.read = read;
  await saveDatabase(db);
  return true;
}

export async function deleteInquiry(id: string): Promise<boolean> {
  const db = await getDatabase();
  if (!db.inquiries) return false;
  const len = db.inquiries.length;
  db.inquiries = db.inquiries.filter((i) => i.id !== id);
  if (db.inquiries.length === len) return false;
  await saveDatabase(db);
  return true;
}

/* ============================================================
   Settings Repository
   ============================================================ */
export async function getAdminSettings(): Promise<AdminSettingsModel> {
  const db = await getDatabase();
  if (!db.settings) {
    db.settings = {
      siteTitle: 'MintFolio Interaktif',
      adminEmail: 'admin@mintfolio.local',
      theme: 'dark-mint',
      maintenanceMode: false,
      updatedAt: new Date().toISOString(),
    };
    await saveDatabase(db);
  }
  return db.settings;
}

export async function updateAdminSettings(updates: Partial<AdminSettingsModel>): Promise<AdminSettingsModel> {
  const db = await getDatabase();
  const current = await getAdminSettings();
  db.settings = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  await saveDatabase(db);
  return db.settings;
}
