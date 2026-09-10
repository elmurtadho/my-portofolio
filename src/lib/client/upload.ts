import { getAdminToken, compressImageFile } from "./admin-api";

export interface UploadResult {
  success: boolean;
  url?: string;
  filename?: string;
  mediaType?: "image" | "video" | "model3d";
  error?: string;
}

export interface UploadProgressInfo {
  current: number;
  total: number;
  percent: number;
  loadedBytes: number;
  totalBytes: number;
}

export interface UploadOptions {
  maxSizeMB?: number;
  allowedTypes?: string[];
  allowedExtensions?: string[];
  onProgress?: (percent: number, info: UploadProgressInfo) => void;
}

/**
 * Checks if a file is a video based on MIME type or extension.
 */
export function isVideoFile(file: File): boolean {
  if (file.type && file.type.startsWith("video/")) return true;
  return /\.(mp4|webm|mov|mkv|avi|m4v|3gp)$/i.test(file.name);
}

/**
 * Checks if a file is a 3D model based on MIME type or extension.
 */
export function is3DFile(file: File): boolean {
  return /\.(glb|gltf|obj|fbx)$/i.test(file.name);
}

/**
 * Converts a data URL to a standard File object.
 */
export function dataUrlToFile(dataUrl: string, filename: string): File {
  const arr = dataUrl.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] || "image/jpeg";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

/**
 * Extracts a video frame as a high-resolution JPEG Data URL from a File or URL.
 */
export async function captureVideoThumbnail(
  source: File | string,
  timeSec: number = 1.0
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      return reject(new Error("Video thumbnail capture only runs in browser."));
    }

    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";

    let urlToRevoke = "";
    if (source instanceof File) {
      urlToRevoke = URL.createObjectURL(source);
      video.src = urlToRevoke;
    } else {
      video.src = source;
    }

    const cleanup = () => {
      if (urlToRevoke) {
        URL.revokeObjectURL(urlToRevoke);
      }
      video.remove();
    };

    video.onloadedmetadata = () => {
      const seekTime = Math.min(timeSec, Math.max(0.1, (video.duration || 2) / 2));
      video.currentTime = seekTime;
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          cleanup();
          return reject(new Error("Canvas 2D context not available."));
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
        cleanup();
        resolve(dataUrl);
      } catch (err) {
        cleanup();
        reject(err);
      }
    };

    video.onerror = () => {
      cleanup();
      reject(new Error("Gagal memuat video untuk mengambil thumbnail."));
    };

    setTimeout(() => {
      cleanup();
      reject(new Error("Waktu tunggu pengambilan frame video habis."));
    }, 12000);
  });
}

/**
 * Uploads media with automatic chunked upload for large files (>3MB) and video (up to 250MB),
 * bypassing Vercel serverless 4.5MB payload limits with real-time progress callbacks.
 */
