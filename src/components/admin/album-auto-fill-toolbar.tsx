"use client";

import React, { useState } from "react";
import { Sparkles, Calendar, MapPin, Loader2, Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Album } from "@/lib/types";

import { EditAlbumDialog } from "./edit-album-dialog";

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
      {/* Action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white/5 border border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 border border-amber-500/20 text-amber-300">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-sm text-white">
                {album.title}
              </span>
              {isUntitled && (
                <span className="text-[9px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 uppercase tracking-widest">
                  Needs Title & Details
                </span>
              )}
            </div>
            <p className="text-[11px] text-white/50 font-mono mt-0.5">
              {photosCount === 0
                ? "Upload photos below to auto-detect earliest creation date, location, and AI title."
                : `Album has ${photosCount} photo${photosCount > 1 ? "s" : ""}. Click to run AI auto-fill.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <EditAlbumDialog
            album={album}
            onAlbumUpdated={onAlbumUpdated}
          />

          <Button
            size="sm"
            onClick={() => handleAutoFill(true)}
            disabled={loading || photosCount === 0}
            className="bg-amber-500/20 text-amber-200 border border-amber-500/30 hover:bg-amber-500/30 rounded-none font-mono text-xs uppercase tracking-wider flex items-center gap-1.5"
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            {isUntitled ? "Auto-Fill from Photos" : "Generate Title Suggestions"}
          </Button>
        </div>
      </div>

      {/* Suggested Titles Palette (if generated) */}
      {suggestions && (
        <div className="p-4 bg-[#14171a] border border-amber-500/20 space-y-3 font-sans">
          <div className="flex items-center justify-between text-xs text-amber-300 font-mono uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              AI Suggested Album Titles
            </span>
            {suggestions.earliestDate && (
              <span className="flex items-center gap-1 text-[#e8e5f0]/60 text-[10px]">
                <Calendar className="h-3 w-3" /> Earliest photo: {suggestions.earliestDate}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {suggestions.aiTitle && (
              <button
                type="button"
                onClick={() => handleApplyTitle(suggestions.aiTitle!)}
                className={`px-3 py-1.5 text-xs border font-medium flex items-center gap-1.5 transition-all ${
                  album.title === suggestions.aiTitle
                    ? "bg-amber-500 text-black border-amber-400 font-bold"
                    : "bg-white/5 border-white/20 text-white hover:bg-amber-500/20 hover:border-amber-400"
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
                className={`px-3 py-1.5 text-xs border font-medium flex items-center gap-1.5 transition-all ${
                  album.title === alt
                    ? "bg-amber-500 text-black border-amber-400 font-bold"
                    : "bg-white/5 border-white/20 text-white/80 hover:bg-white/10 hover:text-white hover:border-white/40"
                }`}
              >
                {album.title === alt && <Check className="h-3 w-3" />}
                <span>{alt}</span>
              </button>
            ))}
          </div>

          {suggestions.autoResolvedLocation && !album.location && (
            <div className="text-[11px] font-mono text-white/50 flex items-center gap-1 pt-1 border-t border-white/5">
              <MapPin className="h-3 w-3 text-amber-400" />
              Detected Location: {suggestions.autoResolvedLocation}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
