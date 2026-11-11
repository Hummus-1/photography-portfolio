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
  Shuffle,
  Flame,
  LayoutGrid,
  Feather,
  Sliders,
  Maximize2,
  Palette,
  ArrowRightLeft,
  ChevronDown,
  ChevronUp,
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
import { CuratedPlan, CuratedItem } from "@/app/api/albums/curate-layout/route";

interface CurateLayoutDialogProps {
  album: Album;
  photos: Photo[];
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onLayoutApplied: (newPhotos: Photo[], newCoverUrl?: string, previousSnapshot?: { photos: Photo[]; coverUrl?: string | null }) => void;
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

  const [style, setStyle] = useState<"editorial" | "visual" | "minimalist" | "chronological">("editorial");
  const [density, setDensity] = useState<"spacious" | "balanced" | "dense">("balanced");
  const [loading, setLoading] = useState(false);
  const [orbState, setOrbState] = useState<OrbState>("idle");
  const [plan, setPlan] = useState<CuratedPlan | null>(null);
  const [selectedCoverId, setSelectedCoverId] = useState<string>("");
  const [applying, setApplying] = useState(false);
  const [activeTab, setActiveTab] = useState<"curated" | "current">("curated");
  const [showAllCoverOptions, setShowAllCoverOptions] = useState(false);

  const photoMap = React.useMemo(() => {
    const map = new Map<string, Photo>();
    photos.forEach((p) => map.set(p.id, p));
    return map;
  }, [photos]);

  const handleCurate = async (
    curationStyle: "editorial" | "visual" | "minimalist" | "chronological" = style,
    curationDensity: "spacious" | "balanced" | "dense" = density
  ) => {
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
          style: curationStyle,
          density: curationDensity,
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
      // 1. Snapshot previous state for instant Undo
      const previousSnapshot = {
        photos: [...photos],
        coverUrl: album.cover_image_url,
      };

      // 2. Identify chosen cover photo & its color palette
      const chosenCover = photoMap.get(selectedCoverId);
      const chosenCoverUrl = chosenCover ? chosenCover.url : album.cover_image_url;
      const chosenCoverPalette = chosenCover?.color_palette || album.cover_color_palette || [];

      // 3. Build updated photos array matching the curated sequence
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

      // 4. Persist new cover photo & its synchronized palette to Supabase if changed
      if (chosenCoverUrl && (chosenCoverUrl !== album.cover_image_url || chosenCoverPalette !== album.cover_color_palette)) {
        const { error: coverErr } = await supabase
          .from("albums")
          .update({
            cover_image_url: chosenCoverUrl,
            cover_color_palette: chosenCoverPalette,
          })
          .eq("id", album.id);

        if (coverErr) {
          console.error("Failed to update cover:", coverErr);
        }
      }

      // 5. Batch update photo sort_orders and group_ids in Supabase
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

      // 6. Notify parent component with previous snapshot for undo
      onLayoutApplied(reorderedPhotos, chosenCoverUrl || undefined, previousSnapshot);
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

  // Group stats
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

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border border-border p-6 font-sans">
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
                  Editorial storytelling • Rhythm & color harmony • Cover selection • Diptych & triptych grouping
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Style & Density Controls */}
        <div className="space-y-4 pt-2">
          <div className="p-4 bg-foreground/[0.02] border border-border space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-foreground/80 font-bold block">
                  Curatorial Philosophy
                </span>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Guides how the AI sequences narrative tension, pacing, and subject focus.
                </p>
              </div>