export async function uploadMediaFile(
  file: File,
  options?: UploadOptions
): Promise<UploadResult> {
  const isVideo = isVideoFile(file);
  const is3D = is3DFile(file);

  // Dynamic capacity: 250MB for video, 100MB for 3D, 35MB for images
  const defaultMaxMB = isVideo ? 250 : is3D ? 100 : 35;
  const maxSizeMB = options?.maxSizeMB || defaultMaxMB;
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (file.size > maxSizeBytes) {
    return {
      success: false,
      error: `Ukuran berkas "${file.name}" (${(file.size / (1024 * 1024)).toFixed(1)}MB) melebihi batas maksimal ${maxSizeMB}MB.${
        !isVideo ? " Untuk kapasitas hingga 250MB, gunakan format video." : ""
      }`,
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

  const token = getAdminToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Use Chunked Upload for video, 3D, or any file larger than 3MB to bypass Vercel 4.5MB limit
  const CHUNK_THRESHOLD = 3 * 1024 * 1024; // 3MB
  if (isVideo || is3D || file.size > CHUNK_THRESHOLD) {
    return uploadFileInChunks(file, headers, options);
  }

  // Standard small file upload (with image compression)
  let processedFile = file;
  if (file.type.startsWith("image/") && !file.type.includes("svg") && !file.type.includes("gif")) {
    try {
      const compressed = await compressImageFile(file, 1600, 0.85);
      processedFile = compressed.file;
    } catch {
      // fallback to original
    }
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
      if (options?.onProgress) {
        options.onProgress(100, {
          current: 1,
          total: 1,
          percent: 100,
          loadedBytes: processedFile.size,
          totalBytes: processedFile.size,
        });
      }
      return {
        success: true,
        url: data.data.url,
        filename: data.data.filename || processedFile.name,
        mediaType: data.data.mediaType || "image",
      };
    }

    // Fallback: If standard upload fails with 413 or 500, attempt chunked upload as backup
    if (res.status === 413 || res.status === 504 || res.status === 500) {
      return uploadFileInChunks(file, headers, options);
    }

    const errorMessage =
      data?.error ||
      (res.status === 401
        ? "Sesi admin berakhir atau belum login. Silakan login kembali."
        : res.status === 413
        ? "Ukuran berkas melebihi batas upload server. Mencoba metode alternatif..."
        : "Gagal mengunggah berkas ke server.");

    return {
      success: false,
      error: errorMessage,
    };
  } catch {
    // If network error, attempt chunked upload
    return uploadFileInChunks(file, headers, options);
  }
}

/**
 * Slices file into 2.5MB chunks and uploads each via POST /api/admin/upload/chunk
 */
async function uploadFileInChunks(
  file: File,
  headers: Record<string, string>,
  options?: UploadOptions
): Promise<UploadResult> {
  const uploadId = `up_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const CHUNK_SIZE = 2.5 * 1024 * 1024; // 2.5MB per chunk
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  let finalData: any = null;

  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(file.size, start + CHUNK_SIZE);
    const chunkBlob = file.slice(start, end);

    const chunkFd = new FormData();
    chunkFd.append("file", chunkBlob, file.name);
    chunkFd.append("uploadId", uploadId);
    chunkFd.append("chunkIndex", String(i));
    chunkFd.append("totalChunks", String(totalChunks));
    chunkFd.append("filename", file.name);
    chunkFd.append("totalFileSize", String(file.size));
    chunkFd.append("mimeType", file.type || "");

    let retries = 2;
    let success = false;
    let lastError = "";

    while (retries >= 0 && !success) {
      try {
        const res = await fetch("/api/admin/upload/chunk", {
          method: "POST",
          headers,
          credentials: "include",
          body: chunkFd,
        });

        const data = await res.json().catch(() => null);
        if (res.ok && data?.success) {
          success = true;
          if (data.completed) {
            finalData = data.data;
          }
        } else {
          lastError = data?.error || `Gagal mengunggah bagian ${i + 1}/${totalChunks} (HTTP ${res.status})`;
          retries--;
          if (retries >= 0) {
            await new Promise((r) => setTimeout(r, 600));
          }
        }
      } catch (err: any) {
        lastError = err?.message || "Koneksi terputus saat mengunggah";
        retries--;
        if (retries >= 0) {
          await new Promise((r) => setTimeout(r, 600));
        }
      }
    }

    if (!success) {
      return {
        success: false,
        error: lastError || `Gagal mengunggah bagian ${i + 1}/${totalChunks}`,
      };
    }

    if (options?.onProgress) {
      const percent = Math.min(100, Math.round(((i + 1) / totalChunks) * 100));
      options.onProgress(percent, {
        current: i + 1,
        total: totalChunks,
        percent,
        loadedBytes: end,
        totalBytes: file.size,
      });
    }
  }

  if (finalData && finalData.url) {
    return {
      success: true,
      url: finalData.url,
      filename: finalData.filename || file.name,
      mediaType: finalData.mediaType || (isVideoFile(file) ? "video" : "image"),
    };
  }

  return {
    success: false,
    error: "Berkas selesai diunggah tetapi server tidak mengembalikan URL media.",
  };
}
