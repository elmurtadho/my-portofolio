"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Move,
  Check,
  X,
  RefreshCw,
  Crop,
  Image as ImageIcon,
} from "lucide-react";

export interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string;
  onClose: () => void;
  onSave: (croppedDataUrl: string) => void;
  aspectRatio?: "circle" | "portrait" | "square" | "landscape";
  title?: string;
}

export function ImageCropModal({
  isOpen,
  imageSrc,
  onClose,
  onSave,
  aspectRatio = "circle",
  title = "Sesuaikan Skala & Posisi Foto",
}: ImageCropModalProps) {
  const [scale, setScale] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Reset transforms when new image is loaded or modal opens
  useEffect(() => {
    if (!isOpen || !imageSrc) return;

    setScale(1);
    setOffsetX(0);
    setOffsetY(0);
    setRotation(0);
    setImageLoaded(false);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;
    img.onload = () => {
      imageRef.current = img;
      setImageLoaded(true);

      // Auto calculate best initial fit
      const cw = 400;
      const ch = aspectRatio === "portrait" ? 480 : aspectRatio === "landscape" ? 250 : 400;
      const scaleW = cw / img.width;
      const scaleH = ch / img.height;
      const bestFit = Math.max(scaleW, scaleH);
      setScale(Number(bestFit.toFixed(2)) || 1);
    };
  }, [isOpen, imageSrc, aspectRatio]);

  const drawPreviewCanvas = useCallback((cropX: number, cropY: number, cropW: number, cropH: number) => {
    const previewCanvas = previewCanvasRef.current;
    const img = imageRef.current;
    if (!previewCanvas || !img || !imageLoaded) return;

    const pCtx = previewCanvas.getContext("2d");
    if (!pCtx) return;

    const pW = previewCanvas.width;
    const pH = previewCanvas.height;

    pCtx.clearRect(0, 0, pW, pH);

    pCtx.save();
    if (aspectRatio === "circle") {
      pCtx.beginPath();
      pCtx.arc(pW / 2, pH / 2, pW / 2, 0, Math.PI * 2);
      pCtx.closePath();
      pCtx.clip();
    }

    const scaleFactor = pW / cropW;
    pCtx.scale(scaleFactor, scaleFactor);
    pCtx.translate(-cropX, -cropY);

    const mainCanvas = canvasRef.current;
    const width = mainCanvas ? mainCanvas.width : 400;
    const height = mainCanvas ? mainCanvas.height : 400;

    pCtx.translate(width / 2 + offsetX, height / 2 + offsetY);
    pCtx.rotate((rotation * Math.PI) / 180);
    pCtx.scale(scale, scale);
    pCtx.drawImage(img, -img.width / 2, -img.height / 2);
    pCtx.restore();
  }, [aspectRatio, imageLoaded, offsetX, offsetY, rotation, scale]);

  // Main interactive render
  const drawMainCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img || !imageLoaded) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Dark backdrop pattern
    ctx.fillStyle = "#06120b";
    ctx.fillRect(0, 0, width, height);

    // Save state for image transformation
    ctx.save();
    ctx.translate(width / 2 + offsetX, height / 2 + offsetY);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);

    // Draw image centered
    ctx.drawImage(img, -img.width / 2, -img.height / 2);
    ctx.restore();

    // Draw Mask Overlay
    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.65)";

    const cropSize = Math.min(width, height) - 40;
    const cropW = aspectRatio === "portrait" ? cropSize * 0.8 : cropSize;
    const cropH = aspectRatio === "portrait" ? cropSize * 1.05 : aspectRatio === "landscape" ? Math.round(cropSize * 0.625) : cropSize;
    const cropX = (width - cropW) / 2;
    const cropY = (height - cropH) / 2;

    // Draw full overlay then cut hole
    ctx.beginPath();
    ctx.rect(0, 0, width, height);

    if (aspectRatio === "circle") {
      const radius = cropW / 2;
      ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2, true);
    } else {
      // Rounded rect hole
      const r = 24;
      ctx.moveTo(cropX + r, cropY);
      ctx.lineTo(cropX + cropW - r, cropY);
      ctx.quadraticCurveTo(cropX + cropW, cropY, cropX + cropW, cropY + r);
      ctx.lineTo(cropX + cropW, cropY + cropH - r);
      ctx.quadraticCurveTo(cropX + cropW, cropY + cropH, cropX + cropW - r, cropY + cropH);
      ctx.lineTo(cropX + r, cropY + cropH);
      ctx.quadraticCurveTo(cropX, cropY + cropH, cropX, cropY + cropH - r);
      ctx.lineTo(cropX, cropY + r);
      ctx.quadraticCurveTo(cropX, cropY, cropX + r, cropY);
    }
    ctx.closePath();
    ctx.fill("evenodd");

    // Draw Stroke Guideline
    ctx.strokeStyle = "#34d399";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // Also update mini preview canvas
    drawPreviewCanvas(cropX, cropY, cropW, cropH);
  }, [aspectRatio, drawPreviewCanvas, imageLoaded, offsetX, offsetY, rotation, scale]);

  useEffect(() => {
    drawMainCanvas();
  }, [drawMainCanvas]);

  // Drag pan handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offsetX, y: e.clientY - offsetY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    setOffsetX(e.clientX - dragStart.x);
    setOffsetY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch pan handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - offsetX,
        y: e.touches[0].clientY - offsetY,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging || e.touches.length !== 1) return;
    setOffsetX(e.touches[0].clientX - dragStart.x);
    setOffsetY(e.touches[0].clientY - dragStart.y);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleReset = () => {
    const img = imageRef.current;
    if (img) {
      const cw = 400;
      const ch = aspectRatio === "portrait" ? 480 : 400;
      const scaleW = cw / img.width;
      const scaleH = ch / img.height;
      setScale(Number(Math.max(scaleW, scaleH).toFixed(2)) || 1);
    } else {
      setScale(1);
    }
    setOffsetX(0);
    setOffsetY(0);
    setRotation(0);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleApply = () => {
    const img = imageRef.current;
    if (!img) return;

    // Export high resolution canvas
    const exportSize = 800;
    const exportW = aspectRatio === "portrait" ? 640 : exportSize;
    const exportH = aspectRatio === "portrait" ? 840 : aspectRatio === "landscape" ? 500 : exportSize;

    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = exportW;
    exportCanvas.height = exportH;

    const ctx = exportCanvas.getContext("2d");
    if (!ctx) return;

    const mainCanvas = canvasRef.current;
    const mw = mainCanvas ? mainCanvas.width : 400;
    const mh = mainCanvas ? mainCanvas.height : 400;

    const cropSize = Math.min(mw, mh) - 40;
    const cropW = aspectRatio === "portrait" ? cropSize * 0.8 : cropSize;
    const cropH = aspectRatio === "portrait" ? cropSize * 1.05 : aspectRatio === "landscape" ? Math.round(cropSize * 0.625) : cropSize;
    const cropX = (mw - cropW) / 2;
    const cropY = (mh - cropH) / 2;

    const exportScale = exportW / cropW;

    ctx.scale(exportScale, exportScale);
    ctx.translate(-cropX, -cropY);
    ctx.translate(mw / 2 + offsetX, mh / 2 + offsetY);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);

    ctx.drawImage(img, -img.width / 2, -img.height / 2);

    const resultDataUrl = exportCanvas.toDataURL("image/jpeg", 0.92);
    onSave(resultDataUrl);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="w-full max-w-2xl bg-[#081810] border border-[#1b442e] rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#143724]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Crop className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {title}
              </h3>
              <p className="text-xs text-emerald-400/70">
                Geser (pan) dan atur skala pembesaran foto sesuai framing yang pas
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-400 hover:text-white hover:bg-[#123021] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Workspace: Canvas & Live Preview */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          {/* Main Drag Canvas */}
          <div className="md:col-span-8 flex flex-col items-center">
            <div className="relative rounded-2xl overflow-hidden border border-[#1b442e] bg-[#050e08] shadow-inner cursor-grab active:cursor-grabbing">
              <canvas
                ref={canvasRef}
                width={400}
                height={aspectRatio === "portrait" ? 480 : 400}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="w-full max-w-[340px] sm:max-w-[380px] h-auto block select-none touch-none"
              />

              {/* Pan Overlay Hint */}
              <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10 text-[10px] text-emerald-300 font-medium flex items-center gap-1.5 pointer-events-none">
                <Move className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span>Klik &amp; geser foto untuk memindahkan</span>
              </div>
            </div>
          </div>

          {/* Side: Live Preview & Quick Tools */}
          <div className="md:col-span-4 flex flex-col items-center justify-center space-y-4 p-4 rounded-2xl bg-[#050f09] border border-[#153a26]">
            <span className="text-xs font-semibold text-emerald-200 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pratinjau Hasil Akhir</span>
            </span>

            {/* Mini Circular / Rounded Preview */}
            <div
              className={`w-28 h-28 sm:w-32 sm:h-32 border-2 border-emerald-400/80 shadow-lg shadow-emerald-500/20 overflow-hidden bg-black/50 flex items-center justify-center ${
                aspectRatio === "circle" ? "rounded-full" : "rounded-2xl"
              }`}
            >
              <canvas
                ref={previewCanvasRef}
                width={128}
                height={128}
                className="w-full h-full object-cover block"
              />
            </div>

            <span className="text-[11px] text-emerald-400/60 text-center font-mono">
              Skala: {(scale * 100).toFixed(0)}%
            </span>

            <div className="flex gap-2 w-full pt-1">
              <button
                type="button"
                onClick={handleRotate}
                className="flex-1 py-1.5 rounded-xl bg-[#0c2619] hover:bg-[#143a27] text-emerald-300 text-xs font-semibold border border-emerald-500/30 flex items-center justify-center gap-1 transition"
                title="Putar 90 derajat"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Putar</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="flex-1 py-1.5 rounded-xl bg-[#0c2619] hover:bg-[#143a27] text-emerald-300 text-xs font-semibold border border-emerald-500/30 flex items-center justify-center gap-1 transition"
                title="Reset posisi & skala"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sliders: Scale (Zoom) & Position Offsets */}
        <div className="p-4 rounded-2xl bg-[#050f09] border border-[#163c27] space-y-4">
          {/* Zoom Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-emerald-200 flex items-center gap-1.5">
                <ZoomIn className="w-3.5 h-3.5 text-emerald-400" />
                <span>Pengaturan Skala / Zoom Foto</span>
              </label>
              <span className="font-bold text-emerald-400 font-mono">
                {(scale * 100).toFixed(0)}%
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setScale((prev) => Math.max(0.3, Number((prev - 0.1).toFixed(2))))}
                className="p-1.5 rounded-lg bg-[#0d271a] hover:bg-[#153d29] text-emerald-300 border border-emerald-500/20"
                title="Kecilkan"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>

              <input
                type="range"
                min={0.3}
                max={3.0}
                step={0.05}
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
                className="flex-1 accent-emerald-400 h-2 bg-[#020805] rounded-lg cursor-pointer"
              />

              <button
                type="button"
                onClick={() => setScale((prev) => Math.min(3.0, Number((prev + 0.1).toFixed(2))))}
                className="p-1.5 rounded-lg bg-[#0d271a] hover:bg-[#153d29] text-emerald-300 border border-emerald-500/20"
                title="Besarkan"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Zoom Presets */}
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[10px] text-emerald-500/60 font-semibold">Cepat:</span>
              {[0.8, 1.0, 1.25, 1.5, 2.0].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setScale(preset)}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold transition ${
                    Math.abs(scale - preset) < 0.05
                      ? "bg-emerald-500 text-black"
                      : "bg-[#0c2418] text-emerald-300/80 hover:text-white"
                  }`}
                >
                  {(preset * 100).toFixed(0)}%
                </button>
              ))}
            </div>
          </div>

          {/* Position X & Y Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#122e1f]">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-emerald-300/80 font-medium">Geser Horizontal (X)</span>
                <span className="font-mono text-emerald-400">{offsetX}px</span>
              </div>
              <input
                type="range"
                min={-200}
                max={200}
                step={2}
                value={offsetX}
                onChange={(e) => setOffsetX(Number(e.target.value))}
                className="w-full accent-emerald-400 h-1.5 bg-[#020805] rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-emerald-300/80 font-medium">Geser Vertikal (Y)</span>
                <span className="font-mono text-emerald-400">{offsetY}px</span>
              </div>
              <input
                type="range"
                min={-200}
                max={200}
                step={2}
                value={offsetY}
                onChange={(e) => setOffsetY(Number(e.target.value))}
                className="w-full accent-emerald-400 h-1.5 bg-[#020805] rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#153826]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-emerald-300 hover:text-white bg-[#0e271b] hover:bg-[#153827] transition"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-emerald-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition hover:scale-[1.02]"
          >
            <Check className="w-4 h-4" />
            <span>Terapkan &amp; Gunakan Foto</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ImageCropModal;
