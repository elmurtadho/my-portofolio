import { getAdminToken, compressImageFile } from "./admin-api";

export interface UploadResult {
  success: boolean;
  url?: string;
  filename?: string;
  mediaType?: "image" | "video" | "model3d";
  error?: string;
}

export interface UploadOptions {
  maxSizeMB?: number;
  allowedTypes?: string[];
  allowedExtensions?: string[];
}

/**
 * Uploads a file to /api/admin/upload with automated client-side data URL fallback
 * and image compression for robust execution even in serverless environments.
 */
export async function uploadMediaFile(
  file: File,
  options?: UploadOptions
): Promise<UploadResult> {
  const maxSize = (options?.maxSizeMB || 35) * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      success: false,
      error: `Ukuran berkas "${file.name}" (${(file.size / (1024 * 1024)).toFixed(1)}MB) melebihi batas maksimal ${options?.maxSizeMB || 35}MB.`,
    };
  }

  if (options?.allowedExtensions && options.allowedExtensions.length > 0) {
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    const isAllowed = options.allowedExtensions.some((e) => e.toLowerCase() === ext);
    if (!isAllowed) {
      return {
        success: false,
        error: `Format berkas "${ext}" tidak didukung. Format yang diizinkan: ${options.allowedExtensions.join(", ")}`,
      };
    }
  }

  // Optimize & compress image client-side to prevent Vercel 4.5MB payload limit
  let processedFile = file;
  let compressedDataUrl = "";

  if (file.type.startsWith("image/") && !file.type.includes("svg") && !file.type.includes("gif")) {
    try {
      const compressed = await compressImageFile(file, 1600, 0.82);
      processedFile = compressed.file;
      compressedDataUrl = compressed.dataUrl;
    } catch {
      // fallback to original file
    }
  } else if (file.size < 6 * 1024 * 1024) {
    try {
      compressedDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    } catch {
      // ignore
    }
  }

  const token = getAdminToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const fd = new FormData();
  fd.append("file", processedFile);

  try {
    const res = await fetch("/api/admin/upload", {
      method: "POST",
      headers,
      credentials: "include",
      body: fd,
    });

    let data: any = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }

    if (res.ok && data?.success && data?.data?.url) {
      return {
        success: true,
        url: data.data.url,
        filename: data.data.filename || processedFile.name,
        mediaType: data.data.mediaType || (processedFile.type.startsWith("video/") ? "video" : "image"),
      };
    }

    // If server returned read-only or upload failed, use compressed data URL
    if (compressedDataUrl) {
      return {
        success: true,
        url: compressedDataUrl,
        filename: processedFile.name,
        mediaType: processedFile.type.startsWith("video/") ? "video" : "image",
      };
    }

    return {
      success: false,
      error: data?.error || "Gagal mengunggah berkas ke server.",
    };
  } catch (err: any) {
    if (compressedDataUrl) {
      return {
        success: true,
        url: compressedDataUrl,
        filename: processedFile.name,
        mediaType: processedFile.type.startsWith("video/") ? "video" : "image",
      };
    }
    return {
      success: false,
      error: err?.message || "Terjadi kendala jaringan saat mengunggah berkas.",
    };
  }
}