              {/* Style selector pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setStyle("editorial");
                    if (plan) handleCurate("editorial", density);
                  }}
                  className={`px-2.5 py-1.5 font-mono text-xs uppercase tracking-wider flex items-center gap-1.5 border transition-all ${
                    style === "editorial"
                      ? "bg-primary text-primary-foreground border-primary font-bold shadow-sm"
                      : "bg-foreground/5 border-border text-foreground/70 hover:text-foreground hover:bg-foreground/10"
                  }`}
                >
                  <Compass className="h-3.5 w-3.5" />
                  <span>Story Arc</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStyle("visual");
                    if (plan) handleCurate("visual", density);
                  }}
                  className={`px-2.5 py-1.5 font-mono text-xs uppercase tracking-wider flex items-center gap-1.5 border transition-all ${
                    style === "visual"
                      ? "bg-primary text-primary-foreground border-primary font-bold shadow-sm"
                      : "bg-foreground/5 border-border text-foreground/70 hover:text-foreground hover:bg-foreground/10"
                  }`}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  <span>Visual Rhythm</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStyle("minimalist");
                    if (plan) handleCurate("minimalist", density);
                  }}
                  className={`px-2.5 py-1.5 font-mono text-xs uppercase tracking-wider flex items-center gap-1.5 border transition-all ${
                    style === "minimalist"
                      ? "bg-primary text-primary-foreground border-primary font-bold shadow-sm"
                      : "bg-foreground/5 border-border text-foreground/70 hover:text-foreground hover:bg-foreground/10"
                  }`}
                >
                  <Feather className="h-3.5 w-3.5" />
                  <span>Fine Art</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStyle("chronological");
                    if (plan) handleCurate("chronological", density);
                  }}
                  className={`px-2.5 py-1.5 font-mono text-xs uppercase tracking-wider flex items-center gap-1.5 border transition-all ${
                    style === "chronological"
                      ? "bg-primary text-primary-foreground border-primary font-bold shadow-sm"
                      : "bg-foreground/5 border-border text-foreground/70 hover:text-foreground hover:bg-foreground/10"
                  }`}
                >
                  <Clock className="h-3.5 w-3.5" />
                  <span>Timeline</span>
                </button>
              </div>
            </div>

            {/* Density setting */}
            <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-border/50 text-xs font-mono">
              <span className="text-muted-foreground uppercase tracking-widest text-[11px] flex items-center gap-1.5">
                <Sliders className="h-3 w-3 text-primary" /> Grouping Density:
              </span>
              <div className="flex items-center gap-1 bg-black/30 p-0.5 border border-border">
                {(["spacious", "balanced", "dense"] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      setDensity(d);
                      if (plan) handleCurate(style, d);
                    }}
                    className={`px-2.5 py-1 uppercase text-[10px] tracking-wider transition-all ${
                      density === d
                        ? "bg-primary/20 text-primary font-bold border border-primary/30"
                        : "text-foreground/50 hover:text-foreground"
                    }`}
                  >
                    {d === "spacious" ? "Spacious (Solo)" : d === "balanced" ? "Balanced" : "Magazine (Dense)"}
                  </button>
                ))}
              </div>
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
                  The AI Curator evaluates color harmony, burst timestamps, aspect ratios, and visual quality scores to assemble a cohesive exhibition layout.
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
              {/* Curatorial Vision Summary & Rhythm Index */}
              <div className="p-4 bg-primary/5 border border-primary/30 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-[11px] font-mono uppercase tracking-widest text-primary font-bold flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" /> Curatorial Vision & Narrative Arc
                  </span>

                  {/* Rhythm Score Badge */}
                  {plan.rhythm && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/40 border border-primary/30 text-xs font-mono">
                        <span className="text-primary font-bold">{plan.rhythm.score}/100</span>
                        <span className="text-muted-foreground text-[10px] uppercase">Rhythm Score</span>
                      </div>
                      <span className="text-[9px] font-mono uppercase px-2 py-0.5 bg-primary/10 border border-primary/20 text-primary">
                        {plan.rhythm.pacingRating}
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-foreground/90 leading-relaxed font-sans">
                  {plan.curatorialSummary}
                </p>

                {plan.rhythm && (
                  <div className="flex items-center gap-3 pt-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground flex-wrap">
                    <span>Orientation: <strong className="text-foreground/80">{plan.rhythm.orientationBalance}</strong></span>
                    <span>•</span>
                    <span>Palette Flow: <strong className="text-foreground/80">{plan.rhythm.chromaticHarmony}</strong></span>
                    <button
                      type="button"
                      onClick={() => handleCurate()}
                      disabled={loading}
                      className="ml-auto text-[10px] font-mono uppercase text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                    >
                      <Shuffle className="h-3 w-3" /> Re-curate
                    </button>
                  </div>
                )}
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
                    <div className="flex items-center gap-2">
                      {coverPhotoObj?.color_palette && coverPhotoObj.color_palette.length > 0 && (
                        <div className="flex items-center gap-1">
                          {coverPhotoObj.color_palette.slice(0, 4).map((c, i) => (
                            <span key={i} className="w-2.5 h-2.5 rounded-full border border-black/40" style={{ backgroundColor: c }} />
                          ))}
                        </div>
                      )}
                      <span className="text-[10px] font-mono text-primary bg-primary/10 border border-primary/20 px-2 py-0.5">
                        Ratio: {coverPhotoObj?.aspect_ratio || "3:2"}
                      </span>
                    </div>
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
                      <div className="pt-2 border-t border-border/40">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block">
                            Cover Alternatives:
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowAllCoverOptions(!showAllCoverOptions)}
                            className="text-[9px] font-mono uppercase text-primary hover:underline flex items-center gap-0.5"
                          >
                            <span>{showAllCoverOptions ? "Show Less" : "Choose Any Still"}</span>
                            {showAllCoverOptions ? <ChevronUp className="h-2.5 w-2.5" /> : <ChevronDown className="h-2.5 w-2.5" />}
                          </button>
                        </div>

                        {/* Top 3 AI alternative covers */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {plan.alternativeCoverIds && plan.alternativeCoverIds.map((altId) => {
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

                        {/* Expandable all-photos cover tray */}
                        {showAllCoverOptions && (
                          <div className="pt-2 mt-2 border-t border-border/30 max-h-28 overflow-y-auto flex items-center gap-1.5 flex-wrap">
                            {photos.map((p) => {
                              const isSelected = selectedCoverId === p.id;
                              return (
                                <button
                                  key={p.id}
                                  type="button"
                                  onClick={() => setSelectedCoverId(p.id)}
                                  className={`relative w-12 h-9 border transition-all overflow-hidden ${
                                    isSelected
                                      ? "border-primary ring-2 ring-primary/40 scale-105"
                                      : "border-border/60 hover:border-foreground/50 opacity-60 hover:opacity-100"
                                  }`}
                                  title={p.description || "Set as cover"}
                                >
                                  <Image
                                    src={p.url}
                                    alt="Photo still"
                                    fill
                                    sizes="48px"
                                    className="object-cover"
                                  />
                                  {isSelected && (
                                    <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                                      <Check className="h-2.5 w-2.5 text-white" />
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
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
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      First frame seen when visitors enter the exhibition feed.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-border/40 text-[10px] font-mono text-muted-foreground">
                    Index #1 of {plan.layout.length} stills
                  </div>
                </div>
              </div>

              {/* View Switcher: Curated Plan vs Current Layout */}
              <div className="flex items-center justify-between border-b border-border pb-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("curated")}
                    className={`px-3 py-1 text-xs font-mono uppercase tracking-wider border transition-all ${
                      activeTab === "curated"
                        ? "bg-primary text-primary-foreground border-primary font-bold"
                        : "bg-foreground/5 border-border text-foreground/60 hover:text-foreground"
                    }`}
                  >
                    Curated Story Plan ({plan.layout.length} stills)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("current")}
                    className={`px-3 py-1 text-xs font-mono uppercase tracking-wider border transition-all flex items-center gap-1.5 ${
                      activeTab === "current"
                        ? "bg-primary text-primary-foreground border-primary font-bold"
                        : "bg-foreground/5 border-border text-foreground/60 hover:text-foreground"
                    }`}
                  >
                    <ArrowRightLeft className="h-3 w-3" />
                    <span>Compare to Current</span>
                  </button>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Layers className="h-3 w-3 text-primary" />
                    <strong>{groupsCount}</strong> Editorial Rows ({groupedPhotosCount} paired)
                  </span>
                  <span>•</span>
                  <span><strong>{soloPhotosCount}</strong> Solos</span>
                </div>
              </div>

              {/* Visual Sequence Preview Strip */}
              {activeTab === "curated" ? (
                <div className="space-y-2">
                  <div className="p-3 bg-foreground/[0.02] border border-border max-h-60 overflow-y-auto space-y-2">
                    {(() => {
                      const previewBlocks: { type: "single" | "group"; items: CuratedItem[] }[] = [];
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
                          className={`p-2.5 border flex items-center justify-between gap-3 text-xs font-mono transition-all ${
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
                                  ? block.items.length === 3
                                    ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30 font-bold"
                                    : "bg-primary/20 text-primary border-primary/30 font-bold"
                                  : "bg-foreground/5 text-foreground/60 border-border"
                              }`}
                            >
                              {block.type === "group"
                                ? block.items.length === 3
                                  ? "Triptych (3 Paired)"
                                  : "Diptych (2 Paired)"
                                : "Full-Width Solo"}
                            </span>
                            <span className="text-[11px] text-foreground/70 hidden sm:inline max-w-xs truncate">
                              {block.items[0]?.curatorialNote || ""}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {block.items.map((item) => {
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
              ) : (
                /* Current Layout Compare Tab */
                <div className="space-y-2">
                  <div className="p-3 bg-foreground/[0.02] border border-border max-h-60 overflow-y-auto space-y-2">
                    {photos.map((p, idx) => {
                      const isCover = p.url === album.cover_image_url;
                      return (
                        <div
                          key={p.id}
                          className="p-2 border border-border/40 flex items-center justify-between gap-3 text-xs font-mono"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground w-6">#{idx + 1}</span>
                            <span className="text-[9px] uppercase px-1.5 py-0.5 border bg-foreground/5 text-foreground/60 border-border">
                              {p.group_id ? "Grouped" : "Solo"}
                            </span>
                            <span className="text-[11px] text-foreground/70 max-w-sm truncate">
                              {p.description || "Uncaptioned still"}
                            </span>
                          </div>

                          <div
                            className={`relative w-12 h-9 border overflow-hidden ${
                              isCover ? "ring-2 ring-amber-400 border-amber-400" : "border-border"
                            }`}
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
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

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
