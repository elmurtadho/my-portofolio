import {
  ProfileModel,
  AboutModel,
  SkillModel,
  CategoryModel,
  ProjectModel,
  ContactModel,
  InquiryModel,
} from './models';

export interface ValidationResult<T> {
  valid: boolean;
  errors?: string[];
  data?: T;
}

export function validateProfile(input: any): ValidationResult<Partial<ProfileModel>> {
  const errors: string[] = [];
  if (!input || typeof input !== 'object') {
    return { valid: false, errors: ['Data profil tidak valid'] };
  }

  if (input.displayName && typeof input.displayName !== 'string') {
    errors.push('Nama tampilan harus berupa teks');
  }
  if (input.greeting && typeof input.greeting !== 'string') {
    errors.push('Sapaan harus berupa teks');
  }
  if (input.roles && !Array.isArray(input.roles)) {
    errors.push('Roles harus berupa array teks');
  }
  if (input.tagline && typeof input.tagline !== 'string') {
    errors.push('Tagline harus berupa teks');
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    data: input,
  };
}

export function validateAbout(input: any): ValidationResult<Partial<AboutModel>> {
  const errors: string[] = [];
  if (!input || typeof input !== 'object') {
    return { valid: false, errors: ['Data tentang saya tidak valid'] };
  }

  if (input.bio !== undefined && typeof input.bio !== 'string') {
    errors.push('Biografi harus berupa teks');
  }
  if (input.experienceYears !== undefined && (typeof input.experienceYears !== 'number' || input.experienceYears < 0)) {
    errors.push('Tahun pengalaman harus berupa angka positif');
  }
  if (input.completedProjects !== undefined && (typeof input.completedProjects !== 'number' || input.completedProjects < 0)) {
    errors.push('Jumlah proyek selesai harus berupa angka positif');
  }
  if (input.highlightPoints !== undefined && !Array.isArray(input.highlightPoints)) {
    errors.push('Poin sorotan harus berupa array teks');
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    data: input,
  };
}

export function validateSkill(input: any): ValidationResult<Partial<SkillModel>> {
  const errors: string[] = [];
  if (!input || typeof input !== 'object') {
    return { valid: false, errors: ['Data keahlian tidak valid'] };
  }

  if (input.name !== undefined && (typeof input.name !== 'string' || !input.name.trim())) {
    errors.push('Nama keahlian wajib diisi');
  }
  if (input.level !== undefined && (typeof input.level !== 'number' || input.level < 0 || input.level > 100)) {
    errors.push('Level keahlian harus berupa angka antara 0 hingga 100');
  }
  if (input.category !== undefined && typeof input.category !== 'string') {
    errors.push('Kategori keahlian harus berupa teks');
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    data: input,
  };
}

export function validateProject(input: any): ValidationResult<Partial<ProjectModel>> {
  const errors: string[] = [];
  if (!input || typeof input !== 'object') {
    return { valid: false, errors: ['Data proyek tidak valid'] };
  }

  if (input.title !== undefined && (typeof input.title !== 'string' || !input.title.trim())) {
    errors.push('Judul proyek wajib diisi');
  }
  if (input.categorySlug !== undefined && typeof input.categorySlug !== 'string') {
    errors.push('Slug kategori proyek harus berupa teks');
  }
  if (input.mediaType !== undefined && !['image', 'video', 'model3d'].includes(input.mediaType)) {
    errors.push('Tipe media harus salah satu dari: image, video, atau model3d');
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    data: input,
  };
}

export function validateCategory(input: any): ValidationResult<Partial<CategoryModel>> {
  const errors: string[] = [];
  if (!input || typeof input !== 'object') {
    return { valid: false, errors: ['Data kategori tidak valid'] };
  }

  if (input.name !== undefined && (typeof input.name !== 'string' || !input.name.trim())) {
    errors.push('Nama kategori wajib diisi');
  }
  if (input.slug !== undefined && (typeof input.slug !== 'string' || !input.slug.trim())) {
    errors.push('Slug kategori wajib diisi');
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    data: input,
  };
}


export function validateInquiry(input: any): ValidationResult<Omit<InquiryModel, 'id' | 'read' | 'createdAt'>> {
  const errors: string[] = [];
  if (!input || typeof input !== 'object') {
    return { valid: false, errors: ['Data formulir pesan tidak valid'] };
  }

  if (!input.name || typeof input.name !== 'string' || !input.name.trim()) {
    errors.push('Nama pengirim wajib diisi');
  }
  if (!input.email || typeof input.email !== 'string' || !input.email.includes('@')) {
    errors.push('Alamat email valid wajib diisi');
  }
  if (!input.message || typeof input.message !== 'string' || !input.message.trim()) {
    errors.push('Isi pesan wajib diisi');
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    data: {
      name: String(input.name).trim(),
      email: String(input.email).trim(),
      subject: input.subject ? String(input.subject).trim() : 'Pesan Baru Portofolio',
      message: String(input.message).trim(),
    },
  };
}

export function validateContact(input: any): ValidationResult<Partial<ContactModel>> {
  const errors: string[] = [];
  if (!input || typeof input !== 'object') {
    return { valid: false, errors: ['Data kontak tidak valid'] };
  }

  if (input.email !== undefined && (typeof input.email !== 'string' || !input.email.includes('@'))) {
    errors.push('Format email tidak valid');
  }
  if (input.phone !== undefined && typeof input.phone !== 'string') {
    errors.push('Nomor telepon harus berupa teks');
  }
  if (input.location !== undefined && typeof input.location !== 'string') {
    errors.push('Lokasi harus berupa teks');
  }
  if (input.socials !== undefined && !Array.isArray(input.socials)) {
    errors.push('Daftar media sosial harus berupa array');
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    data: input,
  };
}

export function validateAdminSettings(input: any): ValidationResult<any> {
  const errors: string[] = [];
  if (!input || typeof input !== 'object') {
    return { valid: false, errors: ['Data pengaturan admin tidak valid'] };
  }

  if (input.siteTitle !== undefined && typeof input.siteTitle !== 'string') {
    errors.push('Judul situs harus berupa teks');
  }
  if (input.adminEmail !== undefined && (typeof input.adminEmail !== 'string' || !input.adminEmail.includes('@'))) {
    errors.push('Format email admin tidak valid');
  }
  if (input.maintenanceMode !== undefined && typeof input.maintenanceMode !== 'boolean') {
    errors.push('Status mode pemeliharaan harus berupa boolean');
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    data: input,
  };
}

