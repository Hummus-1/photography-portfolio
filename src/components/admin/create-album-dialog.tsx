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
    if (!title || !date || !locationId) {
      toast.error("Please fill in required fields (including a location selection)");
      return;
    }

    setLoading(true);

    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    try {
      const { data, error } = await supabase
        .from("albums")
        .insert({
          title,
          slug,
          description,
          location,
          location_id: locationId,
          date,
          is_published: false,
        })
        .select()
        .single();

      if (error) throw error;
      toast.success("Album created successfully");
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
            Create a new album container to organize and upload your photos.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          <div className="space-y-1.5">
            <Label htmlFor="title" className="font-mono text-[10px] uppercase tracking-widest text-white/70">
              Album Title *
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Visit Greenland"
              className="bg-black/20 border-white/10 rounded-none text-white focus-visible:ring-white"
              required
            />
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="date" className="font-mono text-[10px] uppercase tracking-widest text-white/70">
                Date *
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-black/20 border-white/10 rounded-none text-white focus-visible:ring-white"
                required
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
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this photo collection..."
              rows={4}
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
              {loading ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
