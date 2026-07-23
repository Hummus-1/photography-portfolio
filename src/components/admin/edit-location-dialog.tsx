"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Pencil,
  FolderTree,
  Search,
  Check,
  Loader2,
  Trash2,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export interface LocationNode {
  id: string;
  name: string;
  type: string;
  parent_id: string | null;
}

interface EditLocationDialogProps {
  node: LocationNode | null;
  allLocations: LocationNode[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onLocationUpdated: (updatedNodeId: string, action: "update" | "delete") => void;
}

const LOCATION_TYPES = [
  "continent",
  "sub-region",
  "country",
  "region",
  "city",
  "island",
  "spot",
];

// Helper to compute all descendant IDs of a node to prevent circular hierarchy loops
function getDescendantIds(nodeId: string, list: LocationNode[]): Set<string> {
  const descendants = new Set<string>();
  descendants.add(nodeId);
  const queue = [nodeId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const children = list.filter((l) => l.parent_id === currentId);
    for (const child of children) {
      if (!descendants.has(child.id)) {
        descendants.add(child.id);
        queue.push(child.id);
      }
    }
  }

  return descendants;
}

// Helper to build full display path for a given node ID
function buildNodePath(nodeId: string | null, list: LocationNode[]): string {
  if (!nodeId) return "Root Level (No Parent / Continent)";
  const pathNodes: string[] = [];
  let currentId: string | null = nodeId;
  while (currentId) {
    const node = list.find((l) => l.id === currentId);
    if (node) {
      pathNodes.unshift(node.name);
      currentId = node.parent_id;
    } else {
      break;
    }
  }
  return pathNodes.join(" › ");
}

export function EditLocationDialog({
  node,
  allLocations,
  isOpen,
  onOpenChange,
  onLocationUpdated,
}: EditLocationDialogProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState("region");
  const [parentId, setParentId] = useState<string | null>(null);

  const [parentSearch, setParentSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (node) {
      setName(node.name);
      setType(node.type);
      setParentId(node.parent_id);
      setParentSearch("");
    }
  }, [node]);

  if (!node) return null;

  // Invalid parent IDs: target node itself and any of its descendants
  const invalidParentIds = getDescendantIds(node.id, allLocations);

  // Eligible parent nodes
  const eligibleParents = allLocations.filter(
    (l) => !invalidParentIds.has(l.id)
  );

  // Filtered by search input
  const filteredParents = parentSearch.trim()
    ? eligibleParents.filter((l) => {
        const fullPath = buildNodePath(l.id, allLocations).toLowerCase();
        return (
          l.name.toLowerCase().includes(parentSearch.toLowerCase()) ||
          fullPath.includes(parentSearch.toLowerCase())
        );
      })
    : eligibleParents;

  const currentPath = buildNodePath(node.id, allLocations);

  // Compute preview of new path if parent changes
  let previewPath = name.trim() || node.name;
  if (parentId) {
    const parentPathStr = buildNodePath(parentId, allLocations);
    previewPath = `${parentPathStr} › ${previewPath}`;
  } else {
    previewPath = `${previewPath} (Root Level)`;
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      toast.error("Location name cannot be empty");
      return;
    }

    // Auto-adjust type for database constraint if parent_id is null vs present
    let finalType = type;
    if (parentId === null && finalType !== "continent") {
      finalType = "continent";
    } else if (parentId !== null && finalType === "continent") {
      finalType = "region";
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("locations")
        .update({
          name: cleanName,
          type: finalType,
          parent_id: parentId,
        })
        .eq("id", node.id);

      if (error) {
        if (error.code === "23505") {
          toast.error(`A location named "${cleanName}" already exists under this parent.`);
        } else {
          throw error;
        }
        return;
      }

      toast.success(`Updated location "${cleanName}"`);
      onLocationUpdated(node.id, "update");
      onOpenChange(false);
    } catch (err: any) {
      console.error("Error updating location:", err);
      toast.error(err.message || "Failed to update location");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to delete "${node.name}"?\n\nSub-locations will have their parent link removed.`
      )
    ) {
      return;
    }

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

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#14171a] border border-white/10 text-white rounded-none max-w-xl w-full p-6">
        <DialogHeader>
          <DialogTitle className="font-serif text-lg font-bold uppercase tracking-wider flex items-center gap-2 text-white">
            <Pencil className="h-4 w-4 text-amber-400" />
            Edit Location Item & Hierarchy
          </DialogTitle>
          <DialogDescription className="text-white/60 text-xs font-sans">
            Rename this location or re-parent it to change its hierarchical position in the global location tree.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-5 pt-3">
          {/* Current Path Info */}
          <div className="p-3 bg-white/5 border border-white/10 text-xs font-mono">
            <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1 flex items-center gap-1">
              <FolderTree className="h-3 w-3 text-amber-400" /> Current Hierarchy Path
            </div>
            <div className="text-amber-300/90 font-medium truncate">
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
                className="bg-black/30 border-white/10 rounded-none text-white focus-visible:ring-amber-400/50 text-xs"
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
                className="w-full h-9 bg-black/30 border border-white/10 text-white text-xs px-3 focus:outline-none focus:border-amber-400/50"
              >
                {LOCATION_TYPES.map((t) => (
                  <option key={t} value={t} className="bg-[#14171a] text-white">
                    {t.toUpperCase()}
                  </option>
                ))}
              </select>
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
                className="h-8 bg-black/40 border-white/10 rounded-none text-xs text-white pl-8 placeholder-white/20 focus-visible:ring-amber-400/50"
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
                      ? "bg-amber-500/20 text-amber-300 font-semibold border-l-2 border-amber-400"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className="font-mono text-[11px]">None (Root Level / Continent)</span>
                  {parentId === null && <Check className="h-3.5 w-3.5 text-amber-400 shrink-0" />}
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
                          ? "bg-amber-500/20 text-amber-300 font-semibold border-l-2 border-amber-400"
                          : "text-white/70 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <div className="flex flex-col gap-0.5 truncate pr-2">
                        <span className="truncate">{parent.name}</span>
                        <span className="text-[9px] text-white/40 font-mono truncate">
                          {parentPathStr}
                        </span>
                      </div>
                      {isSelected && <Check className="h-3.5 w-3.5 text-amber-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* New Path Preview */}
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-xs font-mono">
            <div className="text-[10px] text-amber-400/80 uppercase tracking-widest mb-1 flex items-center gap-1">
              <ArrowRight className="h-3 w-3" /> Updated Hierarchy Preview
            </div>
            <div className="text-white font-medium truncate">
              {previewPath}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <Button
              type="button"
              variant="outline"
              onClick={handleDelete}
              disabled={deleting || saving}
              className="border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-none font-mono text-xs uppercase tracking-wider h-9"
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
                type="submit"
                disabled={saving || deleting}
                className="bg-amber-400 hover:bg-amber-300 text-black font-bold rounded-none uppercase text-xs tracking-wider h-9 px-4"
              >
                {saving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  "Save Hierarchy"
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
