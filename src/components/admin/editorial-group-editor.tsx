"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Album, Photo } from "@/lib/types";
import { Lightbox } from "@/components/lightbox";
import {
  Save,
  Star,
  Trash2,
  Pencil,
  X,
  Camera,
  Loader2,
  Rows,
  Layers,
  ArrowUp,
  ArrowDown,
  Plus,
  Unlink,
  MapPin,
  Tag,
  GripVertical,
  Maximize2,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface EditorialGroupEditorProps {
  album: Album;
  photos: Photo[];
  photosLoading: boolean;
  coverImageUrl?: string | null;
  onSetCoverPhoto: (photoUrl: string) => void;
  onDeletePhoto: (photoId: string) => void;
  onUpdatePhoto: (
    photoId: string,
    updates: { tags: string[]; score: number | null; description: string | null }
  ) => Promise<void>;
  onSaveSuccess: () => void;
}

export function EditorialGroupEditor({
  album,
  photos: initialPhotos,
  photosLoading,
  coverImageUrl,
  onSetCoverPhoto,
  onDeletePhoto,
  onUpdatePhoto,
  onSaveSuccess,
}: EditorialGroupEditorProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  const [editScore, setEditScore] = useState<string>("");
  const [editTags, setEditTags] = useState<string>("");
  const [editDescription, setEditDescription] = useState<string>("");

  // Lightbox Expand State
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Drag and Drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    setPhotos(initialPhotos || []);
  }, [initialPhotos]);

  const toggleSelectPhoto = (id: string) => {
    setSelectedPhotoIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  const handleExpandPhoto = (index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  const handleGroupSelected = () => {
    if (selectedPhotoIds.length < 2) {
      toast.error("Select at least 2 photos to group into a side-by-side row.");
      return;
    }
    if (selectedPhotoIds.length > 4) {
      toast.error("Maximum 4 photos per row group.");
      return;
    }

    const newGroupId = `row_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    setPhotos((prev) =>
      prev.map((p) => (selectedPhotoIds.includes(p.id) ? { ...p, group_id: newGroupId } : p))
    );
    setSelectedPhotoIds([]);
    toast.success(`Grouped ${selectedPhotoIds.length} photos into a side-by-side row!`);
  };

  const handleUngroupRow = (groupId: string) => {
    setPhotos((prev) =>
      prev.map((p) => (p.group_id === groupId ? { ...p, group_id: null } : p))
    );
    toast.info("Row group removed.");
  };

  const handleRemoveFromGroup = (photoId: string) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === photoId ? { ...p, group_id: null } : p))
    );
  };

  const handleQuickGroupWithNext = (index: number) => {
    if (index >= photos.length - 1) return;
    const currentPhoto = photos[index];
    const groupId = currentPhoto.group_id || `row_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    setPhotos((prev) =>
      prev.map((p, idx) => {
        if (idx === index || idx === index + 1) {
          return { ...p, group_id: groupId };
        }
        return p;
      })
    );
    toast.success("Grouped with next photo!");
  };

  const movePhotoInList = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= photos.length || fromIndex === toIndex) return;
    const updated = [...photos];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);

    const reordered = updated.map((p, idx) => ({ ...p, sort_order: idx }));
    setPhotos(reordered);
  };

  const handleDrop = (fromIdx: number, toIdx: number) => {
    movePhotoInList(fromIdx, toIdx);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const updates = photos.map((p, idx) =>
        supabase
          .from("photos")
          .update({
            sort_order: idx,
            group_id: p.group_id || null,
          })
          .eq("id", p.id)
      );

      await Promise.all(updates);
      toast.success("Album order and row groupings saved successfully!");
      onSaveSuccess();
    } catch (err: any) {
      toast.error(`Failed to save layout: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const startEditing = (photo: Photo) => {
    setEditingPhotoId(photo.id);
    setEditScore(photo.score !== undefined && photo.score !== null ? String(photo.score) : "");
    setEditTags(photo.tags ? photo.tags.join(", ") : "");
    setEditDescription(photo.description || "");
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
        No photos uploaded to this album yet. Upload photos to start grouping and ordering!
      </p>
    );
  }

  interface VisualBlock {
    type: "single" | "group";
    groupId?: string;
    items: { photo: Photo; originalIndex: number }[];
  }

  const visualBlocks: VisualBlock[] = [];
  let i = 0;
  while (i < photos.length) {
    const current = photos[i];
    if (current.group_id) {
      const gId = current.group_id;
      const groupItems: { photo: Photo; originalIndex: number }[] = [{ photo: current, originalIndex: i }];
      let j = i + 1;
      while (j < photos.length && photos[j].group_id === gId) {
        groupItems.push({ photo: photos[j], originalIndex: j });
        j++;
      }
      if (groupItems.length > 1) {
        visualBlocks.push({ type: "group", groupId: gId, items: groupItems });
        i = j;
        continue;
      }
    }
    visualBlocks.push({
      type: "single",
      items: [{ photo: current, originalIndex: i }],
    });
    i++;
  }

  return (
    <div className="space-y-6">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h4 className="font-serif text-xl font-bold tracking-wide flex items-center gap-2">
            <Rows className="h-5 w-5 opacity-70" />
            <span>Album Photo Manager ({photos.length} Stills)</span>
          </h4>
          <p className="font-mono text-[10px] uppercase tracking-widest text-white/40 mt-1">
            Click image thumbnail to expand full size & details • Drag handle to reorder
          </p>
        </div>

        <div className="flex items-center gap-3">
          {selectedPhotoIds.length > 0 && (
            <button
              onClick={handleGroupSelected}
              className="bg-amber-500 text-black hover:bg-amber-400 font-bold px-4 py-2 font-mono text-xs uppercase tracking-widest flex items-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Group Selected ({selectedPhotoIds.length})</span>
            </button>
          )}

          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="bg-[#e8e5f0] text-[#0E1012] hover:bg-[#d4d0de] disabled:opacity-50 px-5 py-2.5 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>Save Story Layout</span>
          </button>
        </div>
      </div>

      {/* Editorial Feed Blocks List */}
      <div className="space-y-6">
        {visualBlocks.map((block, blockIndex) => {
          if (block.type === "group" && block.groupId) {
            return (
              <div
                key={`block-${block.groupId}-${blockIndex}`}
                className="bg-amber-500/5 border-2 border-dashed border-amber-500/30 p-4 rounded-lg space-y-4 relative"
              >
                {/* Group Header Bar */}
                <div className="flex items-center justify-between border-b border-amber-500/20 pb-2.5">
                  <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider">
                    <Layers className="h-4 w-4" />
                    <span>Side-by-Side Row Group ({block.items.length} Photos)</span>
                  </div>
                  <button
                    onClick={() => handleUngroupRow(block.groupId!)}
                    className="text-amber-400/80 hover:text-amber-300 font-mono text-xs uppercase tracking-widest flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded transition-all cursor-pointer"
                    title="Break row into individual photos"
                  >
                    <Unlink className="h-3.5 w-3.5" />
                    <span>Ungroup Row</span>
                  </button>
                </div>

                {/* Compact Split Cards for Grouped Row */}
                <div className="space-y-3">
                  {block.items.map(({ photo, originalIndex }) => (
                    <PhotoCardTile
                      key={photo.id}
                      photo={photo}
                      originalIndex={originalIndex}
                      totalPhotos={photos.length}
                      isSelected={selectedPhotoIds.includes(photo.id)}
                      isCover={coverImageUrl === photo.url}
                      isEditing={editingPhotoId === photo.id}
                      isDragging={draggedIndex === originalIndex}
                      isDragOver={dragOverIndex === originalIndex}
                      onDragStart={() => setDraggedIndex(originalIndex)}
                      onDragOver={() => setDragOverIndex(originalIndex)}
                      onDragEnd={() => {
                        setDraggedIndex(null);
                        setDragOverIndex(null);
                      }}
                      onDrop={() => {
                        if (draggedIndex !== null) {
                          handleDrop(draggedIndex, originalIndex);
                        }
                      }}
                      onToggleSelect={() => toggleSelectPhoto(photo.id)}
                      onExpandPhoto={() => handleExpandPhoto(originalIndex)}
                      onMoveUp={() => movePhotoInList(originalIndex, originalIndex - 1)}
                      onMoveDown={() => movePhotoInList(originalIndex, originalIndex + 1)}
                      onSetCoverPhoto={() => onSetCoverPhoto(photo.url)}
                      onStartEdit={() => startEditing(photo)}
                      onDeletePhoto={() => onDeletePhoto(photo.id)}
                      onRemoveFromGroup={() => handleRemoveFromGroup(photo.id)}
                      isInGroup={true}
                    />
                  ))}
                </div>
              </div>
            );
          }

          // Single standalone photo block
          const { photo, originalIndex } = block.items[0];
          return (
            <PhotoCardTile
              key={`block-single-${photo.id}`}
              photo={photo}
              originalIndex={originalIndex}
              totalPhotos={photos.length}
              isSelected={selectedPhotoIds.includes(photo.id)}
              isCover={coverImageUrl === photo.url}
              isEditing={editingPhotoId === photo.id}
              isDragging={draggedIndex === originalIndex}
              isDragOver={dragOverIndex === originalIndex}
              onDragStart={() => setDraggedIndex(originalIndex)}
              onDragOver={() => setDragOverIndex(originalIndex)}
              onDragEnd={() => {
                setDraggedIndex(null);
                setDragOverIndex(null);
              }}
              onDrop={() => {
                if (draggedIndex !== null) {
                  handleDrop(draggedIndex, originalIndex);
                }
              }}
              onToggleSelect={() => toggleSelectPhoto(photo.id)}
              onExpandPhoto={() => handleExpandPhoto(originalIndex)}
              onMoveUp={() => movePhotoInList(originalIndex, originalIndex - 1)}
              onMoveDown={() => movePhotoInList(originalIndex, originalIndex + 1)}
              onSetCoverPhoto={() => onSetCoverPhoto(photo.url)}
              onStartEdit={() => startEditing(photo)}
              onDeletePhoto={() => onDeletePhoto(photo.id)}
              onQuickGroupNext={() => handleQuickGroupWithNext(originalIndex)}
              isInGroup={false}
            />
          );
        })}
      </div>

      {/* Fullscreen Lightbox Modal for Full Size Photo & EXIF View */}
      <Lightbox
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        album={album}
        photos={photos}
        selectedIndex={lightboxIndex}
        onIndexChange={setLightboxIndex}
      />

      {/* Edit Metadata Modal */}
      {editingPhotoId && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#14171a] border border-white/20 p-6 max-w-md w-full rounded-lg space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <span className="font-mono text-xs uppercase tracking-widest text-white/80 font-bold">
                Edit Photo Metadata
              </span>
              <button onClick={() => setEditingPhotoId(null)} className="text-white/50 hover:text-white">
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
                className="w-full bg-white/5 border border-white/15 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-white/40"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-widest text-white/50 block">Hashtags (comma separated)</label>
              <input
                type="text"
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
                className="w-full bg-white/5 border border-white/15 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-white/40"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-widest text-white/50 block">Description / Story</label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
                className="w-full bg-white/5 border border-white/15 px-3 py-2 text-xs text-white resize-none focus:outline-none focus:border-white/40"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleSaveMetadata(editingPhotoId)}
                className="flex-1 bg-white text-black font-mono text-xs uppercase tracking-widest py-2.5 font-bold cursor-pointer hover:bg-white/90"
              >
                Save Updates
              </button>
              <button
                onClick={() => setEditingPhotoId(null)}
                className="flex-1 bg-white/10 text-white font-mono text-xs uppercase tracking-widest py-2.5 cursor-pointer hover:bg-white/20"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface PhotoCardTileProps {
  photo: Photo;
  originalIndex: number;
  totalPhotos: number;
  isSelected: boolean;
  isCover: boolean;
  isEditing: boolean;
  isDragging: boolean;
  isDragOver: boolean;
  onDragStart: () => void;
  onDragOver: () => void;
  onDragEnd: () => void;
  onDrop: () => void;
  onToggleSelect: () => void;
  onExpandPhoto: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onSetCoverPhoto: () => void;
  onStartEdit: () => void;
  onDeletePhoto: () => void;
  onQuickGroupNext?: () => void;
  onRemoveFromGroup?: () => void;
  isInGroup: boolean;
}

function PhotoCardTile({
  photo,
  originalIndex,
  totalPhotos,
  isSelected,
  isCover,
  isDragging,
  isDragOver,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
  onToggleSelect,
  onExpandPhoto,
  onMoveUp,
  onMoveDown,
  onSetCoverPhoto,
  onStartEdit,
  onDeletePhoto,
  onQuickGroupNext,
  onRemoveFromGroup,
  isInGroup,
}: PhotoCardTileProps) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver();
      }}
      onDragEnd={onDragEnd}
      onDrop={(e) => {
        e.preventDefault();
        onDrop();
      }}
      className={`relative bg-[#14171a] border rounded-lg overflow-hidden flex flex-col sm:flex-row gap-4 p-3.5 transition-all group shadow-sm ${
        isDragging
          ? "opacity-30 border-amber-400 scale-[0.98]"
          : isDragOver
          ? "border-amber-400 border-2 border-dashed bg-amber-500/10 scale-[1.01]"
          : isSelected
          ? "border-amber-400 ring-1 ring-amber-400/50"
          : "border-white/10 hover:border-white/25"
      }`}
    >
      {/* Left side: Drag Handle & Thumbnail Container */}
      <div className="flex items-center gap-3">
        {/* Grip Handle */}
        <div
          className="text-white/30 hover:text-amber-400 cursor-grab active:cursor-grabbing p-1 shrink-0 select-none transition-colors"
          title="Click and drag to reorder"
        >
          <GripVertical className="h-5 w-5" />
        </div>

        {/* Thumbnail (Click to expand in Lightbox) */}
        <div
          onClick={onExpandPhoto}
          className="relative w-full sm:w-44 md:w-52 h-36 shrink-0 bg-black/60 rounded overflow-hidden flex items-center justify-center border border-white/10 select-none cursor-pointer group/thumb"
          title="Click to view full size and EXIF details"
        >
          <Image
            src={photo.url}
            alt={photo.description || ""}
            fill
            sizes="220px"
            className="object-contain transition-transform duration-500 group-hover/thumb:scale-105"
          />
          {isCover && (
            <div className="absolute top-2 left-2 bg-amber-500 text-black text-[9px] font-bold font-mono px-2 py-0.5 uppercase tracking-wider flex items-center gap-1 shadow-md z-10">
              <Star className="h-3 w-3 fill-black" />
              Cover
            </div>
          )}

          {/* Hover Expand Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
            <div className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white shadow-lg flex items-center gap-1.5 px-3 font-mono text-[10px] font-bold uppercase tracking-wider">
              <Maximize2 className="h-3.5 w-3.5" />
              <span>Expand</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Photo Information & Toolbar */}
      <div className="flex-grow flex flex-col justify-between min-w-0 space-y-3">
        {/* Top Header: Checkbox, Index, Location & EXIF */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-2.5">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onToggleSelect}
              className="rounded border-white/30 text-amber-500 focus:ring-amber-500 cursor-pointer h-4 w-4"
            />
            <span className="font-mono text-xs text-white/80 font-bold tracking-wider select-none">
              Still #{originalIndex + 1}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-white/50 select-none">
            {photo.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {photo.location}
              </span>
            )}
            {photo.exif?.camera && (
              <span className="flex items-center gap-1">
                <Camera className="h-3 w-3" />
                {photo.exif.camera}
              </span>
            )}
          </div>
        </div>

        {/* Middle Info: Story Description, Score & Hashtags */}
        <div className="space-y-1.5 min-w-0">
          {photo.description ? (
            <p className="font-serif italic text-xs text-white/90 line-clamp-2 leading-relaxed">
              "{photo.description}"
            </p>
          ) : (
            <p className="font-mono text-[11px] text-white/30 italic">No description provided</p>
          )}

          <div className="flex flex-wrap items-center gap-3 text-xs select-none">
            {photo.score !== undefined && photo.score !== null && (
              <span className="bg-amber-500/10 text-amber-400 font-mono text-[10px] font-bold px-2 py-0.5 border border-amber-500/20 rounded">
                ★ {photo.score} / 10
              </span>
            )}

            {photo.tags && photo.tags.length > 0 && (
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-white/50">
                <Tag className="h-3 w-3 opacity-60" />
                <span>{photo.tags.map((t) => `#${t}`).join(" ")}</span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Actions Toolbar */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10 select-none">
          <div className="flex items-center gap-1">
            <button
              disabled={originalIndex === 0}
              onClick={onMoveUp}
              className="hover:bg-white/15 p-1.5 rounded disabled:opacity-20 transition-colors text-white/80 hover:text-white flex items-center gap-1 text-[10px] font-mono cursor-pointer"
              title="Move Up in Story"
            >
              <ArrowUp className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Up</span>
            </button>
            <button
              disabled={originalIndex === totalPhotos - 1}
              onClick={onMoveDown}
              className="hover:bg-white/15 p-1.5 rounded disabled:opacity-20 transition-colors text-white/80 hover:text-white flex items-center gap-1 text-[10px] font-mono cursor-pointer"
              title="Move Down in Story"
            >
              <ArrowDown className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Down</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onExpandPhoto}
              className="hover:bg-white/15 p-1.5 rounded text-white/60 hover:text-white transition-colors flex items-center gap-1 text-[10px] font-mono cursor-pointer"
              title="Expand image in Full Lightbox"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Expand</span>
            </button>

            {!isCover && (
              <button
                onClick={onSetCoverPhoto}
                className="hover:bg-amber-500/20 p-1.5 rounded text-white/60 hover:text-amber-400 transition-colors flex items-center gap-1 text-[10px] font-mono cursor-pointer"
                title="Set as Album Cover"
              >
                <Star className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Set Cover</span>
              </button>
            )}

            {isInGroup ? (
              <button
                onClick={onRemoveFromGroup}
                className="hover:bg-amber-500/20 p-1.5 rounded text-amber-400 transition-colors flex items-center gap-1 text-[10px] font-mono cursor-pointer"
                title="Remove photo from row group"
              >
                <Unlink className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Ungroup</span>
              </button>
            ) : (
              onQuickGroupNext && originalIndex < totalPhotos - 1 && (
                <button
                  onClick={onQuickGroupNext}
                  className="hover:bg-white/15 p-1.5 rounded text-white/60 hover:text-white transition-colors flex items-center gap-1 text-[10px] font-mono cursor-pointer"
                  title="Group with next photo into side-by-side row"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">Group Next</span>
                </button>
              )
            )}

            <button
              onClick={onStartEdit}
              className="hover:bg-white/15 p-1.5 rounded text-white/60 hover:text-white transition-colors flex items-center gap-1 text-[10px] font-mono cursor-pointer"
              title="Edit Metadata"
            >
              <Pencil className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Edit</span>
            </button>

            <button
              onClick={onDeletePhoto}
              className="hover:bg-red-500/20 p-1.5 rounded text-white/60 hover:text-red-400 transition-colors cursor-pointer"
              title="Delete Photo"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
