import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { isTursoEnabled, saveTursoMedia } from './turso';

export const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

export function ensureUploadsDir() {
  try {
    if (!fsSync.existsSync(UPLOADS_DIR)) {
      fsSync.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
  } catch {
    // Read-only filesystem in serverless environments (e.g. Vercel)
  }
}

export type MediaType = 'image' | 'video' | 'model3d';

export function detectMediaType(filename: string, mimeType?: string): MediaType {
  const ext = path.extname(filename).toLowerCase().replace('.', '');
  
  if (['glb', 'gltf', 'obj', 'fbx', 'stl', 'ply', 'usdz', 'bin'].includes(ext)) {
    return 'model3d';
  }

  if (['mp4', 'webm', 'mov', 'mkv', 'avi'].includes(ext) || (mimeType && mimeType.startsWith('video/'))) {
    return 'video';
  }

  return 'image';
}

export function sanitizeFilename(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase();
  const baseName = path.basename(originalName, ext)
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-');
  const safeBase = baseName.substring(0, 50) || 'file';
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 6);
  return `${safeBase}-${timestamp}-${random}${ext}`;
}

export interface StoredFile {
  filename: string;
  url: string;
  mediaType: MediaType;
  size: number;
  originalName: string;
  createdAt: string;
}

export async function saveUploadedFile(file: File): Promise<StoredFile> {
  const originalName = file.name;
  const safeName = sanitizeFilename(originalName);
  const mediaType = detectMediaType(originalName, file.type);
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const mimeType = file.type || (mediaType === 'image' ? 'image/png' : 'application/octet-stream');

  // 1. If Turso Cloud DB is active, persist directly to Turso portfolio_media table
  if (isTursoEnabled()) {
    try {
      const media = await saveTursoMedia(originalName, mimeType, buffer);
      return {
        filename: media.filename,
        url: media.url,
        mediaType,
        size: media.size,
        originalName,
        createdAt: new Date().toISOString(),
      };
    } catch (err) {
      console.error('[storage] Failed to save media to Turso:', err);
    }
  }

  // 2. Local filesystem if writable (development)
  ensureUploadsDir();
  const targetPath = path.join(UPLOADS_DIR, safeName);
  try {
    await fs.writeFile(targetPath, buffer);
    const url = `/uploads/${safeName}`;

    return {
      filename: safeName,
      url,
      mediaType,
      size: file.size,
      originalName,
      createdAt: new Date().toISOString(),
    };
  } catch {
    // Read-only fallback
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${mimeType};base64,${base64}`;

    return {
      filename: safeName,
      url: dataUrl,
      mediaType,
      size: file.size,
      originalName,
      createdAt: new Date().toISOString(),
    };
  }
}

export async function listUploadedFiles(): Promise<StoredFile[]> {
  ensureUploadsDir();
  try {
    const files = await fs.readdir(UPLOADS_DIR);
    const results: StoredFile[] = [];

    for (const file of files) {
      const filePath = path.join(UPLOADS_DIR, file);
      const stat = await fs.stat(filePath);
      if (stat.isFile()) {
        results.push({
          filename: file,
          url: `/uploads/${file}`,
          mediaType: detectMediaType(file),
          size: stat.size,
          originalName: file,
          createdAt: stat.birthtime.toISOString(),
        });
      }
    }

    // sort newest first
    return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch {
    return [];
  }
}

export async function deleteUploadedFile(filename: string): Promise<boolean> {
  ensureUploadsDir();
  // Sanitize path to prevent directory traversal
  const safeName = path.basename(filename);
  const targetPath = path.join(UPLOADS_DIR, safeName);

  try {
    if (fsSync.existsSync(targetPath)) {
      await fs.unlink(targetPath);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
