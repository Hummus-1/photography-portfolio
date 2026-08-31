"use client";

import React, { useRef, useState } from "react";
import { Upload, Loader2, Sparkles, Image as ImageIcon, Zap } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Album } from "@/lib/types";
import { ThinkingOrb } from "./thinking-orb";
import { isoToDDMMYYYY } from "@/components/ui/date-selector";
import exifr from "exifr";

interface ImageUploaderProps {
  selectedAlbumId: string;
  photosCount: number;
  albums: Album[];
  onUploadComplete: () => void;
  onAlbumCoverUpdated: (albumId: string, coverUrl: string) => void;
}

/**
 * Extracts raw EXIF metadata directly from the original File object before canvas compression.
 */
async function extractRawExif(file: File) {
  try {
    const rawExif = await exifr.parse(file, {
      tiff: true,
      xmp: true,
      gps: true,
    });

    if (!rawExif) return null;

    return {
      camera: rawExif.Make && rawExif.Model
        ? `${rawExif.Make} ${rawExif.Model}`
        : rawExif.Model || rawExif.Make || null,
      lens: rawExif.LensModel || rawExif.Lens || null,
      iso: rawExif.ISO || rawExif.ISOSpeedRatings || null,
      aperture: rawExif.FNumber
        ? `f/${rawExif.FNumber}`
        : rawExif.ApertureValue
        ? `f/${rawExif.ApertureValue}`
        : null,
      shutter: rawExif.ExposureTime
        ? rawExif.ExposureTime < 1
          ? `1/${Math.round(1 / rawExif.ExposureTime)}s`
          : `${rawExif.ExposureTime}s`
        : null,
      focal_length: rawExif.FocalLength ? `${rawExif.FocalLength}mm` : null,
      date_taken: rawExif.DateTimeOriginal || rawExif.CreateDate || null,
      gps:
        rawExif.latitude && rawExif.longitude
          ? {
              latitude: rawExif.latitude,
              longitude: rawExif.longitude,
            }
          : null,
    };
  } catch (err) {
    console.warn("Client EXIF extraction failed:", err);
    return null;
  }
}

/**
 * Optimizes large images in the browser before sending them to Vercel.
 * Bypasses Vercel's 4.5MB serverless payload limit by shrinking 15MB+ RAW/JPG files to < 1.5MB WebP/JPEG.
 */
async function compressImageForUpload(file: File): Promise<File> {
  if (file.size <= 3 * 1024 * 1024 && !file.type.includes("tiff") && !file.type.includes("raw")) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      let { width, height } = img;
      const maxDim = 2500;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob && blob.size < file.size) {
            const newName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
            const compressedFile = new File([blob], newName, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        },
        "image/jpeg",
        0.88
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };

    img.src = url;
  });
}

export function ImageUploader({
  selectedAlbumId,
  photosCount,
  albums,
  onUploadComplete,
  onAlbumCoverUpdated,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleFileUpload = async (files: FileList) => {
    if (!selectedAlbumId) {
      toast.error("Please select or create an album first");
      return;
    }

    setUploading(true);
    const fileArray = Array.from(files);
    const totalFiles = fileArray.length;
    let completedCount = 0;

    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession) {
        toast.error("Session expired. Please log in again.");
        return;
      }

      setUploadProgress(`Extracting EXIF & starting parallel processing of ${totalFiles} images...`);

      const CONCURRENCY = 3;

      const processSingleFile = async (rawFile: File, index: number) => {
        // Extract EXIF directly from original raw file before canvas compression
        const clientExif = await extractRawExif(rawFile);
        const fileToUpload = await compressImageForUpload(rawFile);

        const formData = new FormData();
        formData.append("file", fileToUpload);
        formData.append("albumId", selectedAlbumId);
        formData.append("sortOrder", (photosCount + index).toString());
        if (clientExif) {
          formData.append("clientExif", JSON.stringify(clientExif));
        }

        const res = await fetch("/api/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${currentSession.access_token}`,
          },
          body: formData,
        });

        const result = await res.json();
        if (!res.ok) {
          throw new Error(result.error || `Upload failed for ${rawFile.name}`);
        }

        completedCount++;
        setUploadProgress(`Optimizing & uploading: ${completedCount}/${totalFiles} completed...`);

        const currentAlbum = albums.find((a) => a.id === selectedAlbumId);
        if (currentAlbum && !currentAlbum.cover_image_url && result.photo?.url) {
          const coverUrl = result.photo.url;
          await supabase
            .from("albums")
            .update({ cover_image_url: coverUrl })
            .eq("id", selectedAlbumId);
          
          onAlbumCoverUpdated(selectedAlbumId, coverUrl);
        }
      };

      const workerCount = Math.min(CONCURRENCY, totalFiles);
      const workers = Array.from({ length: workerCount }, async (_, workerId) => {
        for (let i = workerId; i < totalFiles; i += workerCount) {
          await processSingleFile(fileArray[i], i);
        }
      });

      await Promise.all(workers);

      setUploadProgress("Running Workers AI CLIP model & color palette extraction...");
      try {
        const autoFillRes = await fetch("/api/albums/auto-fill", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentSession.access_token}`,
          },
          body: JSON.stringify({ albumId: selectedAlbumId }),
        });

        if (autoFillRes.ok) {
          const autoFillData = await autoFillRes.json();
          if (autoFillData.appliedUpdates?.title) {
            toast.success(`AI Title Generated: "${autoFillData.appliedUpdates.title}"`);
          }
          if (autoFillData.earliestDate) {
            toast.info(`Album date set to earliest photo date: ${isoToDDMMYYYY(autoFillData.earliestDate)}`);
          }
        }
      } catch (autoErr) {
        console.error("Auto fill trigger failed:", autoErr);
      }

      toast.success("All images uploaded & EXIF metadata saved!");
      onUploadComplete();
    } catch (err: any) {
      toast.error(`Upload error: ${err.message}`);
    } finally {
      setUploading(false);
      setUploadProgress("");
    }
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`relative cursor-pointer border-2 border-dashed py-12 px-6 flex flex-col items-center justify-center transition-all duration-300 rounded-none overflow-hidden ${
        dragActive
          ? "border-primary bg-primary/10 shadow-[0_0_30px_rgba(230,126,58,0.15)]"
          : "border-border bg-card/60 hover:border-foreground/30 hover:bg-background/50"
      }`}
    >
      {/* Background ambient glow */}
      <div className="absolute inset-0 bg-radial from-primary/5 via-transparent to-transparent pointer-events-none" />

      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
        multiple
        accept="image/*"
        className="hidden"
      />

      {uploading ? (
        <div className="flex flex-col items-center gap-4 text-center z-10">
          <ThinkingOrb state="uploading" size="lg" />
          <div className="space-y-1">
            <p className="font-mono text-sm tracking-wider text-white font-bold">{uploadProgress}</p>
            <p className="font-mono text-[10px] text-white/50 uppercase tracking-widest flex items-center justify-center gap-1.5">
              <Zap className="h-3 w-3 text-emerald-400" /> EXIF Header Extraction + WebP Compression + R2 Sync
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 text-center z-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/5 border border-white/10 group-hover:border-primary/50 transition-colors">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-serif font-bold text-base text-white tracking-wide">
              Drag & drop photos here or click to browse
            </p>
            <p className="font-mono text-[10px] text-white/40 uppercase tracking-widest mt-1">
              Supports JPEG, PNG, TIFF, and RAW formats • Client EXIF extraction & parallel R2 sync
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
