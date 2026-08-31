"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Pencil,
  Trash2,
  Loader2,
  FolderTree,
  MapPin,
  Sparkles,
  ArrowRight,
  Check,
  Search,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { geocodeLocation } from "@/lib/geocoding";

export interface LocationNode {
  id: string;
  name: string;
  type: string;
  parent_id: string | null;
  latitude?: number | null;
  longitude?: number | null;
  lat?: number | null;
  lng?: number | null;
}

interface EditLocationDialogProps {
  node: LocationNode | null;
  allLocations: LocationNode[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onLocationUpdated: (updatedId: string, action: "update" | "delete") => void;
}

export function isProtectedLocationType(typeStr?: string | null): boolean {
  const lower = (typeStr || "").toLowerCase().trim();
  return lower === "continent" || lower === "country" || lower === "sub-region";
}

const LOCATION_TYPES = [
  "region",
  "subregion",
  "island",
  "city",
  "spot",
  "custom",
];

export function buildNodePath(
  nodeId: string | null,
  locations: LocationNode[]
): string {
  if (!nodeId) return "Root";
  const path: string[] = [];
  let currId: string | null = nodeId;
  const visited = new Set<string>();

  while (currId && !visited.has(currId)) {
    visited.add(currId);
    const found = locations.find((l) => l.id === currId);
    if (!found) break;
    path.unshift(found.name);
    currId = found.parent_id;
  }

  return path.join(" / ");
}

/**
 * Checks if candidateParentId is a descendant of node.id to prevent cyclic reference loops.
 */
function isDescendant(
  nodeId: string,
  candidateParentId: string | null,
  locations: LocationNode[]
): boolean {
  if (!candidateParentId) return false;
  let currId: string | null = candidateParentId;
  const visited = new Set<string>();

  while (currId && !visited.has(currId)) {
    if (currId === nodeId) return true;
    visited.add(currId);
    const found = locations.find((l) => l.id === currId);
    if (!found) break;
    currId = found.parent_id;
  }

  return false;
}

export function EditLocationDialog({
  node,
  allLocations,
  isOpen,
  onOpenChange,
  onLocationUpdated,
}: EditLocationDialogProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState("spot");
  const [parentId, setParentId] = useState<string | null>(null);
  const [lat, setLat] = useState<string>("");
  const [lng, setLng] = useState<string>("");
  const [parentSearch, setParentSearch] = useState("");

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [geocoding, setGeocoding] = useState(false);

  useEffect(() => {
    if (node) {
      setName(node.name || "");
      setType(node.type || "spot");
      setParentId(node.parent_id || null);

      const initialLat = node.latitude ?? node.lat;
      const initialLng = node.longitude ?? node.lng;

      setLat(
        initialLat !== null && initialLat !== undefined
          ? String(initialLat)
          : ""
      );
      setLng(
        initialLng !== null && initialLng !== undefined
          ? String(initialLng)
          : ""
      );
      setParentSearch("");
    }
  }, [node]);

  if (!node) return null;

  // Eligible parents: exclude self & descendants to prevent cycles
  const eligibleParents = allLocations.filter(
    (loc) => loc.id !== node.id && !isDescendant(node.id, loc.id, allLocations)
  );

  const filteredParents = eligibleParents.filter((p) => {
    const query = parentSearch.toLowerCase();
    const fullPath = buildNodePath(p.id, allLocations).toLowerCase();
    return p.name.toLowerCase().includes(query) || fullPath.includes(query);
  });

  const currentPath = buildNodePath(node.id, allLocations);
  const previewPath = parentId
    ? `${buildNodePath(parentId, allLocations)} / ${name || node.name}`
    : `${name || node.name} (Root)`;

  const handleAutoGeocode = async () => {
    if (!name.trim()) {
      toast.error("Please enter a location name first");
      return;
    }

    setGeocoding(true);
    try {
      const parentName = parentId
        ? allLocations.find((l) => l.id === parentId)?.name
        : undefined;

      const result = await geocodeLocation(name, parentName);
      if (result) {
        setLat(String(result.lat));
        setLng(String(result.lng));
        toast.success(`Geocoded coordinates for "${name}"`);
      } else {
        toast.error(`Could not resolve GPS for "${name}"`);
      }
    } catch (err: any) {
      toast.error(err.message || "Geocoding failed");
    } finally {
      setGeocoding(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProtectedLocationType(node.type) || isProtectedLocationType(type)) {
      toast.error("Continents and countries are protected system locations and cannot be edited.");
      return;
    }

    if (!name.trim()) {
      toast.error("Location name cannot be empty");
      return;
    }

    const parsedLat = lat.trim() === "" ? null : parseFloat(lat);
    const parsedLng = lng.trim() === "" ? null : parseFloat(lng);

    if (parsedLat !== null && (isNaN(parsedLat) || parsedLat < -90 || parsedLat > 90)) {
      toast.error("Latitude must be between -90 and 90");
      return;
    }
    if (parsedLng !== null && (isNaN(parsedLng) || parsedLng < -180 || parsedLng > 180)) {
      toast.error("Longitude must be between -180 and 180");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("locations")
        .update({
          name: name.trim(),
          type: type.trim().toLowerCase(),
          parent_id: parentId,
          lat: parsedLat,
          lng: parsedLng,
        })
        .eq("id", node.id);

      if (error) throw error;

      toast.success(`Updated location "${name.trim()}"`);
      onLocationUpdated(node.id, "update");
      onOpenChange(false);
    } catch (err: any) {
      console.error("Error saving location:", err);
      toast.error(err.message || "Failed to save location updates");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (isProtectedLocationType(node.type)) {
      toast.error("Continents and countries are protected system locations and cannot be removed.");
      return;
    }

    // Check if this location has children
    const childCount = allLocations.filter((l) => l.parent_id === node.id).length;

    let confirmMsg = `Are you sure you want to delete "${node.name}"?`;
    if (childCount > 0) {
      confirmMsg = `WARNING: "${node.name}" has ${childCount} child location(s). Deleting it will set their parent to Root! Continue?`;
    }

    if (!confirm(confirmMsg)) return;

    setDeleting(true);
    try {
      const { error } = await supabase
        .from("locations")
        .delete()
        .eq("id", node.id);

      if (error) throw error;

      toast.success(`Deleted location "${node.name}"`);
      onLocationUpdated(node.id, "delete");
      onOpenChange(false);
    } catch (err: any) {
      console.error("Error deleting location:", err);
      toast.error(err.message || "Failed to delete location");
    } finally {
      setDeleting(false);
    }
  };

  const isProtected = isProtectedLocationType(node.type);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        data-lenis-prevent
        className="bg-card border border-border text-foreground rounded-none max-w-xl w-full max-h-[85vh] flex flex-col p-0 overflow-hidden shadow-2xl"
      >
        {/* Static Header */}
        <DialogHeader className="shrink-0 p-6 sm:p-7 border-b border-white/10 relative pr-12">
          <DialogTitle className="font-serif text-lg font-bold uppercase tracking-wider flex items-center gap-2 text-white">
            <Pencil className="h-4 w-4 text-primary" />
            Edit Location Item & Hierarchy
          </DialogTitle>
          <DialogDescription className="text-white/60 text-xs font-mono">
            Rename this location, re-parent it in the tree, or update GPS coordinates.
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Inner Body */}
        <div data-lenis-prevent className="flex-1 overflow-y-auto overflow-x-hidden p-6 sm:p-7 space-y-5">
          {isProtected && (
            <div className="p-3 bg-primary/10 border border-primary/30 text-primary text-xs font-mono flex items-center gap-2">
              <Lock className="h-4 w-4 shrink-0 text-primary" />
              <span>Continents and countries are protected system locations and cannot be edited, re-parented, or removed.</span>
            </div>
          )}

          <form id="edit-location-form" onSubmit={handleSave} className="space-y-5">
            {/* Current Path Info */}
            <div className="p-3 bg-white/5 border border-white/10 text-xs font-mono">
              <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1 flex items-center gap-1">
                <FolderTree className="h-3 w-3 text-primary" /> Current Hierarchy Path
              </div>
              <div className="text-primary font-medium truncate">
                {currentPath}
              </div>
            </div>

            {/* Name and Type Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="font-mono text-[10px] uppercase tracking-widest text-white/70">
                  Location Name
                </Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Location Name"
                  disabled={isProtected}
                  className="bg-black/30 border-white/10 rounded-none text-white focus-visible:ring-primary text-xs disabled:opacity-50"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-mono text-[10px] uppercase tracking-widest text-white/70">
                  Location Type
                </Label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  disabled={isProtected}
                  className="w-full h-9 bg-black/30 border border-white/10 text-white text-xs px-3 focus:outline-none focus:border-primary disabled:opacity-50"
                >
                  {isProtected ? (
                    <option value={node.type} className="bg-card text-foreground">
                      {node.type.toUpperCase()} (PROTECTED)
                    </option>
                  ) : (
                    LOCATION_TYPES.map((t) => (
                      <option key={t} value={t} className="bg-card text-foreground">
                        {t.toUpperCase()}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* GPS Coordinates Section with Auto-Geocode Button */}
            <div className="p-3.5 bg-black/40 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-mono text-primary uppercase tracking-widest">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>GPS Coordinates</span>
                </div>
                <Button
                  type="button"
                  onClick={handleAutoGeocode}
                  disabled={geocoding || !name.trim()}
                  className="h-7 px-3 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 text-[10px] font-mono uppercase tracking-widest cursor-pointer"
                >
                  {geocoding ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  ) : (
                    <Sparkles className="h-3 w-3 mr-1 text-primary" />
                  )}
                  Auto-Detect GPS
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="font-mono text-[9px] uppercase text-white/50">Latitude (°N)</Label>
                  <Input
                    type="number"
                    step="any"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    placeholder="e.g. 69.2200"
                    className="bg-black/40 border-white/10 text-xs text-white h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="font-mono text-[9px] uppercase text-white/50">Longitude (°E)</Label>
                  <Input
                    type="number"
                    step="any"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    placeholder="e.g. -51.1000"
                    className="bg-black/40 border-white/10 text-xs text-white h-8"
                  />
                </div>
              </div>
            </div>

            {/* Hierarchy Parent Selection */}
            <div className="space-y-2 border-t border-white/10 pt-4">
              <div className="flex items-center justify-between">
                <Label className="font-mono text-[10px] uppercase tracking-widest text-white/70">
                  Select Parent Location (Hierarchy)
                </Label>
                <span className="text-[9px] font-mono text-white/40 uppercase">
                  {eligibleParents.length} available parents
                </span>
              </div>

              {/* Parent Search Input */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-white/30" />
                <Input
                  placeholder="Search parent by country, island, or region..."
                  value={parentSearch}
                  onChange={(e) => setParentSearch(e.target.value)}
                  className="h-8 bg-black/40 border-white/10 rounded-none text-xs text-white pl-8 placeholder-white/20 focus-visible:ring-primary"
                />
              </div>

              {/* Parent Options List */}
              <ScrollArea className="h-44 border border-white/10 bg-black/20 p-1">
                <div className="space-y-1">
                  {/* Root Option */}
                  <button
                    type="button"
                    onClick={() => setParentId(null)}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-all ${
                      parentId === null
                        ? "bg-primary/20 text-primary font-semibold border-l-2 border-primary"
                        : "text-white/60 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span className="font-mono text-[11px]">None (Root Level / Continent)</span>
                    {parentId === null && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                  </button>

                  {/* Filtered Parent Nodes */}
                  {filteredParents.map((parent) => {
                    const isSelected = parentId === parent.id;
                    const parentPathStr = buildNodePath(parent.id, allLocations);

                    return (
                      <button
                        key={parent.id}
                        type="button"
                        onClick={() => setParentId(parent.id)}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-all ${
                          isSelected
                            ? "bg-primary/20 text-primary font-semibold border-l-2 border-primary"
                            : "text-white/70 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <div className="flex flex-col gap-0.5 truncate pr-2">
                          <span className="truncate">{parent.name}</span>
                          <span className="text-[9px] text-white/40 font-mono truncate">
                            {parentPathStr}
                          </span>
                        </div>
                        {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>

            {/* New Path Preview */}
            <div className="p-3 bg-primary/10 border border-primary/30 text-xs font-mono">
              <div className="text-[10px] text-primary uppercase tracking-widest mb-1 flex items-center gap-1">
                <ArrowRight className="h-3 w-3" /> Updated Hierarchy Preview
              </div>
              <div className="text-white font-medium truncate">
                {previewPath}
              </div>
            </div>
          </form>
        </div>

        {/* Static Footer */}
        <div className="shrink-0 p-4 sm:p-6 border-t border-border bg-card flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleDelete}
            disabled={isProtected || deleting || saving}
            className="border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-none font-mono text-xs uppercase tracking-wider h-9 disabled:opacity-30"
          >
            {deleting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <>
                <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete Item
              </>
            )}
          </Button>

          <div className="flex gap-2">
            <DialogClose render={
              <Button
                type="button"
                variant="outline"
                className="border-white/10 text-white hover:bg-white/5 rounded-none font-mono text-xs uppercase tracking-wider h-9"
              >
                Cancel
              </Button>
            } />
            <Button
              form="edit-location-form"
              type="submit"
              disabled={isProtected || saving || deleting}
              className="bg-primary hover:bg-primary/90 text-white font-bold rounded-none uppercase text-xs tracking-wider h-9 px-4 cursor-pointer disabled:opacity-30"
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                "Save Hierarchy"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
