"use client";

import React, { useState } from "react";
import { Sparkles, Calendar, MapPin, Loader2, Check, RefreshCw, Wand2 } from "lucide-react";
import { isoToDDMMYYYY } from "@/components/ui/date-selector";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Album } from "@/lib/types";

import { EditAlbumDialog } from "./edit-album-dialog";
import { ThinkingOrb } from "./thinking-orb";

interface AlbumAutoFillToolbarProps {
  album: Album;
  photosCount: number;
  onAlbumUpdated: (updatedAlbum: Album) => void;
}

export function AlbumAutoFillToolbar({
  album,
  photosCount,
  onAlbumUpdated,
}: AlbumAutoFillToolbarProps) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<{
    aiTitle: string | null;
    alternativeTitles: string[];
    earliestDate: string | null;
    autoResolvedLocation: string | null;
  } | null>(null);

  const handleAutoFill = async (forceTitle: boolean = false) => {
    if (photosCount === 0) {
      toast.error("Upload photos first to generate title suggestions and set date!");
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Session expired");
        return;
      }

      const res = await fetch("/api/albums/auto-fill", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          albumId: album.id,
          forceTitleUpdate: forceTitle,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to auto-fill details");

      if (data.album) {
        onAlbumUpdated(data.album);
      }

      setSuggestions({
        aiTitle: data.aiTitle,
        alternativeTitles: data.alternativeTitles || [],
        earliestDate: data.earliestDate,
        autoResolvedLocation: data.autoResolvedLocation,
      });

      toast.success(
        forceTitle
          ? `Generated & applied title: "${data.aiTitle}"`
          : "Photo metadata analyzed! Suggestions ready."
      );
    } catch (err: any) {
      toast.error(err.message || "Auto-fill failed");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyTitle = async (newTitle: string) => {
    try {
      const slug = newTitle
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const { data, error } = await supabase
        .from("albums")
        .update({ title: newTitle, slug })
        .eq("id", album.id)
        .select()
        .single();

      if (error) throw error;
      toast.success(`Album renamed to "${newTitle}"`);
      onAlbumUpdated(data as Album);
    } catch (err: any) {
      toast.error(`Failed to apply title: ${err.message}`);
    }
  };

  const isUntitled =
    !album.title ||
    album.title.toLowerCase().startsWith("untitled") ||
    album.title.toLowerCase().startsWith("draft album");

  return (
    <div className="space-y-3">
      {/* Action Bar */}
      <div className="relative overflow-hidden p-5 bg-card border border-border flex flex-wrap items-center justify-between gap-4">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-64 h-full bg-primary/5 blur-2xl pointer-events-none" />

        <div className="flex items-center gap-3.5 z-10">
          <ThinkingOrb
            state={loading ? "ai-analyzing" : isUntitled ? "idle" : "success"}
            size="md"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-base text-white">
                {album.title}
              </span>
              {isUntitled && (
                <span className="text-[9px] font-mono bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 uppercase tracking-widest flex items-center gap-1">
                  <Wand2 className="h-3 w-3" /> Auto-Fill Ready
                </span>
              )}
            </div>
            <p className="text-[11px] text-white/50 font-mono mt-0.5">
              {photosCount === 0
                ? "Upload photos below to auto-detect earliest creation date, location, and AI title."
                : `Collection contains ${photosCount} photo${photosCount > 1 ? "s" : ""}. Run AI engine for auto-tagging and suggestions.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 z-10">
          <EditAlbumDialog
            album={album}
            onAlbumUpdated={onAlbumUpdated}
          />

          <Button
            size="sm"
            onClick={() => handleAutoFill(true)}
            disabled={loading || photosCount === 0}
            className="bg-primary/20 text-primary border border-primary/40 hover:bg-primary/30 rounded-none font-mono text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all"
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            {isUntitled ? "Auto-Fill from Photos" : "Generate AI Titles"}
          </Button>
        </div>
      </div>

      {/* Suggested Titles Palette (if generated) */}
      {suggestions && (
        <div className="p-4 bg-card border border-primary/30 space-y-3 font-sans transition-all">
          <div className="flex items-center justify-between text-xs text-primary font-mono uppercase tracking-wider">
            <span className="flex items-center gap-2">
              <span>AI Suggested Album Titles</span>
            </span>
            {suggestions.earliestDate && (
              <span className="flex items-center gap-1.5 text-white/60 text-[10px]">
                <Calendar className="h-3 w-3 text-primary" /> Earliest Photo: {isoToDDMMYYYY(suggestions.earliestDate)}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {suggestions.aiTitle && (
              <button
                type="button"
                onClick={() => handleApplyTitle(suggestions.aiTitle!)}
                className={`px-3 py-1.5 text-xs border font-medium flex items-center gap-2 transition-all ${
                  album.title === suggestions.aiTitle
                    ? "bg-primary text-white border-primary font-bold"
                    : "bg-white/5 border-white/20 text-white hover:bg-primary/20 hover:border-primary"
                }`}
              >
                {album.title === suggestions.aiTitle && <Check className="h-3 w-3" />}
                <span>{suggestions.aiTitle}</span>
                <span className="text-[9px] opacity-60 font-mono uppercase">(Recommended)</span>
              </button>
            )}

            {suggestions.alternativeTitles.map((alt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyTitle(alt)}
                className={`px-3 py-1.5 text-xs border font-medium flex items-center gap-2 transition-all ${
                  album.title === alt
                    ? "bg-primary text-white border-primary font-bold"
                    : "bg-white/5 border-white/20 text-white/80 hover:bg-white/10 hover:text-white hover:border-white/40"
                }`}
              >
                {album.title === alt && <Check className="h-3 w-3" />}
                <span>{alt}</span>
              </button>
            ))}
          </div>

          {suggestions.autoResolvedLocation && !album.location && (
            <div className="text-[11px] font-mono text-white/50 flex items-center gap-1.5 pt-2 border-t border-white/5">
              <MapPin className="h-3 w-3 text-primary" />
              Auto Detected Location: {suggestions.autoResolvedLocation}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
