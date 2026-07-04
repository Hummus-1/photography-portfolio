"use client";

import React from "react";
import { FolderOpen, Loader2, MapPin, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Album } from "@/lib/types";

interface AlbumSidebarProps {
  albums: Album[];
  selectedAlbumId: string;
  onSelectAlbum: (id: string) => void;
  albumLoading: boolean;
  onPublishToggle: (albumId: string, isPublished: boolean) => void;
  onDeleteAlbum: (albumId: string) => void;
}

export function AlbumSidebar({
  albums,
  selectedAlbumId,
  onSelectAlbum,
  albumLoading,
  onPublishToggle,
  onDeleteAlbum,
}: AlbumSidebarProps) {
  return (
    <div className="space-y-6 lg:col-span-1 border-r border-white/10 pr-6 lg:pr-12">
      <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-white/40 mb-6">
        <FolderOpen className="h-4 w-4" />
        <span>Select Album</span>
      </div>

      {albumLoading ? (
        <div className="flex py-10 justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-white/50" />
        </div>
      ) : albums.length === 0 ? (
        <p className="text-sm text-white/40 italic">No albums created yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {albums.map((album) => {
            const isSelected = album.id === selectedAlbumId;
            return (
              <div
                key={album.id}
                className={`relative p-4 flex flex-col items-start text-left transition-all duration-300 border ${
                  isSelected
                    ? "bg-white/5 border-white/20 text-[#e8e5f0]"
                    : "border-transparent text-white/60 hover:text-white hover:bg-white/5"
                }`}
                onClick={() => onSelectAlbum(album.id)}
              >
                <div className="flex w-full items-center justify-between gap-3 mb-2">
                  <h4 className="font-serif font-bold text-sm tracking-wide truncate">
                    {album.title}
                  </h4>
                  {!album.is_published && (
                    <span className="text-[8px] font-mono tracking-widest bg-white/10 text-white/60 px-1.5 py-0.5 uppercase">
                      Draft
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-white/40 uppercase">
                  <MapPin className="h-3 w-3" />
                  <span>{album.location}</span>
                </div>

                <div className="w-full flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                  {/* Publish Switcher */}
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <Switch
                      id={`pub-${album.id}`}
                      checked={album.is_published}
                      onCheckedChange={(checked) => onPublishToggle(album.id, checked)}
                      className="scale-75"
                    />
                    <Label htmlFor={`pub-${album.id}`} className="text-[9px] font-mono uppercase tracking-widest text-white/50">
                      Published
                    </Label>
                  </div>

                  {/* Delete album */}
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
            );
          })}
        </div>
      )}
    </div>
  );
}
