"use client";

import React, { useState } from "react";
import { Plus, Sparkles, FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Album } from "@/lib/types";
import { LocationSelector } from "./location-selector";
import { ThinkingOrb } from "./thinking-orb";
import { DateSelector } from "@/components/ui/date-selector";

interface CreateAlbumDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAlbumCreated: (album: Album) => void;
}

export function CreateAlbumDialog({
  isOpen,
  onOpenChange,
  onAlbumCreated,
}: CreateAlbumDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [locationId, setLocationId] = useState<string | null>(null);
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    const finalTitle = title.trim() || "Untitled Album";
    const finalDate = date.trim() ? date.trim() : null;
    
    let slug = finalTitle
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (!slug || slug === "untitled-album") {
      slug = `untitled-album-${Math.random().toString(36).substring(2, 9)}`;
    }

    try {
      const { data, error } = await supabase
        .from("albums")
        .insert({
          title: finalTitle,
          slug,
          description,
          location: location || null,
          location_id: locationId || null,
          date: finalDate,
          is_published: false,
        })
        .select()
        .single();

      if (error) throw error;
      
      if (!title || !locationId || !date) {
        toast.success("Album created! Upload photos to auto-fill title, date, and location.");
      } else {
        toast.success("Album created successfully");
      }

      onAlbumCreated(data as Album);
      onOpenChange(false);

      // Reset form
      setTitle("");
      setDescription("");
      setLocation("");
      setLocationId(null);
      setDate("");
    } catch (err: any) {
      toast.error(err.message || "Failed to create album");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger render={
        <Button className="bg-[#e8e5f0] text-[#0E1012] hover:bg-[#d4d0de] rounded-none px-5 py-2.5 font-bold text-xs uppercase tracking-widest flex items-center gap-2 cursor-pointer shadow-md">
          <Plus className="h-4 w-4" />
          Create Album
        </Button>
      } />
      <DialogContent
        data-lenis-prevent
        className="bg-[#121519]/95 backdrop-blur-2xl border-white/15 text-white rounded-none max-w-2xl md:max-w-3xl w-full max-h-[85vh] flex flex-col p-0 overflow-hidden shadow-2xl"
      >
        {/* Static Header */}
        <DialogHeader className="shrink-0 p-6 sm:p-8 border-b border-white/10 space-y-1.5 relative pr-12">
          <DialogTitle className="font-serif text-2xl font-bold uppercase tracking-wider flex items-center gap-2 text-white">
            <FolderPlus className="h-5 w-5 text-film-amber" /> New Album Collection
          </DialogTitle>
          <DialogDescription className="text-white/60 text-xs font-mono">
            Initialize a new photography album container. Leave title, date, or location empty for AI auto-fill.
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Inner Body */}
        <div data-lenis-prevent className="flex-1 overflow-y-auto overflow-x-hidden p-6 sm:p-8 space-y-6">
          <div className="bg-film-amber/10 border border-film-amber/20 p-3.5 text-xs text-film-amber flex items-start gap-3 font-mono">
            <ThinkingOrb state="idle" size="sm" className="mt-0.5 shrink-0" />
            <span>
              <strong className="font-bold">AI Auto-Fill Enabled:</strong> Once photos are uploaded, AI Workers will parse camera EXIF dates, detect GPS coordinates, and suggest collection titles automatically.
            </span>
          </div>

          <form id="create-album-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Title & Date Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label htmlFor="title" className="font-mono text-[10px] uppercase tracking-widest text-white/70">
                  Album Title <span className="text-white/40 font-normal">(Optional)</span>
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Iceland Glaciers (Leave blank to auto-generate)"
                  className="bg-white/5 border-white/15 rounded-none text-white focus-visible:ring-film-amber font-mono text-xs h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="date" className="font-mono text-[10px] uppercase tracking-widest text-white/70">
                  Date <span className="text-white/40 font-normal">(Optional - auto-detects from earliest photo)</span>
                </Label>
                <DateSelector
                  id="date"
                  value={date}
                  onChange={(isoVal) => setDate(isoVal)}
                  placeholder="DD/MM/YYYY (Leave empty to auto-detect)"
                  className="rounded-none"
                />
              </div>
            </div>

            {/* Location Hierarchy */}
            <div className="space-y-1.5 border-t border-white/10 pt-4">
              <Label className="font-mono text-[10px] uppercase tracking-widest text-white/70 block mb-1">
                Location Hierarchy <span className="text-white/40 font-normal">(Optional)</span>
              </Label>
              <LocationSelector
                selectedLocationId={locationId}
                onSelectLocation={(id, fullName) => {
                  setLocationId(id);
                  setLocation(fullName);
                }}
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="description" className="font-mono text-[10px] uppercase tracking-widest text-white/70">
                Description <span className="text-white/40 font-normal">(Optional)</span>
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe this photo collection..."
                rows={3}
                className="bg-white/5 border-white/15 rounded-none text-white focus-visible:ring-film-amber resize-none text-xs"
              />
            </div>
          </form>
        </div>

        {/* Static Footer Actions */}
        <div className="shrink-0 p-4 sm:p-6 border-t border-white/10 bg-[#0E1012] flex justify-end gap-3">
          <DialogClose render={
            <Button type="button" variant="outline" className="border-white/15 text-white rounded-none hover:bg-white/5 font-mono uppercase tracking-wider text-xs px-5 py-2">
              Cancel
            </Button>
          } />
          <Button form="create-album-form" type="submit" disabled={loading} className="bg-[#e8e5f0] text-[#0E1012] hover:bg-[#d4d0de] rounded-none font-bold uppercase tracking-wider text-xs px-6 py-2 flex items-center gap-2 cursor-pointer shadow-md">
            {loading ? <ThinkingOrb state="thinking" size="sm" /> : null}
            <span>{loading ? "Creating..." : "Create Album"}</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
