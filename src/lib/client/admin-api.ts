/**
 * Centralized Client Helper for Admin API, Auth Headers, Local Cache, and Sync.
 */

export const ADMIN_TOKEN_KEY = "mintfolio_admin_token";
export const ADMIN_LOGGED_IN_KEY = "mintfolio_admin_logged_in";

export const CACHE_KEYS = {
  SKILLS: "mintfolio_cache_skills",
  PROJECTS: "mintfolio_cache_projects",
  CATEGORIES: "mintfolio_cache_categories",
  PROFILE: "mintfolio_cache_profile",
  ABOUT: "mintfolio_cache_about",
  CONTACT: "mintfolio_cache_contact",
  INQUIRIES: "mintfolio_cache_inquiries",
};

/**
 * Get current admin session token from localStorage or cookie.
 */
export function getAdminToken(): string {
  if (typeof window === "undefined") return "";
  try {
    const fromStorage = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (fromStorage) return fromStorage.trim();

    // Fallback: parse from document.cookie
    const match = document.cookie.match(new RegExp(`(?:^|; )${ADMIN_TOKEN_KEY}=([^;]*)`));
    if (match && match[1]) {
      return decodeURIComponent(match[1]);
    }
  } catch {
    // ignore
  }
  return "";
}

/**
 * Persist admin token to both localStorage and cookie.
 */
export function setAdminToken(token: string) {
  if (typeof window === "undefined" || !token) return;
  try {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
    localStorage.setItem(ADMIN_LOGGED_IN_KEY, "true");
    document.cookie = `${ADMIN_TOKEN_KEY}=${encodeURIComponent(token)}; path=/; max-age=604800; SameSite=Lax`;
  } catch {
    // ignore
  }
}

/**
 * Clear admin session from localStorage and cookie.
 */
export function clearAdminToken() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_LOGGED_IN_KEY);
    document.cookie = `${ADMIN_TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`;
  } catch {
    // ignore
  }
}

/**
 * Robust fetch wrapper that always attaches Authorization header,
 * credentials, and standardizes error responses.
 */
export async function adminFetch(
  url: string,
  options: RequestInit = {}
): Promise<{ ok: boolean; status: number; data: any; error?: string }> {
  const token = getAdminToken();
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Only add Content-Type: application/json if body is not FormData
  if (options.body && !(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      credentials: "include",
    });

    let json: any = null;
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      try {
        json = await res.json();
      } catch {
        json = null;
      }
    }

    if (!res.ok) {
      let errorMessage = "Terjadi kesalahan pada server.";
      if (json) {
        if (json.error) errorMessage = json.error;
        else if (Array.isArray(json.errors) && json.errors.length > 0) {
          errorMessage = json.errors.join(", ");
        }
      } else if (res.status === 401) {
        errorMessage = "Sesi admin berakhir atau belum login. Silakan login kembali.";
      } else if (res.status === 413) {
        errorMessage = "Ukuran berkas terlalu besar untuk diproses server.";
      } else if (res.status === 404) {
        errorMessage = "Data atau halaman tidak ditemukan.";
      }

      return {
        ok: false,
        status: res.status,
        data: json,
        error: errorMessage,
      };
    }

    return {
      ok: true,
      status: res.status,
      data: json,
    };
  } catch (err: any) {
    return {
      ok: false,
      status: 0,
      data: null,
      error: err?.message || "Gagal terhubung ke jaringan server.",
    };
  }
}

/**
 * Read item from localStorage with fallback.
 */
export function getLocalCache<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed !== null && parsed !== undefined ? (parsed as T) : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Save item to localStorage safely.
 */
export function setLocalCache<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`[admin-api] Failed to save local cache for ${key}:`, err);
  }
}

/**
 * Compresses an image file client-side using HTMLCanvasElement.
 * Reduces 5-10MB camera/phone images down to ~150-350KB while retaining high crispness.
 * Prevents Vercel 4.5MB serverless payload limit errors.
 */
export async function compressImageFile(
  file: File,
  maxDimension = 1600,
  quality = 0.82
): Promise<{ file: File; dataUrl: string }> {
  // If not an image or SVG/GIF, return as is
  if (!file.type.startsWith("image/") || file.type.includes("svg") || file.type.includes("gif")) {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = reject;
      r.readAsDataURL(file);
    });
    return { file, dataUrl };
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          resolve({ file, dataUrl: e.target?.result as string });
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Output as JPEG for efficient compression
        const outputMime = "image/jpeg";
        const dataUrl = canvas.toDataURL(outputMime, quality);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve({ file, dataUrl });
              return;
            }
            const cleanName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
            const compressedFile = new File([blob], cleanName, {
              type: outputMime,
              lastModified: Date.now(),
            });
            resolve({ file: compressedFile, dataUrl });
          },
          outputMime,
          quality
        );
      };
      img.onerror = () => {
        resolve({ file, dataUrl: e.target?.result as string });
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      resolve({ file, dataUrl: "" });
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Sync entire section data to /api/admin/sync in the background.
 */
export async function syncSectionToServer(section: string, data: any): Promise<boolean> {
  try {
    const res = await adminFetch("/api/admin/sync", {
      method: "POST",
      body: JSON.stringify({ [section]: data }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
