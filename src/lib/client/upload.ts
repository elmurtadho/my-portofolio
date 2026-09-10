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
 * for robust execution even in serverless read-only environments.
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

  // Pre-generate base64 Data URL for guaranteed immediate fallback if needed
  const readDataUrl = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Gagal membaca berkas lokal."));
      reader.readAsDataURL(file);
    });
  };

  let localDataUrl = "";
  try {
    if (file.type.startsWith("image/") || file.size < 6 * 1024 * 1024) {
      localDataUrl = await readDataUrl();
    }
  } catch {
    // continue to server upload
  }

  const fd = new FormData();
  fd.append("file", file);

  try {
    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: fd,
    });

    const data = await res.json();
    if (res.ok && data.success && data.data?.url) {
      return {
        success: true,
        url: data.data.url,
        filename: data.data.filename || file.name,
        mediaType: data.data.mediaType || (file.type.startsWith("video/") ? "video" : "image"),
      };
    }

    // If server returned error or read-only filesystem, use the local data URL
    if (localDataUrl) {
      return {
        success: true,
        url: localDataUrl,
        filename: file.name,
        mediaType: file.type.startsWith("video/") ? "video" : "image",
      };
    }

    return {
      success: false,
      error: data.error || "Gagal mengunggah berkas ke server.",
    };
  } catch (err: any) {
    if (localDataUrl) {
      return {
        success: true,
        url: localDataUrl,
        filename: file.name,
        mediaType: file.type.startsWith("video/") ? "video" : "image",
      };
    }
    return {
      success: false,
      error: err?.message || "Terjadi kendala jaringan saat mengunggah berkas.",
    };
  }
}
