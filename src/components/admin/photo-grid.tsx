"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Camera, Image as ImageIcon, Loader2, Tag, Trash2, Pencil, Check, X, Star, ArrowLeft, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Photo } from "@/lib/types";

interface PhotoGridProps {
  photos: Photo[];
  photosLoading: boolean;
  coverImageUrl?: string | null;
  onSetCoverPhoto: (photoUrl: string) => void;
  onReorderPhotos: (reorderedPhotos: Photo[]) => void;
  onDeletePhoto: (photoId: string) => void;
  onUpdatePhoto: (
    photoId: string,
    updates: { tags: string[]; score: number | null; description: string | null }
  ) => Promise<void>;
}

export function PhotoGrid({
  photos,
  photosLoading,
  coverImageUrl,
  onSetCoverPhoto,
  onReorderPhotos,
  onDeletePhoto,
  onUpdatePhoto,
}: PhotoGridProps) {
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  const [editScore, setEditScore] = useState<string>("");
  const [editTags, setEditTags] = useState<string>("");
  const [editDescription, setEditDescription] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  const startEditing = (photo: Photo) => {
    setEditingPhotoId(photo.id);
    setEditScore(photo.score !== undefined && photo.score !== null ? String(photo.score) : "");
    setEditTags(photo.tags ? photo.tags.join(", ") : "");
    setEditDescription(photo.description || "");
  };

  const cancelEditing = () => {
    setEditingPhotoId(null);
    setEditScore("");
    setEditTags("");
    setEditDescription("");
  };

  const handleSave = async (photoId: string) => {
    setIsSaving(true);
    try {
      const parsedScore = editScore.trim() === "" ? null : parseFloat(editScore);
      if (parsedScore !== null && (isNaN(parsedScore) || parsedScore < 0 || parsedScore > 10)) {
        throw new Error("Score must be a number between 0 and 10");
      }

      const tagsArray = editTags
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      await onUpdatePhoto(photoId, {
        tags: tagsArray,
        score: parsedScore,
        description: editDescription.trim() || null,
      });
      setEditingPhotoId(null);
    } catch (err: any) {
      alert(err.message || "Failed to update photo");
    } finally {
      setIsSaving(false);
    }
  };

  const movePhoto = (index: number, direction: "left" | "right") => {
    const newIndex = direction === "left" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= photos.length) return;

    const newPhotos = [...photos];
    const [moved] = newPhotos.splice(index, 1);
    newPhotos.splice(newIndex, 0, moved);

    // Update sort_order properties
    const updated = newPhotos.map((p, idx) => ({ ...p, sort_order: idx }));
    onReorderPhotos(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <h4 className="font-serif text-lg font-bold tracking-wide flex items-center gap-2">
          <ImageIcon className="h-5 w-5 opacity-70" />
          <span>Album Photos ({photos.length})</span>
        </h4>
        <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">
          Use arrows to reorder • Set album cover
        </p>
      </div>

      {photosLoading ? (
        <div className="flex py-20 justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-white/50" />
        </div>
      ) : photos.length === 0 ? (
        <p className="text-sm text-white/40 italic py-10 text-center">
          No photos uploaded to this album yet. Drag and drop to begin!
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {photos.map((photo, index) => {
            const isEditing = editingPhotoId === photo.id;
            const isCover = coverImageUrl === photo.url;

            return (
              <Card
                key={photo.id}
                className={`bg-[#14171a] border rounded-none text-white overflow-hidden flex flex-col justify-between transition-all ${
                  isCover ? "border-amber-500/60 ring-1 ring-amber-500/30" : "border-white/10"
                }`}
              >
                <div className="relative aspect-[3/2] w-full bg-black/20">
                  <Image
                    src={photo.thumbnail_url || photo.url}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 350px"
                    className="object-cover"
                  />

                  {/* Cover Badge */}
                  {isCover && (
                    <div className="absolute top-3 left-3 bg-amber-500 text-black font-mono text-[9px] font-bold uppercase tracking-widest px-2 py-1 flex items-center gap-1 shadow-md">
                      <Star className="h-3 w-3 fill-black text-black" />
                      <span>Album Cover</span>
                    </div>
                  )}

                  {/* Reorder and Card Action Overlay */}
                  <div className="absolute top-3 right-3 flex gap-1.5 animate-fade-in">
                    {/* Reorder buttons */}
                    <button
                      disabled={index === 0}
                      onClick={() => movePhoto(index, "left")}
                      className="bg-black/75 hover:bg-white/20 disabled:opacity-30 p-1.5 rounded-none transition-colors border border-white/10 text-white cursor-pointer"
                      title="Move Up / Earlier"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                    </button>
                    <button
                      disabled={index === photos.length - 1}
                      onClick={() => movePhoto(index, "right")}
                      className="bg-black/75 hover:bg-white/20 disabled:opacity-30 p-1.5 rounded-none transition-colors border border-white/10 text-white cursor-pointer"
                      title="Move Down / Later"
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>

                    {/* Cover Photo selector button */}
                    {!isCover && (
                      <button
                        onClick={() => onSetCoverPhoto(photo.url)}
                        className="bg-black/75 hover:bg-amber-500/80 p-1.5 rounded-none transition-colors border border-white/10 text-white cursor-pointer"
                        title="Set as Album Cover"
                      >
                        <Star className="h-3.5 w-3.5 text-amber-400" />
                      </button>
                    )}

                    {!isEditing && (
                      <>
                        <button
                          onClick={() => startEditing(photo)}
                          className="bg-black/75 hover:bg-white/20 p-1.5 rounded-none transition-colors border border-white/10 cursor-pointer"
                          title="Edit Photo Info"
                        >
                          <Pencil className="h-3.5 w-3.5 text-white" />
                        </button>
                        <button
                          onClick={() => onDeletePhoto(photo.id)}
                          className="bg-black/75 hover:bg-red-500/80 p-1.5 rounded-none transition-colors border border-white/10 cursor-pointer"
                          title="Delete Photo"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-white" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {isEditing ? (
                  <CardContent className="p-4 space-y-4">
                    <div className="space-y-3">
                      {/* Score Input */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase tracking-widest text-white/40 block">
                          Score (0 - 10)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          value={editScore}
                          onChange={(e) => setEditScore(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 px-2.5 py-1.5 text-xs font-mono text-white rounded-none focus:outline-none focus:border-white/30"
                          placeholder="e.g. 8.5"
                        />
                      </div>

                      {/* Tags Input */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase tracking-widest text-white/40 block">
                          Hashtags (comma separated)
                        </label>
                        <input
                          type="text"
                          value={editTags}
                          onChange={(e) => setEditTags(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 px-2.5 py-1.5 text-xs font-mono text-white rounded-none focus:outline-none focus:border-white/30"
                          placeholder="e.g. landscape, sunset, water"
                        />
                      </div>

                      {/* Description Input */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase tracking-widest text-white/40 block">
                          Description
                        </label>
                        <textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          rows={2}
                          className="w-full bg-black/40 border border-white/10 px-2.5 py-1.5 text-xs text-white rounded-none focus:outline-none focus:border-white/30 resize-none"
                          placeholder="A short description of the image"
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => handleSave(photo.id)}
                          disabled={isSaving}
                          className="flex-1 bg-white hover:bg-white/90 text-black font-mono text-[10px] uppercase tracking-widest py-2 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          {isSaving ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Check className="h-3 w-3" />
                          )}
                          <span>Save</span>
                        </button>
                        <button
                          onClick={cancelEditing}
                          disabled={isSaving}
                          className="flex-grow bg-white/5 hover:bg-white/10 border border-white/10 font-mono text-[10px] uppercase tracking-widest py-2 flex items-center justify-center gap-1 transition-colors text-white cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    </div>
                  </CardContent>
                ) : (
                  <CardContent className="p-4 space-y-4">
                    {/* Score display */}
                    {photo.score !== undefined && photo.score !== null && (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-500">
                        <span>★ Score: {photo.score} / 10</span>
                      </div>
                    )}

                    {/* Description display */}
                    {photo.description && (
                      <p className="text-xs text-white/70 italic leading-relaxed line-clamp-2">
                        "{photo.description}"
                      </p>
                    )}

                    {/* EXIF parameters summary */}
                    {photo.exif && photo.exif.camera && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-white/80">
                          <Camera className="h-3.5 w-3.5 opacity-70" />
                          <span className="truncate">{photo.exif.camera}</span>
                        </div>
                        <div className="text-[10px] font-mono text-white/40">
                          {[
                            photo.exif.focal_length,
                            photo.exif.aperture,
                            photo.exif.shutter,
                            photo.exif.iso ? `ISO ${photo.exif.iso}` : null,
                          ]
                            .filter(Boolean)
                            .join(" • ")}
                        </div>
                      </div>
                    )}

                    {/* Color Palette bar */}
                    {photo.color_palette && photo.color_palette.length > 0 && (
                      <div className="flex gap-1.5">
                        {photo.color_palette.map((color, idx) => (
                          <div
                            key={idx}
                            className="h-3 flex-grow border border-white/5"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    )}

                    {/* Tags Display */}
                    {photo.tags && photo.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {photo.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[8px] font-mono uppercase bg-white/5 border border-white/10 px-1.5 py-0.5 text-white/60 tracking-wider flex items-center gap-1"
                          >
                            <Tag className="h-2 w-2" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
