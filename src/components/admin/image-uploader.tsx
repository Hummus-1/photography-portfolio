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
    const totalFiles = files.length;

    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession) {
        toast.error("Session expired. Please log in again.");
        return;
      }

      for (let i = 0; i < totalFiles; i++) {
        const file = files[i];
        setUploadProgress(`Uploading ${i + 1}/${totalFiles}: ${file.name}...`);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("albumId", selectedAlbumId);
        formData.append("sortOrder", (photosCount + i).toString());

        const res = await fetch("/api/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${currentSession.access_token}`,
          },
          body: formData,
        });

        const result = await res.json();
        if (!res.ok) {
          throw new Error(result.error || "Upload failed");
        }

        // Set cover image for album if it doesn't have one
        const currentAlbum = albums.find((a) => a.id === selectedAlbumId);
        if (currentAlbum && !currentAlbum.cover_image_url) {
          const coverUrl = result.photo.url;
          await supabase
            .from("albums")
            .update({ cover_image_url: coverUrl })
            .eq("id", selectedAlbumId);
          
          onAlbumCoverUpdated(selectedAlbumId, coverUrl);
        }
      }

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
            Supports high-resolution JPEG, PNG, TIFF, and RAW files
          </p>
        </div>
      )}
    </div>
  );
}
