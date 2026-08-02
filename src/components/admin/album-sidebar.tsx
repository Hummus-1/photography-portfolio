"use client";

import React, { useState, useMemo } from "react";
import { FolderOpen, Loader2, MapPin, Trash2, Eye, Search, Sparkles, SlidersHorizontal } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Album } from "@/lib/types";
import { ThinkingOrb } from "./thinking-orb";

interface AlbumSidebarProps {
  albums: Album[];
  selectedAlbumId: string;
  onSelectAlbum: (id: string) => void;
  albumLoading: boolean;
  onPublishToggle: (albumId: string, isPublished: boolean) => void;
  onFeaturedToggle: (albumId: string, isFeatured: boolean) => void;
  onDeleteAlbum: (albumId: string) => void;
}

export function AlbumSidebar({
  albums,
  selectedAlbumId,
  onSelectAlbum,
  albumLoading,
  onPublishToggle,
  onFeaturedToggle,
  onDeleteAlbum,
}: AlbumSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "public" | "draft" | "featured">("all");

  const filteredAlbums = useMemo(() => {
    return albums.filter((album) => {
      // Search filter
      const matchesSearch =
        album.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (album.location && album.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (album.description && album.description.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      // Status filter tab
      if (filterTab === "public") return album.is_published;
      if (filterTab === "draft") return !album.is_published;
      if (filterTab === "featured") return album.is_featured;
      return true;
    });
  }, [albums, searchQuery, filterTab]);

  const counts = useMemo(() => {
    return {
      all: albums.length,
      public: albums.filter((a) => a.is_published).length,
      draft: albums.filter((a) => !a.is_published).length,
      featured: albums.filter((a) => a.is_featured).length,
    };
  }, [albums]);

  return (
    <div className="space-y-5 lg:col-span-1 border-r border-white/10 pr-0 lg:pr-8 lg:sticky lg:top-24 lg:max-h-[calc(100vh-120px)] lg:flex lg:flex-col">
      {/* Sidebar Header & Live Status */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <ThinkingOrb state={albumLoading ? "thinking" : "idle"} size="sm" />
          <span className="font-serif font-bold text-sm tracking-wide text-white">Collections</span>
        </div>
        <span className="font-mono text-[10px] bg-white/10 px-2 py-0.5 text-white/60 uppercase tracking-widest rounded-full">
          {filteredAlbums.length} of {albums.length}
        </span>
      </div>

      {/* Search Input */}
      <div className="relative shrink-0">
        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-white/40" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter albums or locations..."
          className="w-full bg-white/5 border border-white/10 text-xs font-mono text-white placeholder-white/40 pl-9 pr-3 py-2 rounded-none focus:outline-none focus:border-film-amber/50 transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-2.5 top-2.5 text-[10px] font-mono text-white/40 hover:text-white"
          >
            CLEAR
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-black/40 border border-white/10 shrink-0">
        {(["all", "public", "draft", "featured"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterTab(tab)}
            className={`py-1 text-[9px] font-mono uppercase tracking-widest transition-all ${
              filterTab === tab
                ? "bg-film-amber/20 text-film-amber border border-film-amber/40 font-bold"
                : "text-white/40 hover:text-white hover:bg-white/5 border border-transparent"
            }`}
          >
            {tab} ({counts[tab]})
          </button>
        ))}
      </div>

      {/* Album Cards List (Independent scroll container with data-lenis-prevent) */}
      {albumLoading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 shrink-0">
          <ThinkingOrb state="thinking" size="lg" label="Loading Albums" sublabel="Fetching collections" />
        </div>
      ) : filteredAlbums.length === 0 ? (
        <div className="p-6 text-center border border-dashed border-white/10 bg-white/5 space-y-2 shrink-0">
          <FolderOpen className="h-8 w-8 text-white/20 mx-auto" />
          <p className="text-xs font-serif text-white/50">No albums match criteria.</p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-[10px] font-mono text-film-amber hover:underline uppercase"
            >
              Reset Search Filter
            </button>
          )}
        </div>
      ) : (
        <div
          data-lenis-prevent
          className="flex flex-col gap-3 overflow-y-auto pr-1.5 flex-1 min-h-0"
        >
          {filteredAlbums.map((album) => {
            const isSelected = album.id === selectedAlbumId;
            return (
              <div
                key={album.id}
                onClick={() => onSelectAlbum(album.id)}
                className={`group relative p-4 flex flex-col items-start text-left transition-all duration-300 cursor-pointer border shrink-0 ${
                  isSelected
                    ? "bg-gradient-to-r from-film-amber/10 via-white/5 to-white/5 border-film-amber/50 shadow-[0_0_20px_rgba(230,126,58,0.15)]"
                    : "bg-white/[0.02] border-white/10 hover:border-white/25 hover:bg-white/[0.05]"
                }`}
              >
                {/* Active Indicator Bar */}
                {isSelected && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-film-amber shadow-[0_0_8px_#e67e3a]" />
                )}

                <div className="flex w-full items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <ThinkingOrb
                      state={isSelected ? "idle" : "success"}
                      size="sm"
                    />
                    <h4 className="font-serif font-bold text-sm tracking-wide truncate text-white">
                      {album.title}
                    </h4>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {album.is_featured && (
                      <span className="text-[8px] font-mono tracking-widest bg-film-amber/20 text-film-amber border border-film-amber/30 px-1.5 py-0.5 uppercase">
                        ★ Featured
                      </span>
                    )}
                    {!album.is_published && (
                      <span className="text-[8px] font-mono tracking-widest bg-white/10 text-white/60 px-1.5 py-0.5 uppercase">
                        Draft
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] font-mono text-white/40 uppercase flex-wrap">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-film-amber" />
                    {album.location_path && album.location_path.length > 0
                      ? album.location_path[album.location_path.length - 1].name
                      : album.location || "Location pending"}
                  </span>
                  {album.date && (
                    <>
                      <span>•</span>
                      <span>{album.date}</span>
                    </>
                  )}
                </div>

                {/* Inline Toggle Action Bar */}
                <div className="w-full flex items-center justify-between mt-3 pt-2.5 border-t border-white/5 gap-2 flex-wrap">
                  <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <Switch
                        id={`pub-${album.id}`}
                        checked={album.is_published}
                        onCheckedChange={(checked) => onPublishToggle(album.id, checked)}
                        className="scale-75"
                      />
                      <Label htmlFor={`pub-${album.id}`} className="text-[9px] font-mono uppercase tracking-widest text-white/50 cursor-pointer">
                        Public
                      </Label>
                    </div>

                    <div className="flex items-center gap-1">
                      <Switch
                        id={`feat-${album.id}`}
                        checked={album.is_featured || false}
                        onCheckedChange={(checked) => onFeaturedToggle(album.id, checked)}
                        className="scale-75"
                      />
                      <Label htmlFor={`feat-${album.id}`} className="text-[9px] font-mono uppercase tracking-widest text-film-amber/90 cursor-pointer">
                        Featured
                      </Label>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <a
                      href={`/album/${album.slug}?preview=true`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-white/40 hover:text-film-amber p-1 transition-colors"
                      title="Preview Album"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </a>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteAlbum(album.id);
                      }}
                      className="text-white/40 hover:text-red-400 p-1 transition-colors"
                      title="Delete Album"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
