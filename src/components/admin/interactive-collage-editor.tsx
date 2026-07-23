"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import GridLayout, { useContainerWidth, LayoutItem } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import { Photo } from "@/lib/types";
import { Save, Star, Trash2, Pencil, X, Camera, Loader2, LayoutGrid, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface InteractiveCollageEditorProps {
  photos: Photo[];
  photosLoading: boolean;
  coverImageUrl?: string | null;
  onSetCoverPhoto: (photoUrl: string) => void;
  onDeletePhoto: (photoId: string) => void;
  onUpdatePhoto: (
    photoId: string,
    updates: { tags: string[]; score: number | null; description: string | null }
  ) => Promise<void>;
  onSaveLayoutSuccess: () => void;
}

/**
 * Calculates initial grid dimensions matching the photo's natural aspect ratio.
 * Ensures landscape, portrait, and panoramic images retain their original proportion.
 */
function getInitialLayoutItem(photo: Photo, index: number): LayoutItem {
  if (photo.grid_layout && photo.grid_layout.w && photo.grid_layout.h) {
    return {
      i: photo.id,
      x: photo.grid_layout.x ?? 0,
      y: photo.grid_layout.y ?? 0,
      w: photo.grid_layout.w,
      h: photo.grid_layout.h,
      minW: 2,
      minH: 2,
    };
  }

  const ar = photo.aspect_ratio || (photo.width && photo.height ? photo.width / photo.height : 1.5);
  let w = 6;
  let h = 4;

  if (ar >= 1.7) {
    // Ultrawide / Panoramic (16:9, 21:9)
    w = 12;
    h = Math.max(3, Math.round(12 / ar));
  } else if (ar >= 1.3) {
    // Standard Landscape (3:2, 4:3)
    w = 6;
    h = Math.max(3, Math.round(6 / ar));
  } else if (ar <= 0.8) {
    // Tall Portrait (2:3, 4:5)
    w = 4;
    h = Math.max(4, Math.round(4 / ar));
  } else {
    // Square / Near square (1:1)
    w = 5;
    h = 5;
  }

  return {
    i: photo.id,
    x: (index % 2) * 6,
    y: Math.floor(index / 2) * 4,
    w,
    h,
    minW: 2,
    minH: 2,
  };
}

export function InteractiveCollageEditor({
  photos,
  photosLoading,
  coverImageUrl,
  onSetCoverPhoto,
  onDeletePhoto,
  onUpdatePhoto,
  onSaveLayoutSuccess,
}: InteractiveCollageEditorProps) {
  const [layout, setLayout] = useState<LayoutItem[]>([]);
  const [isSavingLayout, setIsSavingLayout] = useState(false);
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  const [editScore, setEditScore] = useState<string>("");
  const [editTags, setEditTags] = useState<string>("");
  const [editDescription, setEditDescription] = useState<string>("");

  const { containerRef, width } = useContainerWidth({ measureBeforeMount: true });

  // Reset layout to native aspect ratio proportions
  const resetToAspectRatios = () => {
    const freshLayout = photos.map((photo, index) => {
      const ar = photo.aspect_ratio || (photo.width && photo.height ? photo.width / photo.height : 1.5);
      let w = 6;
      let h = 4;

      if (ar >= 1.7) {
        w = 12;
        h = Math.max(3, Math.round(12 / ar));
      } else if (ar >= 1.3) {
        w = 6;
        h = Math.max(3, Math.round(6 / ar));
      } else if (ar <= 0.8) {
        w = 4;
        h = Math.max(4, Math.round(4 / ar));
      } else {
        w = 5;
        h = 5;
      }

      return {
        i: photo.id,
        x: (index % 2) * 6,
        y: Math.floor(index / 2) * 4,
        w,
        h,
        minW: 2,
        minH: 2,
      };
    });

    setLayout(freshLayout);
    toast.info("Layout reset to native photo aspect ratios");
  };

  useEffect(() => {
    if (!photos || photos.length === 0) {
      setLayout([]);
      return;
    }

    const initialLayout = photos.map((photo, index) => getInitialLayoutItem(photo, index));
    setLayout(initialLayout);
  }, [photos]);

  const handleLayoutChange = (newLayout: readonly LayoutItem[]) => {
    setLayout([...newLayout]);
  };

  const handleSaveLayout = async () => {
    setIsSavingLayout(true);
    try {
      const updates = layout.map((item) => {
        const gridObj = {
          x: item.x,
          y: item.y,
          w: item.w,
          h: item.h,
        };
        return supabase
          .from("photos")
          .update({ grid_layout: gridObj })
          .eq("id", item.i);
      });

      await Promise.all(updates);
      toast.success("Collage layout saved successfully!");
      onSaveLayoutSuccess();
    } catch (err: any) {
      toast.error(`Failed to save layout: ${err.message}`);
    } finally {
      setIsSavingLayout(false);
    }
  };

  const startEditing = (photo: Photo) => {
    setEditingPhotoId(photo.id);
    setEditScore(photo.score !== undefined && photo.score !== null ? String(photo.score) : "");
    setEditTags(photo.tags ? photo.tags.join(", ") : "");
    setEditDescription(photo.description || "");
  };

  const cancelEditing = () => {
    setEditingPhotoId(null);
  };

  const handleSaveMetadata = async (photoId: string) => {
    try {
      const parsedScore = editScore.trim() === "" ? null : parseFloat(editScore);
      if (parsedScore !== null && (isNaN(parsedScore) || parsedScore < 0 || parsedScore > 10)) {
        throw new Error("Score must be between 0 and 10");
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
      toast.error(err.message || "Failed to update photo info");
    }
  };

  if (photosLoading) {
    return (
      <div className="flex py-20 justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white/50" />
      </div>
    );
  }

  if (!photos || photos.length === 0) {
    return (
      <p className="text-sm text-white/40 italic py-10 text-center">
        No photos uploaded to this album yet. Drag and drop to begin!
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {/* Action Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h4 className="font-serif text-xl font-bold tracking-wide flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 opacity-70" />
            <span>Aspect-Preserving Collage Canvas ({photos.length} Photos)</span>
          </h4>
          <p className="font-mono text-[10px] uppercase tracking-widest text-white/40 mt-1">
            Respawns native aspect ratios • Drag to reposition • Pull corners to enlarge
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={resetToAspectRatios}
            className="border border-white/20 text-white hover:bg-white/10 px-4 py-2 font-mono text-xs uppercase tracking-widest flex items-center gap-2 transition-all cursor-pointer"
            title="Reset layout grid to native image aspect ratios"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Ratios</span>
          </button>

          <button
            onClick={handleSaveLayout}
            disabled={isSavingLayout}
            className="bg-[#e8e5f0] text-[#0E1012] hover:bg-[#d4d0de] disabled:opacity-50 px-5 py-2.5 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md"
          >
            {isSavingLayout ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>Save Layout</span>
          </button>
        </div>
      </div>

      {/* Large React Grid Layout Canvas Container */}
      <div ref={containerRef} className="bg-white/[0.02] border border-white/10 p-6 min-h-[700px]">
        {width > 0 && (
          <GridLayout
            className="layout"
            layout={layout}
            width={width - 48}
            gridConfig={{
              cols: 12,
              rowHeight: 130, // Increased row height for larger, high-impact photo presentation
              margin: [20, 20],
            }}
            dragConfig={{
              enabled: true,
              handle: ".drag-handle",
            }}
            resizeConfig={{
              enabled: true,
            }}
            onLayoutChange={handleLayoutChange}
          >
            {photos.map((photo) => {
              const isCover = coverImageUrl === photo.url;
              const isEditing = editingPhotoId === photo.id;

              return (
                <div
                  key={photo.id}
                  className={`bg-[#14171a] border rounded-lg overflow-hidden flex flex-col justify-between group transition-all duration-300 ${
                    isCover ? "border-amber-500 ring-2 ring-amber-500/40 shadow-xl" : "border-white/15 hover:border-white/40"
                  }`}
                >
                  {/* Drag Handle Top Bar */}
                  <div className="drag-handle bg-black/80 hover:bg-black px-3 py-2 flex items-center justify-between text-white/70 cursor-grab active:cursor-grabbing border-b border-white/10 select-none">
                    <span className="font-mono text-[10px] uppercase tracking-widest truncate font-semibold">
                      {photo.location || photo.exif?.camera || "Drag Handle"}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {isCover && (
                        <span className="bg-amber-500 text-black text-[9px] font-bold font-mono px-2 py-0.5 uppercase tracking-wider flex items-center gap-1 shadow-sm">
                          <Star className="h-3 w-3 fill-black" />
                          Cover
                        </span>
                      )}
                      {!isCover && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSetCoverPhoto(photo.url);
                          }}
                          className="hover:text-amber-400 p-1 transition-colors"
                          title="Set as Album Cover"
                        >
                          <Star className="h-3.5 w-3.5 text-white/50 hover:text-amber-400" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditing(photo);
                        }}
                        className="hover:text-white p-1 transition-colors"
                        title="Edit Photo"
                      >
                        <Pencil className="h-3.5 w-3.5 text-white/50 hover:text-white" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeletePhoto(photo.id);
                        }}
                        className="hover:text-red-400 p-1 transition-colors"
                        title="Delete Photo"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-white/50 hover:text-red-400" />
                      </button>
                    </div>
                  </div>

                  {/* High-Resolution Photo Display - Native Aspect Ratio Respect */}
                  <div className="relative flex-grow w-full bg-black/60 overflow-hidden flex items-center justify-center p-1">
                    <Image
                      src={photo.url}
                      alt={photo.description || ""}
                      fill
                      sizes="(max-width: 1200px) 100vw, 50vw"
                      className="object-contain" // Preserves exact uncropped native aspect ratio
                    />

                    {/* Caption & EXIF Overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end text-white text-xs">
                      {photo.description && (
                        <p className="font-serif italic line-clamp-2 text-white/95 text-sm">
                          "{photo.description}"
                        </p>
                      )}
                      {photo.exif?.camera && (
                        <div className="font-mono text-white/60 flex items-center gap-1.5 pt-1.5 text-[10px]">
                          <Camera className="h-3.5 w-3.5" />
                          <span>{photo.exif.camera}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Metadata Editor Popup/Panel */}
                  {isEditing && (
                    <div className="p-4 bg-black/95 border-t border-white/20 space-y-3 absolute inset-0 z-20 overflow-y-auto">
                      <div className="flex justify-between items-center pb-2 border-b border-white/10">
                        <span className="font-mono text-xs uppercase tracking-widest text-white/80 font-bold">Edit Photo Details</span>
                        <button onClick={cancelEditing} className="text-white/50 hover:text-white">
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase tracking-widest text-white/50 block">Score (0 - 10)</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          value={editScore}
                          onChange={(e) => setEditScore(e.target.value)}
                          className="w-full bg-white/5 border border-white/15 px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-white/40"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase tracking-widest text-white/50 block">Hashtags</label>
                        <input
                          type="text"
                          value={editTags}
                          onChange={(e) => setEditTags(e.target.value)}
                          className="w-full bg-white/5 border border-white/15 px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-white/40"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase tracking-widest text-white/50 block">Description</label>
                        <textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          rows={3}
                          className="w-full bg-white/5 border border-white/15 px-3 py-1.5 text-xs text-white resize-none focus:outline-none focus:border-white/40"
                        />
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => handleSaveMetadata(photo.id)}
                          className="flex-1 bg-white text-black font-mono text-xs uppercase tracking-widest py-2 font-bold cursor-pointer hover:bg-white/90"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="flex-1 bg-white/10 text-white font-mono text-xs uppercase tracking-widest py-2 cursor-pointer hover:bg-white/20"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </GridLayout>
        )}
      </div>
    </div>
  );
}
