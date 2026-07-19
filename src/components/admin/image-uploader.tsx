"use client";

import React, { useRef, useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Album } from "@/lib/types";

interface ImageUploaderProps {
  selectedAlbumId: string;
  photosCount: number;
  albums: Album[];
  onUploadComplete: () => void;
  onAlbumCoverUpdated: (albumId: string, coverUrl: string) => void;
}

/**
 * Optimizes large images in the browser before sending them to Vercel.
 * Bypasses Vercel's 4.5MB serverless payload limit by shrinking 15MB+ RAW/JPG files to < 1.5MB WebP/JPEG.
 */
async function compressImageForUpload(file: File): Promise<File> {
  // If file is already under 3MB and standard format, no compression needed
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
      resolve(file); // Fallback to original if format isn't directly renderable by Canvas
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

      setUploadProgress(`Starting parallel upload of ${totalFiles} images...`);

      // Concurrency limit: 3 parallel workers
      const CONCURRENCY = 3;

      const processSingleFile = async (rawFile: File, index: number) => {
        // 1. Compress in browser if necessary
        const fileToUpload = await compressImageForUpload(rawFile);

        // 2. Prepare FormData
        const formData = new FormData();
        formData.append("file", fileToUpload);
        formData.append("albumId", selectedAlbumId);
        formData.append("sortOrder", (photosCount + index).toString());

        // 3. Upload to server
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
        setUploadProgress(`Uploading in parallel: ${completedCount}/${totalFiles} completed...`);

        // Set cover image for album if it doesn't have one
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

      // Create parallel worker pool
      const workerCount = Math.min(CONCURRENCY, totalFiles);
      const workers = Array.from({ length: workerCount }, async (_, workerId) => {
        for (let i = workerId; i < totalFiles; i += workerCount) {
          await processSingleFile(fileArray[i], i);
        }
      });

      await Promise.all(workers);

      toast.success("All images uploaded successfully!");
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
      className={`border-2 border-dashed py-14 flex flex-col items-center justify-center transition-all duration-300 rounded-none ${
        dragActive
          ? "border-[#e8e5f0] bg-white/5"
          : "border-white/10 hover:border-white/20 hover:bg-white/5"
      }`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
        multiple
        accept="image/*"
        className="hidden"
      />

      {uploading ? (
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-[#e8e5f0]" />
          <p className="font-mono text-sm tracking-wider">{uploadProgress}</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
            <Upload className="h-6 w-6 text-white/60" />
          </div>
          <p className="font-serif font-bold text-sm tracking-wider">
            Drag & drop images here or click to browse
          </p>
          <p className="font-mono text-[9px] text-white/40 uppercase tracking-widest">
            Supports high-resolution JPEG, PNG, TIFF, and RAW files (fast parallel upload)
          </p>
        </div>
      )}
    </div>
  );
}
