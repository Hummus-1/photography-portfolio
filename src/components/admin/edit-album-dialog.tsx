"use client";

import React, { useState, useEffect } from "react";
import { Edit, MapPin, Tag, Calendar, Globe, Sliders, Eye, Palette, RotateCcw } from "lucide-react";
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
import { ThinkingOrb } from "./thinking-orb";
import { DateSelector } from "@/components/ui/date-selector";

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
  const [customHeroColor, setCustomHeroColor] = useState<string>(album.custom_hero_color || "");
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
    setCustomHeroColor(album.custom_hero_color || "");
    setIsPublished(album.is_published || false);
    setIsFeatured(album.is_featured || false);
  }, [album]);

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    setSlug(generateSlug(newTitle));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const tagsArray = tags
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    let finalSlug = slug.trim();
    if (!finalSlug) {
      finalSlug = generateSlug(title);
    }

    try {
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
          custom_hero_color: customHeroColor.trim() || null,
          is_published: isPublished,
          is_featured: isFeatured,
        })
        .eq("id", album.id);

      if (updateError) throw updateError;

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
            className="border-white/15 text-white hover:bg-white/10 rounded-none font-mono text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Edit className="h-3.5 w-3.5" />
            Edit Settings
          </Button>
        } />
      )}
      <DialogContent
        data-lenis-prevent
        className="bg-[#121519]/95 backdrop-blur-2xl border-white/15 text-white rounded-none max-w-3xl w-full max-h-[85vh] flex flex-col p-0 overflow-hidden shadow-2xl"
      >
        {/* Static Header */}
        <DialogHeader className="shrink-0 p-6 sm:p-8 border-b border-white/10 relative pr-12">
          <DialogTitle className="font-serif text-xl font-bold uppercase tracking-wider flex items-center gap-2 text-white">
            <Sliders className="h-5 w-5 text-film-amber" />
            Edit Collection Metadata
          </DialogTitle>
          <DialogDescription className="text-white/60 text-xs font-mono">
            Configure title, URL slug, date, location hierarchy, tags, and visibility settings.
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Inner Body */}
        <div data-lenis-prevent className="flex-1 overflow-y-auto overflow-x-hidden p-6 sm:p-8 space-y-6">
          <form id="edit-album-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Title and Slug */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-title" className="font-mono text-[10px] uppercase tracking-widest text-white/70">
                  Album Title
                </Label>
                <Input
                  id="edit-title"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Album Title"
                  className="bg-white/5 border-white/15 rounded-none text-white focus-visible:ring-film-amber font-mono text-xs"
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
                  className="bg-white/5 border-white/15 rounded-none text-white focus-visible:ring-film-amber font-mono text-xs"
                />
              </div>
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-date" className="font-mono text-[10px] uppercase tracking-widest text-white/70 flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Date
              </Label>
              <DateSelector
                id="edit-date"
                value={date}
                onChange={(isoVal) => setDate(isoVal)}
                className="rounded-none"
                required
              />
            </div>

            {/* Hierarchical Location Selector */}
            <div className="space-y-1.5 border-t border-white/10 pt-4">
              <Label className="font-mono text-[10px] uppercase tracking-widest text-white/70 flex items-center gap-1 mb-1">
                <MapPin className="h-3 w-3 text-film-amber" /> Location Hierarchy Selection
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
                <Tag className="h-3 w-3 text-film-amber" /> Album Hashtags (comma separated)
              </Label>
              <Input
                id="edit-tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g. nature, winter, glaciers, arctic"
                className="bg-white/5 border-white/15 rounded-none text-white focus-visible:ring-film-amber font-mono text-xs"
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
                className="bg-white/5 border-white/15 rounded-none text-white focus-visible:ring-film-amber resize-none text-xs"
              />
            </div>

            {/* Custom Hero Color Override */}
            <div className="space-y-2 border-t border-white/10 pt-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="edit-hero-color" className="font-mono text-[10px] uppercase tracking-widest text-white/70 flex items-center gap-1.5">
                  <Palette className="h-3.5 w-3.5 text-film-amber" /> Hero Accent Color (Custom Override)
                </Label>
                {customHeroColor && (
                  <button
                    type="button"
                    onClick={() => setCustomHeroColor("")}
                    className="text-[10px] font-mono text-film-amber hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="h-2.5 w-2.5" /> Reset to Auto
                  </button>
                )}
              </div>

              {/* Swatch Pickers if cover_color_palette available */}
              {album.cover_color_palette && album.cover_color_palette.length > 0 && (
                <div className="flex items-center gap-2 pb-1">
                  <span className="text-[10px] font-mono text-white/50">Palette Swatches:</span>
                  <div className="flex items-center gap-1.5">
                    {album.cover_color_palette.map((colorHex, idx) => (
                      <button
                        key={`swatch-${idx}-${colorHex}`}
                        type="button"
                        onClick={() => setCustomHeroColor(colorHex)}
                        style={{ backgroundColor: colorHex }}
                        className={`w-5 h-5 rounded-full border cursor-pointer transition-transform hover:scale-110 ${
                          customHeroColor.toLowerCase() === colorHex.toLowerCase() ? "border-white ring-2 ring-film-amber scale-110" : "border-white/20 opacity-80 hover:opacity-100"
                        }`}
                        title={`Select swatch ${colorHex}`}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <input
                  type="color"
                  id="edit-hero-color-picker"
                  value={customHeroColor || "#D96B27"}
                  onChange={(e) => setCustomHeroColor(e.target.value)}
                  className="w-9 h-9 p-0.5 rounded bg-white/5 border border-white/20 cursor-pointer"
                />
                <Input
                  id="edit-hero-color"
                  value={customHeroColor}
                  onChange={(e) => setCustomHeroColor(e.target.value)}
                  placeholder="Auto-extracted from cover photo"
                  className="bg-white/5 border-white/15 rounded-none text-white focus-visible:ring-film-amber font-mono text-xs max-w-xs"
                />
              </div>
            </div>

            {/* Visibility Controls */}
            <div className="p-4 bg-white/[0.03] border border-white/10 flex items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  id="edit-published"
                  checked={isPublished}
                  onCheckedChange={setIsPublished}
                />
                <Label htmlFor="edit-published" className="font-mono text-xs uppercase tracking-wider text-white cursor-pointer">
                  Publicly Published
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="edit-featured"
                  checked={isFeatured}
                  onCheckedChange={setIsFeatured}
                />
                <Label htmlFor="edit-featured" className="font-mono text-xs uppercase tracking-wider text-film-amber cursor-pointer">
                  ★ Featured on Homepage
                </Label>
              </div>
            </div>
          </form>
        </div>

        {/* Static Footer Actions */}
        <div className="shrink-0 p-4 sm:p-6 border-t border-white/10 bg-[#0E1012] flex justify-between items-center">
          <a
            href={`/album/${album.slug}?preview=true`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-film-amber/10 hover:bg-film-amber/20 border border-film-amber/30 text-film-amber font-mono text-xs uppercase tracking-wider transition-all"
          >
            <Eye className="h-3.5 w-3.5" />
            Preview Album
          </a>

          <div className="flex gap-3">
            <DialogClose render={
              <Button type="button" variant="outline" className="border-white/15 text-white rounded-none hover:bg-white/5 font-mono uppercase tracking-wider text-xs">
                Cancel
              </Button>
            } />
            <Button form="edit-album-form" type="submit" disabled={loading} className="bg-[#e8e5f0] text-[#0E1012] hover:bg-[#d4d0de] rounded-none font-bold uppercase tracking-wider text-xs flex items-center gap-2">
              {loading ? <ThinkingOrb state="thinking" size="sm" /> : null}
              <span>{loading ? "Saving..." : "Save Changes"}</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
