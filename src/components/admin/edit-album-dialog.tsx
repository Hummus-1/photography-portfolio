"use client";

import React, { useState, useEffect } from "react";
import { Edit, MapPin, Tag, Star, Calendar, Globe, Sliders } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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

interface EditAlbumDialogProps {
  album: Album;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onAlbumUpdated: (album: Album) => void;
}

export function EditAlbumDialog({
  album,
  isOpen: externalIsOpen,
  onOpenChange: externalOnOpenChange,
  onAlbumUpdated,
}: EditAlbumDialogProps) {
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

  const [title, setTitle] = useState(album.title || "");
  const [slug, setSlug] = useState(album.slug || "");
  const [description, setDescription] = useState(album.description || "");
  const [location, setLocation] = useState(album.location || "");
  const [locationId, setLocationId] = useState<string | null>(album.location_id || null);
  const [date, setDate] = useState(album.date || "");
  const [tags, setTags] = useState<string>(album.tags ? album.tags.join(", ") : "");
  const [score, setScore] = useState<string>(album.score !== undefined && album.score !== null ? String(album.score) : "");
  const [isPublished, setIsPublished] = useState<boolean>(album.is_published || false);
  const [isFeatured, setIsFeatured] = useState<boolean>(album.is_featured || false);
  const [loading, setLoading] = useState(false);

  // Sync state when album changes
  useEffect(() => {
    setTitle(album.title || "");
    setSlug(album.slug || "");
    setDescription(album.description || "");
    setLocation(album.location || "");
    setLocationId(album.location_id || null);
    setDate(album.date || "");
    setTags(album.tags ? album.tags.join(", ") : "");
    setScore(album.score !== undefined && album.score !== null ? String(album.score) : "");
    setIsPublished(album.is_published || false);
    setIsFeatured(album.is_featured || false);
  }, [album]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const parsedScore = score.trim() === "" ? null : parseFloat(score);
    if (parsedScore !== null && (isNaN(parsedScore) || parsedScore < 0 || parsedScore > 10)) {
      toast.error("Score must be a number between 0 and 10");
      setLoading(false);
      return;
    }

    const tagsArray = tags
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    let finalSlug = slug.trim();
    if (!finalSlug) {
      finalSlug = title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
    }

    try {
      // 1. Update albums table
      const { error: updateError } = await supabase
        .from("albums")
        .update({
          title,
          slug: finalSlug,
          description,
          location: location || null,
          location_id: locationId || null,
          date,
          tags: tagsArray,
          score: parsedScore,
          is_published: isPublished,
          is_featured: isFeatured,
        })
        .eq("id", album.id);

      if (updateError) throw updateError;

      // 2. Fetch updated album with computed location_path from albums_with_locations view
      const { data: updatedViewData, error: viewError } = await supabase
        .from("albums_with_locations")
        .select("*")
        .eq("id", album.id)
        .single();

      if (viewError) throw viewError;

      toast.success("Album details updated successfully!");
      onAlbumUpdated(updatedViewData as Album);
      setIsOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update album details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {!isControlled && (
        <DialogTrigger render={
          <Button
            variant="outline"
            size="sm"
            className="border-white/10 text-white hover:bg-white/5 rounded-none font-mono text-xs uppercase tracking-wider flex items-center gap-1.5"
          >
            <Edit className="h-3.5 w-3.5" />
            Edit All Album Details
          </Button>
        } />
      )}
      <DialogContent className="bg-[#14171a] border-white/10 text-white rounded-none max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl font-bold uppercase tracking-wider flex items-center gap-2">
            <Sliders className="h-5 w-5 text-amber-400" />
            Edit Album Details & Settings
          </DialogTitle>
          <DialogDescription className="text-white/60 text-xs">
            Edit title, URL slug, date, location hierarchy, description, tags, rating score, and visibility settings.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* Title and Slug */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-title" className="font-mono text-[10px] uppercase tracking-widest text-white/70">
                Album Title
              </Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Album Title"
                className="bg-black/20 border-white/10 rounded-none text-white focus-visible:ring-white"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-slug" className="font-mono text-[10px] uppercase tracking-widest text-white/70">
                URL Slug
              </Label>
              <Input
                id="edit-slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. visit-greenland"
                className="bg-black/20 border-white/10 rounded-none text-white focus-visible:ring-white font-mono text-xs"
              />
            </div>
          </div>

          {/* Date & Score */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-date" className="font-mono text-[10px] uppercase tracking-widest text-white/70 flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Date
              </Label>
              <Input
                id="edit-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-black/20 border-white/10 rounded-none text-white focus-visible:ring-white"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-score" className="font-mono text-[10px] uppercase tracking-widest text-white/70 flex items-center gap-1">
                <Star className="h-3 w-3 text-amber-400" /> Album Rating Score (0 - 10)
              </Label>
              <Input
                id="edit-score"
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="e.g. 9.2"
                className="bg-black/20 border-white/10 rounded-none text-white focus-visible:ring-white font-mono text-xs"
              />
            </div>
          </div>

          {/* Hierarchical Location Selector */}
          <div className="space-y-1.5 border-t border-white/10 pt-4">
            <Label className="font-mono text-[10px] uppercase tracking-widest text-white/70 flex items-center gap-1 mb-1">
              <MapPin className="h-3 w-3 text-amber-400" /> Location Hierarchy Selection
            </Label>
            <LocationSelector
              selectedLocationId={locationId}
              onSelectLocation={(id, fullName) => {
                setLocationId(id);
                setLocation(fullName);
              }}
            />
          </div>

          {/* Custom Tags */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-tags" className="font-mono text-[10px] uppercase tracking-widest text-white/70 flex items-center gap-1">
              <Tag className="h-3 w-3" /> Album Hashtags (comma separated)
            </Label>
            <Input
              id="edit-tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. nature, winter, glaciers, arctic"
              className="bg-black/20 border-white/10 rounded-none text-white focus-visible:ring-white font-mono text-xs"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-description" className="font-mono text-[10px] uppercase tracking-widest text-white/70">
              Album Description
            </Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this photo collection..."
              rows={3}
              className="bg-black/20 border-white/10 rounded-none text-white focus-visible:ring-white resize-none"
            />
          </div>

          {/* Visibility Controls */}
          <div className="p-4 bg-white/5 border border-white/10 flex items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Switch
                id="edit-published"
                checked={isPublished}
                onCheckedChange={setIsPublished}
              />
              <Label htmlFor="edit-published" className="font-mono text-xs uppercase tracking-wider text-white">
                Publicly Published
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="edit-featured"
                checked={isFeatured}
                onCheckedChange={setIsFeatured}
              />
              <Label htmlFor="edit-featured" className="font-mono text-xs uppercase tracking-wider text-amber-300">
                ★ Featured on Homepage
              </Label>
            </div>
          </div>

          {/* Submit buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <DialogClose render={
              <Button type="button" variant="outline" className="border-white/10 text-white rounded-none hover:bg-white/5 font-mono uppercase tracking-wider text-xs">
                Cancel
              </Button>
            } />
            <Button type="submit" disabled={loading} className="bg-[#e8e5f0] text-[#0E1012] hover:bg-[#d4d0de] rounded-none font-bold uppercase tracking-wider text-xs">
              {loading ? "Saving..." : "Save Album Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
