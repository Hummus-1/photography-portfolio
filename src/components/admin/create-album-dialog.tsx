"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
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
    const finalDate = date || new Date().toISOString().split("T")[0];
    
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
        <Button className="bg-[#e8e5f0] text-[#0E1012] hover:bg-[#d4d0de] rounded-none px-5 py-2.5 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Album
        </Button>
      } />
      <DialogContent className="bg-[#14171a] border-white/10 text-white rounded-none max-w-11/12 w-fit">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl font-bold uppercase tracking-wider">
            New Photo Album
          </DialogTitle>
          <DialogDescription className="text-white/60 text-xs">
            Create an album container. You can leave fields empty to auto-fill title, location, and date when photos are uploaded.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-200/90 flex items-start gap-2.5 rounded-none mt-2 font-mono">
          <span className="text-base leading-none">✨</span>
          <span>
            <strong>Auto-fill feature:</strong> Leave title or location blank. Once you upload photos, AI will generate title suggestions and fill the date based on the earliest photo creation time.
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="title" className="font-mono text-[10px] uppercase tracking-widest text-white/70">
              Album Title <span className="text-white/40 font-normal">(Optional)</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Visit Greenland (Leave empty to auto-generate)"
              className="bg-black/20 border-white/10 rounded-none text-white focus-visible:ring-white"
            />
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="date" className="font-mono text-[10px] uppercase tracking-widest text-white/70">
                Date <span className="text-white/40 font-normal">(Optional - auto-detects earliest photo date)</span>
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-black/20 border-white/10 rounded-none text-white focus-visible:ring-white"
              />
            </div>
            
            <div className="space-y-1.5">
              <LocationSelector
                selectedLocationId={locationId}
                onSelectLocation={(id, fullName) => {
                  setLocationId(id);
                  setLocation(fullName);
                }}
              />
            </div>
          </div>
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
              className="bg-black/20 border-white/10 rounded-none text-white focus-visible:ring-white resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <DialogClose render={
              <Button type="button" variant="outline" className="border-white/10 text-white rounded-none hover:bg-white/5 font-mono uppercase tracking-wider text-xs">
                Cancel
              </Button>
            } />
            <Button type="submit" disabled={loading} className="bg-[#e8e5f0] text-[#0E1012] hover:bg-[#d4d0de] rounded-none font-bold uppercase tracking-wider text-xs">
              {loading ? "Creating..." : "Create Album"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
