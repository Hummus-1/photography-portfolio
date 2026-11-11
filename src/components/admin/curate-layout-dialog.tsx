"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Sparkles,
  Wand2,
  Check,
  Loader2,
  Rows,
  Layers,
  Star,
  Compass,
  Clock,
  ArrowRight,
  Shuffle,
  Flame,
  LayoutGrid,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Album, Photo } from "@/lib/types";
import { ThinkingOrb, OrbState } from "./thinking-orb";

interface CuratedItem {
  photoId: string;
  groupId: string | null;
  curatorialNote?: string;
}

interface CuratedPlan {
  coverPhotoId: string;
  coverRationale: string;
  alternativeCoverIds: string[];
  openingPhotoId: string;
  curatorialSummary: string;
  layout: CuratedItem[];
}

interface CurateLayoutDialogProps {
  album: Album;
  photos: Photo[];
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onLayoutApplied: (newPhotos: Photo[], newCoverUrl?: string) => void;
  trigger?: React.ReactNode;
}

export function CurateLayoutDialog({
  album,
  photos,
  isOpen: externalIsOpen,
  onOpenChange: externalOnOpenChange,
  onLayoutApplied,
  trigger,
}: CurateLayoutDialogProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isControlled = externalIsOpen !== undefined;
  const isOpen = isControlled ? externalIsOpen : internalIsOpen;

  const setIsOpen = (open: boolean) => {
    if (isControlled && externalOnOpenChange) {
      externalOnOpenChange(open);
    } else {
      setInternalIsOpen(open);
    }
  };

  const [style, setStyle] = useState<"editorial" | "visual" | "chronological">("editorial");
  const [loading, setLoading] = useState(false);
  const [orbState, setOrbState] = useState<OrbState>("idle");
  const [plan, setPlan] = useState<CuratedPlan | null>(null);
  const [selectedCoverId, setSelectedCoverId] = useState<string>("");
  const [applying, setApplying] = useState(false);

  const photoMap = React.useMemo(() => {
    const map = new Map<string, Photo>();
    photos.forEach((p) => map.set(p.id, p));
    return map;
  }, [photos]);

  const handleCurate = async (selectedStyle: "editorial" | "visual" | "chronological" = style) => {
    if (photos.length === 0) {
      toast.error("Upload photos first before curating a layout!");
      return;
    }

    setLoading(true);
    setOrbState("ai-analyzing");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        toast.error("Authentication expired. Please sign in again.");
        setOrbState("error");
        return;
      }

      const res = await fetch("/api/albums/curate-layout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          albumId: album.id,
          style: selectedStyle,
          applyImmediately: false,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to curate layout");
      }

      if (data.plan) {
        setPlan(data.plan);
        setSelectedCoverId(data.plan.coverPhotoId || album.cover_image_url || "");
        setOrbState("success");
        toast.success("AI curatorial layout generated!");
      }
    } catch (err: any) {
      console.error("Curation error:", err);
      setOrbState("error");
      toast.error(err.message || "Failed to generate layout proposal");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyLayout = async () => {
    if (!plan) return;

    setApplying(true);
    try {
      // 1. Identify chosen cover photo
      const chosenCover = photoMap.get(selectedCoverId);
      const chosenCoverUrl = chosenCover ? chosenCover.url : album.cover_image_url;

      // 2. Build updated photos array matching the curated sequence
      const reorderedPhotos: Photo[] = [];
      const planItems = plan.layout;

      for (let i = 0; i < planItems.length; i++) {
        const item = planItems[i];
        const existing = photoMap.get(item.photoId);
        if (existing) {
          reorderedPhotos.push({
            ...existing,
            sort_order: i,
            group_id: item.groupId,
          });
        }
      }

      // Add any unaccounted photos at the end
      const accountedIds = new Set(planItems.map((item) => item.photoId));
      for (const p of photos) {
        if (!accountedIds.has(p.id)) {
          reorderedPhotos.push({
            ...p,
            sort_order: reorderedPhotos.length,
            group_id: null,
          });
        }
      }

      // 3. Persist new cover photo to Supabase if changed
      if (chosenCoverUrl && chosenCoverUrl !== album.cover_image_url) {
        const { error: coverErr } = await supabase
          .from("albums")
          .update({ cover_image_url: chosenCoverUrl })
          .eq("id", album.id);

        if (coverErr) {
          console.error("Failed to update cover:", coverErr);
        }
      }

      // 4. Batch update photo sort_orders and group_ids in Supabase
      const updatePromises = reorderedPhotos.map((p, idx) =>
        supabase
          .from("photos")
          .update({
            sort_order: idx,
            group_id: p.group_id || null,
          })
          .eq("id", p.id)
      );

      await Promise.all(updatePromises);

      // 5. Notify parent component
      onLayoutApplied(reorderedPhotos, chosenCoverUrl || undefined);
      toast.success("Curated layout and cover applied successfully!");
      setIsOpen(false);
    } catch (err: any) {
      console.error("Apply error:", err);
      toast.error(`Failed to apply curated layout: ${err.message}`);
    } finally {
      setApplying(false);
    }
  };

  const coverPhotoObj = photoMap.get(selectedCoverId) || photoMap.get(plan?.coverPhotoId || "") || photos[0];
  const openingPhotoObj = photoMap.get(plan?.openingPhotoId || "") || photos[0];

  // Group visual stats
  const groupsCount = plan
    ? new Set(plan.layout.map((item) => item.groupId).filter(Boolean)).size
    : 0;
  const groupedPhotosCount = plan
    ? plan.layout.filter((item) => item.groupId !== null).length
    : 0;
  const soloPhotosCount = plan ? plan.layout.length - groupedPhotosCount : 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger ? (
        <DialogTrigger render={<>{trigger}</>} />
      ) : (
        <DialogTrigger
          render={
            <Button
              size="sm"
              className="bg-primary/20 text-primary border border-primary/40 hover:bg-primary/30 rounded-none font-mono text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI Suggest Layout</span>
            </Button>
          }
        />
      )}

      <DialogContent className="max-w-4xl max-h-[88vh] overflow-y-auto bg-card border border-border p-6 font-sans">
        <DialogHeader className="border-b border-border pb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ThinkingOrb state={orbState} size="md" />
              <div>
                <DialogTitle className="font-serif text-2xl font-bold tracking-wide text-foreground flex items-center gap-2">
                  <span>AI Exhibition Layout Curator</span>
                  <span className="text-[10px] font-mono tracking-widest uppercase bg-primary/20 text-primary border border-primary/30 px-2 py-0.5">
                    Studio Intelligence
                  </span>
                </DialogTitle>
                <DialogDescription className="text-xs font-mono uppercase tracking-widest text-muted-foreground mt-0.5">
                  Automated editorial storytelling, cover selection, diptych grouping & rhythmic pacing
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Style Selector Toolbar */}
        <div className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-foreground/[0.02] border border-border">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-foreground/80 font-bold block">
                Curatorial Philosophy
              </span>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Choose the guiding principle the AI will use to sequence and group your stills.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setStyle("editorial");
                  if (plan) handleCurate("editorial");
                }}
                className={`px-3 py-1.5 font-mono text-xs uppercase tracking-wider flex items-center gap-1.5 border transition-all ${
                  style === "editorial"
                    ? "bg-primary text-primary-foreground border-primary font-bold shadow-sm"
                    : "bg-foreground/5 border-border text-foreground/70 hover:text-foreground hover:bg-foreground/10"
                }`}
              >
                <Compass className="h-3.5 w-3.5" />
                <span>Editorial Story</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStyle("visual");
                  if (plan) handleCurate("visual");
                }}
                className={`px-3 py-1.5 font-mono text-xs uppercase tracking-wider flex items-center gap-1.5 border transition-all ${
                  style === "visual"
                    ? "bg-primary text-primary-foreground border-primary font-bold shadow-sm"
                    : "bg-foreground/5 border-border text-foreground/70 hover:text-foreground hover:bg-foreground/10"
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span>Visual Harmony</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStyle("chronological");
                  if (plan) handleCurate("chronological");
                }}
                className={`px-3 py-1.5 font-mono text-xs uppercase tracking-wider flex items-center gap-1.5 border transition-all ${
                  style === "chronological"
                    ? "bg-primary text-primary-foreground border-primary font-bold shadow-sm"
                    : "bg-foreground/5 border-border text-foreground/70 hover:text-foreground hover:bg-foreground/10"
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                <span>Chronological</span>
              </button>
            </div>
          </div>

          {/* Action Trigger before plan is created */}
          {!plan && (
            <div className="text-center py-12 px-6 border border-dashed border-border bg-foreground/[0.01] flex flex-col items-center justify-center space-y-4">
              <ThinkingOrb state={loading ? "ai-analyzing" : "idle"} size="lg" />
              <div className="max-w-md space-y-1">
                <p className="font-serif text-lg font-bold text-foreground">
                  Ready to Curate {photos.length} Stills
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  The AI Curator will inspect each photo's visual quality score, aspect ratio, orientation, EXIF timestamps, and semantic descriptions to craft a compelling visual narrative.
                </p>
              </div>

              <Button
                size="default"
                onClick={() => handleCurate()}
                disabled={loading || photos.length === 0}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-mono text-xs uppercase tracking-widest px-6 py-2.5 rounded-none flex items-center gap-2 cursor-pointer shadow-md"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                <span>{loading ? "Analyzing Visual Rhythm..." : "Generate Layout Proposal"}</span>
              </Button>
            </div>
          )}

          {/* Plan Results View */}
          {plan && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Curatorial Vision Summary */}
              <div className="p-4 bg-primary/5 border border-primary/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-widest text-primary font-bold flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" /> Curatorial Vision & Narrative Arc
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCurate()}
                    disabled={loading}
                    className="text-[10px] font-mono uppercase text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                  >
                    <Shuffle className="h-3 w-3" /> Re-curate
                  </button>
                </div>
                <p className="text-xs text-foreground/90 leading-relaxed font-sans">
                  {plan.curatorialSummary}
                </p>
              </div>

              {/* Cover Image & Opening Frame Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Hero Cover Image Selection */}
                <div className="md:col-span-8 p-4 bg-foreground/[0.02] border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-foreground/60 flex items-center gap-1.5 font-bold">
                      <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                      Suggested Hero Cover
                    </span>
                    <span className="text-[10px] font-mono text-primary bg-primary/10 border border-primary/20 px-2 py-0.5">
                      Aspect Ratio: {coverPhotoObj?.aspect_ratio || "3:2"}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    <div className="relative w-full sm:w-56 h-36 bg-foreground/10 shrink-0 border border-border overflow-hidden">
                      {coverPhotoObj && (
                        <Image
                          src={coverPhotoObj.url}
                          alt={coverPhotoObj.description || "Cover Still"}
                          fill
                          sizes="240px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="space-y-2 flex-grow">
                      <p className="text-xs text-foreground/80 leading-relaxed italic">
                        "{plan.coverRationale}"
                      </p>

                      {/* Alternative Cover Picks */}
                      {plan.alternativeCoverIds && plan.alternativeCoverIds.length > 0 && (
                        <div className="pt-2 border-t border-border/40">
                          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block mb-1.5">
                            Alternative Cover Options:
                          </span>
                          <div className="flex items-center gap-2">
                            {plan.alternativeCoverIds.map((altId) => {
                              const altPhoto = photoMap.get(altId);
                              if (!altPhoto) return null;
                              const isSelected = selectedCoverId === altId;
                              return (
                                <button
                                  key={altId}
                                  type="button"
                                  onClick={() => setSelectedCoverId(altId)}
                                  className={`relative w-14 h-10 border transition-all overflow-hidden ${
                                    isSelected
                                      ? "border-primary ring-2 ring-primary/40 scale-105"
                                      : "border-border hover:border-foreground/50 opacity-70 hover:opacity-100"
                                  }`}
                                  title="Click to select this as album cover"
                                >
                                  <Image
                                    src={altPhoto.url}
                                    alt="Alternative cover"
                                    fill
                                    sizes="60px"
                                    className="object-cover"
                                  />
                                  {isSelected && (
                                    <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                                      <Check className="h-3 w-3 text-white" />
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Opening Frame Highlight */}
                <div className="md:col-span-4 p-4 bg-foreground/[0.02] border border-border space-y-3 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-foreground/60 flex items-center gap-1.5 font-bold mb-2">
                      <Flame className="h-3 w-3 text-primary" /> Gallery Opener (First Still)
                    </span>
                    <div className="relative w-full h-24 bg-foreground/10 border border-border overflow-hidden mb-2">
                      {openingPhotoObj && (
                        <Image
                          src={openingPhotoObj.url}
                          alt={openingPhotoObj.description || "Opening frame"}
                          fill
                          sizes="180px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Sets the tone as visitors scroll into the exhibition.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-border/40 text-[10px] font-mono text-muted-foreground">
                    Index #1 of {plan.layout.length} stills
                  </div>
                </div>
              </div>

              {/* Layout Rhythm Stats Pill Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-foreground/[0.02] border border-border text-xs font-mono">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="flex items-center gap-1.5 text-foreground/80">
                    <Rows className="h-3.5 w-3.5 text-primary" />
                    <strong>{plan.layout.length}</strong> Stills Sequenced
                  </span>
                  <span className="text-border">•</span>
                  <span className="flex items-center gap-1.5 text-foreground/80">
                    <Layers className="h-3.5 w-3.5 text-primary" />
                    <strong>{groupsCount}</strong> Diptych / Multi-Rows ({groupedPhotosCount} paired)
                  </span>
                  <span className="text-border">•</span>
                  <span className="flex items-center gap-1.5 text-foreground/80">
                    <Star className="h-3.5 w-3.5 text-primary" />
                    <strong>{soloPhotosCount}</strong> Standalone Features
                  </span>
                </div>
              </div>

              {/* Visual Sequence Preview Strip */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block">
                  Curated Visual Flow (Sequence Order):
                </span>
                <div className="p-3 bg-foreground/[0.02] border border-border max-h-56 overflow-y-auto space-y-2">
                  {/* Group items for preview */}
                  {(() => {
                    const previewBlocks: { type: "single" | "group"; items: typeof plan.layout }[] = [];
                    let i = 0;
                    while (i < plan.layout.length) {
                      const cur = plan.layout[i];
                      if (cur.groupId) {
                        const gId = cur.groupId;
                        const gItems = [cur];
                        let j = i + 1;
                        while (j < plan.layout.length && plan.layout[j].groupId === gId) {
                          gItems.push(plan.layout[j]);
                          j++;
                        }
                        previewBlocks.push({ type: "group", items: gItems });
                        i = j;
                        continue;
                      }
                      previewBlocks.push({ type: "single", items: [cur] });
                      i++;
                    }

                    return previewBlocks.map((block, bIdx) => (
                      <div
                        key={bIdx}
                        className={`p-2 border flex items-center justify-between gap-3 text-xs font-mono ${
                          block.type === "group"
                            ? "bg-primary/5 border-primary/30"
                            : "bg-foreground/[0.01] border-border/50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground w-6">#{bIdx + 1}</span>
                          <span
                            className={`text-[9px] uppercase px-1.5 py-0.5 border ${
                              block.type === "group"
                                ? "bg-primary/20 text-primary border-primary/30 font-bold"
                                : "bg-foreground/5 text-foreground/60 border-border"
                            }`}
                          >
                            {block.type === "group" ? `Diptych (${block.items.length} paired)` : "Full-Width Single"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {block.items.map((item, itmIdx) => {
                            const p = photoMap.get(item.photoId);
                            if (!p) return null;
                            const isCover = p.id === selectedCoverId;
                            return (
                              <div
                                key={item.photoId}
                                className={`relative w-12 h-9 border overflow-hidden ${
                                  isCover ? "ring-2 ring-amber-400 border-amber-400" : "border-border"
                                }`}
                                title={item.curatorialNote || p.description || ""}
                              >
                                <Image
                                  src={p.url}
                                  alt={p.description || ""}
                                  fill
                                  sizes="48px"
                                  className="object-cover"
                                />
                                {isCover && (
                                  <span className="absolute bottom-0 right-0 bg-amber-400 text-black text-[7px] font-bold px-0.5">
                                    ★
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* Bottom Apply Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <Button
                  variant="ghost"
                  onClick={() => setIsOpen(false)}
                  disabled={applying}
                  className="font-mono text-xs uppercase tracking-wider rounded-none text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </Button>

                <Button
                  onClick={handleApplyLayout}
                  disabled={applying}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-mono text-xs uppercase tracking-widest px-6 py-2.5 rounded-none flex items-center gap-2 cursor-pointer shadow-md"
                >
                  {applying ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  <span>{applying ? "Applying Layout..." : "Apply Curated Layout"}</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
