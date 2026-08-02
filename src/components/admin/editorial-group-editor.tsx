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
  Grid,
  CheckSquare,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { ThinkingOrb } from "./thinking-orb";

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
  const [viewMode, setViewMode] = useState<"story" | "masonry">("story");

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
  const [draggedBlockIndex, setDraggedBlockIndex] = useState<number | null>(null);
  const [dragOverBlockIndex, setDragOverBlockIndex] = useState<number | null>(null);

  useEffect(() => {
    setPhotos(initialPhotos || []);
  }, [initialPhotos]);

  const cleanupGroups = (list: Photo[]): Photo[] => {
    const groupCounts: Record<string, number> = {};
    list.forEach((p) => {
      if (p.group_id) {
        groupCounts[p.group_id] = (groupCounts[p.group_id] || 0) + 1;
      }
    });

    const step1 = list.map((p) => {
      if (p.group_id && groupCounts[p.group_id] < 2) {
        return { ...p, group_id: null };
      }
      return p;
    });

    const result: Photo[] = [];
    let currentGroupOriginalId: string | null = null;
    let currentGroupNewId: string | null = null;
    const processedGroups = new Set<string>();

    for (let idx = 0; idx < step1.length; idx++) {
      const photo = step1[idx];
      if (!photo.group_id) {
        result.push(photo);
        currentGroupOriginalId = null;
        currentGroupNewId = null;
      } else {
        if (photo.group_id === currentGroupOriginalId) {
          result.push({ ...photo, group_id: currentGroupNewId! });
        } else {
          currentGroupOriginalId = photo.group_id;
          if (processedGroups.has(photo.group_id)) {
            currentGroupNewId = `row_${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${idx}`;
          } else {
            processedGroups.add(photo.group_id);
            currentGroupNewId = photo.group_id;
          }
          result.push({ ...photo, group_id: currentGroupNewId });
        }
      }
    }

    const finalCounts: Record<string, number> = {};
    result.forEach((p) => {
      if (p.group_id) {
        finalCounts[p.group_id] = (finalCounts[p.group_id] || 0) + 1;
      }
    });

    return result.map((p, idx) => ({
      ...p,
      group_id: p.group_id && finalCounts[p.group_id] >= 2 ? p.group_id : null,
      sort_order: idx,
    }));
  };

  const toggleSelectPhoto = (id: string) => {
    setSelectedPhotoIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedPhotoIds.length === photos.length) {
      setSelectedPhotoIds([]);
    } else {
      setSelectedPhotoIds(photos.map((p) => p.id));
    }
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
      cleanupGroups(prev.map((p) => (selectedPhotoIds.includes(p.id) ? { ...p, group_id: newGroupId } : p)))
    );
    setSelectedPhotoIds([]);
    toast.success(`Grouped ${selectedPhotoIds.length} photos into a side-by-side row!`);
  };

  const handleUngroupRow = (groupId: string) => {
    setPhotos((prev) =>
      cleanupGroups(prev.map((p) => (p.group_id === groupId ? { ...p, group_id: null } : p)))
    );
    toast.info("Row group removed.");
  };

  const handleRemoveFromGroup = (photoId: string) => {
    setPhotos((prev) =>
      cleanupGroups(prev.map((p) => (p.id === photoId ? { ...p, group_id: null } : p)))
    );
  };

  const handleQuickGroupWithNext = (index: number) => {
    if (index >= photos.length - 1) return;
    const currentPhoto = photos[index];
    const groupId = currentPhoto.group_id || `row_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    setPhotos((prev) =>
      cleanupGroups(
        prev.map((p, idx) => {
          if (idx === index || idx === index + 1) {
            return { ...p, group_id: groupId };
          }
          return p;
        })
      )
    );
    toast.success("Grouped with next photo!");
  };

  const movePhotoInList = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= photos.length || fromIndex === toIndex) return;
    const updated = [...photos];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);

    setPhotos(cleanupGroups(updated));
  };

  const handleDrop = (fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx || fromIdx < 0 || toIdx < 0 || fromIdx >= photos.length || toIdx >= photos.length) return;

    const updated = [...photos];
    const [draggedPhoto] = updated.splice(fromIdx, 1);

    const targetIdxInUpdated = toIdx > fromIdx ? toIdx - 1 : toIdx;
    const targetPhoto = updated[targetIdxInUpdated];

    if (targetPhoto && targetPhoto.group_id) {
      const targetGroupId = targetPhoto.group_id;
      const groupMembers = updated.filter((p) => p.group_id === targetGroupId);
      if (groupMembers.length < 4) {
        draggedPhoto.group_id = targetGroupId;
      } else {
        draggedPhoto.group_id = null;
      }
    } else {
      draggedPhoto.group_id = null;
    }

    updated.splice(toIdx, 0, draggedPhoto);
    setPhotos(cleanupGroups(updated));
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const moveBlockInList = (fromBlockIdx: number, toBlockIdx: number) => {
    if (fromBlockIdx < 0 || toBlockIdx < 0 || fromBlockIdx >= visualBlocks.length || toBlockIdx >= visualBlocks.length || fromBlockIdx === toBlockIdx) return;

    const fromBlock = visualBlocks[fromBlockIdx];
    const toBlock = visualBlocks[toBlockIdx];

    const movedPhotoIds = new Set(fromBlock.items.map((item) => item.photo.id));
    const movedPhotos = photos.filter((p) => movedPhotoIds.has(p.id));
    const remainingPhotos = photos.filter((p) => !movedPhotoIds.has(p.id));

    let targetId = toBlock.items[0].photo.id;
    let insertIdx = remainingPhotos.findIndex((p) => p.id === targetId);

    if (fromBlockIdx < toBlockIdx) {
      const targetLastId = toBlock.items[toBlock.items.length - 1].photo.id;
      insertIdx = remainingPhotos.findIndex((p) => p.id === targetLastId) + 1;
    }
    if (insertIdx < 0) insertIdx = remainingPhotos.length;

    remainingPhotos.splice(insertIdx, 0, ...movedPhotos);
    setPhotos(cleanupGroups(remainingPhotos));
  };

  const handleDropBlock = (fromBlockIdx: number, toBlockIdx: number) => {
    moveBlockInList(fromBlockIdx, toBlockIdx);
    setDraggedBlockIndex(null);
    setDragOverBlockIndex(null);
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
      <div className="flex py-20 justify-center items-center flex-col gap-3">
        <ThinkingOrb state="thinking" size="lg" label="Loading Photos" sublabel="Fetching collection stills" />
      </div>
    );
  }

  if (!photos || photos.length === 0) {
    return (
      <div className="p-12 border border-dashed border-white/10 bg-white/[0.02] text-center space-y-2">
        <p className="text-sm font-serif text-white/50">No photos uploaded to this album yet.</p>
        <p className="text-xs font-mono text-white/30 uppercase tracking-widest">
          Use the uploader dropzone above to add photos.
        </p>
      </div>
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
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h4 className="font-serif text-xl font-bold tracking-wide text-white">
              Editorial Layout & Story Manager
            </h4>
            <span className="font-mono text-[10px] bg-film-amber/10 border border-film-amber/30 px-2 py-0.5 text-film-amber uppercase tracking-widest font-semibold">
              {photos.length} Stills
            </span>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">
            Drag photo grip handles or whole row headers to reorder • Select photos to group side-by-side
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Switcher */}
          <div className="flex items-center p-0.5 bg-black/40 border border-white/10">
            <button
              onClick={() => setViewMode("story")}
              className={`px-3 py-1.5 font-mono text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                viewMode === "story"
                  ? "bg-film-amber/20 text-film-amber border border-film-amber/40 font-bold"
                  : "text-white/40 hover:text-white"
              }`}
            >
              <Rows className="h-3.5 w-3.5" />
              <span>Rows</span>
            </button>
            <button
              onClick={() => setViewMode("masonry")}
              className={`px-3 py-1.5 font-mono text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                viewMode === "masonry"
                  ? "bg-film-amber/20 text-film-amber border border-film-amber/40 font-bold"
                  : "text-white/40 hover:text-white"
              }`}
            >
              <Grid className="h-3.5 w-3.5" />
              <span>Grid</span>
            </button>
          </div>

          <button
            onClick={toggleSelectAll}
            className="px-3 py-1.5 font-mono text-xs uppercase tracking-wider border border-white/10 text-white/60 hover:text-white hover:bg-white/5 flex items-center gap-1.5 transition-all"
          >
            <CheckSquare className="h-3.5 w-3.5" />
            <span>{selectedPhotoIds.length === photos.length ? "Deselect All" : "Select All"}</span>
          </button>

          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="bg-[#e8e5f0] text-[#0E1012] hover:bg-[#d4d0de] disabled:opacity-50 px-5 py-2 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md"
          >
            {isSaving ? (
              <ThinkingOrb state="thinking" size="sm" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>Save Layout</span>
          </button>
        </div>
      </div>

      {/* Floating Batch Action Command Dock */}
      {selectedPhotoIds.length > 0 && (
        <div className="sticky top-4 z-30 p-4 bg-[#121519]/90 backdrop-blur-xl border border-film-amber/40 shadow-2xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 text-xs font-mono text-white">
            <ThinkingOrb state="idle" size="sm" />
            <span className="font-bold text-film-amber">{selectedPhotoIds.length} Photos Selected</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleGroupSelected}
              className="bg-film-amber text-white hover:bg-film-amber/90 font-bold px-3.5 py-1.5 font-mono text-xs uppercase tracking-widest flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Group Row</span>
            </button>

            <button
              onClick={() => setSelectedPhotoIds([])}
              className="bg-white/10 text-white hover:bg-white/20 px-3 py-1.5 font-mono text-xs uppercase tracking-widest cursor-pointer transition-all"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Editorial Feed Blocks List or Masonry View */}
      {viewMode === "story" ? (
        <div className="space-y-6">
          {visualBlocks.map((block, blockIndex) => {
            if (block.type === "group" && block.groupId) {
              const isGroupDragging = draggedBlockIndex === blockIndex;
              const isGroupDragOver = dragOverBlockIndex === blockIndex;

              return (
                <div
                  key={`block-${block.groupId}-${blockIndex}`}
                  draggable
                  onDragStart={(e) => {
                    e.stopPropagation();
                    setDraggedBlockIndex(blockIndex);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragOverBlockIndex(blockIndex);
                  }}
                  onDragEnd={() => {
                    setDraggedBlockIndex(null);
                    setDragOverBlockIndex(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (draggedBlockIndex !== null && draggedBlockIndex !== blockIndex) {
                      handleDropBlock(draggedBlockIndex, blockIndex);
                    }
                  }}
                  className={`bg-film-amber/5 border-2 border-dashed rounded-none p-4 space-y-4 relative transition-all ${
                    isGroupDragging
                      ? "opacity-30 border-film-amber scale-[0.99]"
                      : isGroupDragOver
                      ? "border-film-amber border-2 bg-film-amber/15 scale-[1.01]"
                      : "border-film-amber/30"
                  }`}
                >
                  {/* Group Header Bar with Move Handles */}
                  <div className="flex items-center justify-between border-b border-film-amber/20 pb-2.5">
                    <div className="flex items-center gap-2 text-film-amber font-mono text-xs font-bold uppercase tracking-wider">
                      <div className="cursor-grab active:cursor-grabbing p-1 text-film-amber/80 hover:text-film-amber transition-colors" title="Drag to move entire group row">
                        <GripVertical className="h-4 w-4" />
                      </div>
                      <Layers className="h-4 w-4" />
                      <span>Side-by-Side Row Group ({block.items.length} Photos)</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        disabled={blockIndex === 0}
                        onClick={() => moveBlockInList(blockIndex, blockIndex - 1)}
                        className="hover:bg-film-amber/20 disabled:opacity-20 p-1.5 rounded text-film-amber text-xs font-mono flex items-center gap-1 transition-colors"
                        title="Move Row Group Up"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Move Row Up</span>
                      </button>
                      <button
                        disabled={blockIndex === visualBlocks.length - 1}
                        onClick={() => moveBlockInList(blockIndex, blockIndex + 1)}
                        className="hover:bg-film-amber/20 disabled:opacity-20 p-1.5 rounded text-film-amber text-xs font-mono flex items-center gap-1 transition-colors"
                        title="Move Row Group Down"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Move Row Down</span>
                      </button>
                      <button
                        onClick={() => handleUngroupRow(block.groupId!)}
                        className="text-film-amber hover:text-film-amber/80 font-mono text-xs uppercase tracking-widest flex items-center gap-1.5 px-3 py-1 bg-film-amber/10 hover:bg-film-amber/20 border border-film-amber/20 rounded-none transition-all cursor-pointer"
                        title="Break row into individual photos"
                      >
                        <Unlink className="h-3.5 w-3.5" />
                        <span>Ungroup Row</span>
                      </button>
                    </div>
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
      ) : (
        /* Masonry Grid View */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo, idx) => (
            <div
              key={photo.id}
              onClick={() => toggleSelectPhoto(photo.id)}
              className={`group relative bg-[#14171a] border overflow-hidden cursor-pointer transition-all ${
                selectedPhotoIds.includes(photo.id)
                  ? "border-film-amber ring-2 ring-film-amber/50"
                  : "border-white/10 hover:border-white/30"
              }`}
            >
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={photo.url}
                  alt={photo.description || ""}
                  fill
                  sizes="300px"
                  className="object-cover"
                />
                {coverImageUrl === photo.url && (
                  <span className="absolute top-2 left-2 bg-film-amber text-white text-[9px] font-mono font-bold px-2 py-0.5 uppercase tracking-wider">
                    Cover
                  </span>
                )}
                <div className="absolute top-2 right-2 bg-black/60 px-1.5 py-0.5 text-[9px] font-mono text-white/80">
                  #{idx + 1}
                </div>
              </div>

              <div className="p-2.5 flex items-center justify-between text-xs font-mono">
                <span className="text-white/60 text-[10px] truncate max-w-[120px]">
                  {photo.location || "No spot tag"}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExpandPhoto(idx);
                  }}
                  className="text-white/40 hover:text-white p-1"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#14171a] border border-white/20 p-6 max-w-md w-full rounded-none space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <span className="font-mono text-xs uppercase tracking-widest text-white/80 font-bold flex items-center gap-2">
                <Pencil className="h-3.5 w-3.5 text-film-amber" /> Edit Photo Metadata
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
                className="w-full bg-white/5 border border-white/15 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-film-amber"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-widest text-white/50 block">Hashtags (comma separated)</label>
              <input
                type="text"
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
                className="w-full bg-white/5 border border-white/15 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-film-amber"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-widest text-white/50 block">Description / Story</label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
                className="w-full bg-white/5 border border-white/15 px-3 py-2 text-xs text-white resize-none focus:outline-none focus:border-film-amber"
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
      className={`relative bg-[#14171a] border rounded-none overflow-hidden flex flex-col sm:flex-row gap-4 p-3.5 transition-all group shadow-sm ${
        isDragging
          ? "opacity-30 border-film-amber scale-[0.98]"
          : isDragOver
          ? "border-film-amber border-2 border-dashed bg-film-amber/10 scale-[1.01]"
          : isSelected
          ? "border-film-amber ring-1 ring-film-amber/50"
          : "border-white/10 hover:border-white/25"
      }`}
    >
      {/* Left side: Drag Handle & Thumbnail Container */}
      <div className="flex items-center gap-3">
        <div
          className="text-white/30 hover:text-film-amber cursor-grab active:cursor-grabbing p-1 shrink-0 select-none transition-colors"
          title="Click and drag to reorder"
        >
          <GripVertical className="h-5 w-5" />
        </div>

        <div
          onClick={onExpandPhoto}
          className="relative w-full sm:w-44 md:w-52 h-36 shrink-0 bg-black/60 rounded-none overflow-hidden flex items-center justify-center border border-white/10 select-none cursor-pointer group/thumb"
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
            <div className="absolute top-2 left-2 bg-film-amber text-white text-[9px] font-bold font-mono px-2 py-0.5 uppercase tracking-wider flex items-center gap-1 shadow-md z-10">
              <Star className="h-3 w-3 fill-white" />
              Cover
            </div>
          )}

          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
            <div className="p-2 bg-white/20 backdrop-blur-md text-white shadow-lg flex items-center gap-1.5 px-3 font-mono text-[10px] font-bold uppercase tracking-wider">
              <Maximize2 className="h-3.5 w-3.5" />
              <span>Expand</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Photo Information & Toolbar */}
      <div className="flex-grow flex flex-col justify-between min-w-0 space-y-3">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-2.5">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onToggleSelect}
              className="rounded border-white/30 text-film-amber focus:ring-film-amber cursor-pointer h-4 w-4"
            />
            <span className="font-mono text-xs text-white/80 font-bold tracking-wider select-none">
              Still #{originalIndex + 1}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-white/50 select-none">
            {photo.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-film-amber" />
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
              <span className="bg-film-amber/10 text-film-amber font-mono text-[10px] font-bold px-2 py-0.5 border border-film-amber/20">
                ★ {photo.score} / 10
              </span>
            )}

            {photo.tags && photo.tags.length > 0 && (
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-white/50">
                <Tag className="h-3 w-3 opacity-60 text-film-amber" />
                <span>{photo.tags.map((t) => `#${t}`).join(" ")}</span>
              </div>
            )}
          </div>
        </div>

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
                className="hover:bg-film-amber/20 p-1.5 rounded text-white/60 hover:text-film-amber transition-colors flex items-center gap-1 text-[10px] font-mono cursor-pointer"
                title="Set as Album Cover"
              >
                <Star className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Set Cover</span>
              </button>
            )}

            {isInGroup ? (
              <button
                onClick={onRemoveFromGroup}
                className="hover:bg-film-amber/20 p-1.5 rounded text-film-amber transition-colors flex items-center gap-1 text-[10px] font-mono cursor-pointer"
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
