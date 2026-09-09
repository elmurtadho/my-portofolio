export interface ProfileModel {
  displayName: string;
  greeting: string;
  roles: string[];
  role?: string;
  tagline: string;
  photoUrl: string;
  bio?: string;
  status?: string;
  updatedAt: string;
}

export interface AboutModel {
  bio: string;
  experienceYears: number;
  completedProjects: number;
  highlightPoints: string[];
  imageUrl: string;
  updatedAt: string;
}

export interface SkillModel {
  id: number;
  name: string;
  level: number;
  category: string;
  icon?: string;
  order?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryModel {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  count?: number;
  order?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectModel {
  id: number;
  title: string;
  description: string;
  categorySlug: string;
  mediaType: "image" | "video" | "model3d";
  mediaUrl: string;
  thumbnailUrl: string;
  featured?: boolean;
  tags: string[];
  order?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SocialLinkModel {
  platform: string;
  url: string;
}

export interface ContactModel {
  email: string;
  phone: string;
  location: string;
  socials: SocialLinkModel[];
  updatedAt: string;
}

export interface InquiryModel {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface AdminSettingsModel {
  siteTitle: string;
  adminEmail: string;
  theme: string;
  maintenanceMode: boolean;
  updatedAt: string;
}

export interface DatabaseSchema {
  version: number;
  migratedAt: string;
  profile: ProfileModel;
  about: AboutModel;
  skills: SkillModel[];
  categories: CategoryModel[];
  projects: ProjectModel[];
  contact: ContactModel;
  inquiries: InquiryModel[];
  settings?: AdminSettingsModel;
}
