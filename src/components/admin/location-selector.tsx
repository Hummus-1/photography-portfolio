"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Check, Loader2, ChevronRight, Search, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { EditLocationDialog, LocationNode } from "./edit-location-dialog";

interface LocationSelectorProps {
  selectedLocationId: string | null;
  onSelectLocation: (id: string | null, fullName: string) => void;
}

export function LocationSelector({
  selectedLocationId,
  onSelectLocation,
}: LocationSelectorProps) {
  const [locations, setLocations] = useState<LocationNode[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search query
  const [searchQuery, setSearchQuery] = useState("");
  
  // Tracks the active selection path of IDs: [continentId, subRegionId, countryId, regionId, cityId, ...]
  const [selectedPath, setSelectedPath] = useState<string[]>([]);
  
  // Input state for new children per column index
  const [newChildName, setNewChildName] = useState<{ [key: number]: string }>({});
  const [creatingChildAt, setCreatingChildAt] = useState<number | null>(null);

  // Editing state for location items
  const [editingNode, setEditingNode] = useState<LocationNode | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Ref for horizontal ScrollArea container
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchLocations();
  }, []);

  // Reconstruct path when selectedLocationId is provided
  useEffect(() => {
    if (selectedLocationId && locations.length > 0 && selectedPath.length === 0) {
      const path: string[] = [];
      let currentId: string | null = selectedLocationId;
      while (currentId) {
        const node = locations.find((l) => l.id === currentId);
        if (node) {
          path.unshift(node.id);
          currentId = node.parent_id;
        } else {
          break;
        }
      }
      setSelectedPath(path);
    }
  }, [selectedLocationId, locations]);

  // Auto-scroll the ScrollArea viewport to the right whenever a new column is added
  useEffect(() => {
    if (scrollAreaRef.current) {
      setTimeout(() => {
        // Query the inner viewport element defined by shadcn ScrollArea
        const viewport = scrollAreaRef.current?.querySelector('[data-slot="scroll-area-viewport"]');
        if (viewport) {
          viewport.scrollTo({
            left: viewport.scrollWidth,
            behavior: "smooth",
          });
        }
      }, 100);
    }
  }, [selectedPath]);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("locations")
        .select("id, name, type, parent_id");
      if (error) throw error;
      setLocations(data || []);
    } catch (err: any) {
      console.error("Error fetching locations:", err);
      toast.error("Failed to load locations hierarchy");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (node: LocationNode, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingNode(node);
    setIsEditDialogOpen(true);
  };

  const handleLocationUpdated = async (updatedNodeId: string, action: "update" | "delete") => {
    await fetchLocations();
    if (action === "delete" && selectedLocationId === updatedNodeId) {
      onSelectLocation(null, "");
      setSelectedPath([]);
    } else {
      // Re-trigger select to update fullName if active node was edited
      const updatedNode = locations.find((l) => l.id === selectedLocationId);
      if (updatedNode) {
        onSelectLocation(updatedNode.id, buildFullName(updatedNode));
      }
    }
  };

  const getChildType = (parentType: string): string => {
    switch (parentType) {
      case "continent":
        return "sub-region";
      case "sub-region":
        return "country";
      case "country":
        return "region";
      case "region":
        return "city";
      case "city":
        return "spot";
      default:
        return "spot";
    }
  };

  // Helper to build full display path name
  const buildFullName = (node: LocationNode): string => {
    const pathNodes: string[] = [];
    let current: LocationNode | undefined = node;
    while (current) {
      if (current.type !== "continent" && current.type !== "sub-region") {
        pathNodes.unshift(current.name);
      }
      current = locations.find((l) => l.id === current?.parent_id);
    }
    return pathNodes.join(", ");
  };

  const handleSelectNode = (nodeId: string, colIndex: number) => {
    const newPath = selectedPath.slice(0, colIndex);
    newPath.push(nodeId);
    setSelectedPath(newPath);

    const node = locations.find((l) => l.id === nodeId);
    if (node) {
      onSelectLocation(node.id, buildFullName(node));
    }
  };

  const handleAddChild = async (parentId: string | null, colIndex: number) => {
    const name = newChildName[colIndex]?.trim();
    if (!name) return;

    let parentType = "continent";
    if (parentId) {
      const parentNode = locations.find((l) => l.id === parentId);
      if (parentNode) {
        parentType = parentNode.type;
      }
    }

    const type = getChildType(parentType);
    setCreatingChildAt(colIndex);

    try {
      const { data, error } = await supabase
        .from("locations")
        .insert({
          name,
          type,
          parent_id: parentId,
        })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          toast.error("A sub-item with this name already exists here.");
        } else {
          throw error;
        }
        return;
      }

      const newNode = data as LocationNode;
      setLocations((prev) => [...prev, newNode]);
      
      // Auto-select
      handleSelectNode(newNode.id, colIndex);

      setNewChildName((prev) => ({ ...prev, [colIndex]: "" }));
      toast.success(`Created ${type} "${name}"`);
    } catch (err: any) {
      toast.error(err.message || "Failed to create sub-item");
    } finally {
      setCreatingChildAt(null);
    }
  };

  // Search filter
  const searchResults = searchQuery.trim().length > 0
    ? locations
        .filter((l) => l.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .slice(0, 8)
        .map((node) => {
          const pathNames: string[] = [];
          let current: LocationNode | undefined = node;
          while (current) {
            pathNames.unshift(current.name);
            current = locations.find((l) => l.id === current?.parent_id);
          }
          return {
            node,
            fullName: buildFullName(node),
            displayPath: pathNames.slice(0, -1).join(" › ")
          };
        })
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6 bg-black/10 border border-white/10 text-white/50 text-xs font-mono">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        LOADING LOCATIONS TAXONOMY...
      </div>
    );
  }

  // Generate columns array for Miller Columns layout
  const columnsData: LocationNode[][] = [
    locations.filter((l) => l.parent_id === null),
  ];

  selectedPath.forEach((selectedId) => {
    const children = locations.filter((l) => l.parent_id === selectedId);
    columnsData.push(children);
  });

  return (
    <div className="flex flex-col space-y-3 w-full max-w-full overflow-hidden">
      {/* Header and Status */}
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-mono tracking-widest text-white/40 uppercase">
          Hierarchical Location Selector
        </div>
        {selectedLocationId && (
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
              <Check className="h-3 w-3" /> Selection Active
            </span>
            <button
              type="button"
              onClick={() => {
                const activeNode = locations.find((l) => l.id === selectedLocationId);
                if (activeNode) handleOpenEdit(activeNode);
              }}
              className="text-[10px] font-mono text-amber-400 hover:text-amber-300 underline uppercase tracking-wider flex items-center gap-1 transition-colors"
            >
              <Pencil className="h-2.5 w-2.5" /> Edit Selected Hierarchy
            </button>
          </div>
        )}
      </div>

      {/* Search Bar Input */}
      <div className="relative flex items-center">
        <Search className="absolute left-3 h-3.5 w-3.5 text-white/30" />
        <Input
          placeholder="Search country, island, city (e.g. Tenerife)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-black/30 border-white/10 rounded-none text-white focus-visible:ring-white/40 focus-visible:ring-1 text-xs h-9 pl-9 pr-12 w-full"
        />
        {searchQuery && (
          <button 
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-3 text-[10px] font-mono text-white/40 hover:text-white uppercase tracking-wider transition-colors duration-150"
          >
            Clear
          </button>
        )}
      </div>

      {/* Search Results Overlay / Container */}
      {searchQuery && (
        <ScrollArea className="border border-white/10 bg-[#16181b] max-h-48 w-full z-20">
          <div className="divide-y divide-white/5">
            {searchResults.length === 0 ? (
              <div className="p-4 text-[10px] font-mono text-white/30 text-center uppercase tracking-widest">
                No matching locations found.
              </div>
            ) : (
              searchResults.map(({ node, fullName, displayPath }) => (
                <div
                  key={node.id}
                  className="w-full text-left px-4 py-2 hover:bg-white/5 transition-all text-xs flex items-center justify-between group border-b border-white/5"
                >
                  <button
                    type="button"
                    className="flex-grow text-left border-none outline-none flex flex-col gap-0.5 cursor-pointer"
                    onClick={() => {
                      const path: string[] = [];
                      let currentId: string | null = node.id;
                      while (currentId) {
                        const n = locations.find((l) => l.id === currentId);
                        if (n) {
                          path.unshift(n.id);
                          currentId = n.parent_id;
                        } else {
                          break;
                        }
                      }
                      setSelectedPath(path);
                      onSelectLocation(node.id, fullName);
                      setSearchQuery("");
                      toast.success(`Selected location: ${node.name}`);
                    }}
                  >
                    <span className="text-white font-semibold tracking-wide">{node.name}</span>
                    {displayPath && (
                      <span className="text-[9px] text-white/40 font-mono uppercase tracking-widest truncate">
                        {displayPath}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    title={`Edit ${node.name} location & hierarchy`}
                    onClick={(e) => handleOpenEdit(node, e)}
                    className="p-1.5 text-white/40 hover:text-amber-400 hover:bg-white/10 shrink-0 transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      )}

      {/* Miller Columns Horizontal Scrollable Browser (via ScrollArea) */}
      {!searchQuery && (
        <ScrollArea 
          ref={scrollAreaRef}
          className="border border-white/10 bg-black/20 h-72 rounded-none w-full select-none"
        >
          <div className="flex divide-x divide-white/10 h-full w-max min-w-full">
            {columnsData.map((columnNodes, colIndex) => {
              const activeParentId = colIndex === 0 ? null : selectedPath[colIndex - 1];
              const activeParentNode = activeParentId ? locations.find((l) => l.id === activeParentId) : null;
              
              if (colIndex > 0 && !activeParentId) return null;
              if (activeParentNode && activeParentNode.type === "spot" && columnNodes.length === 0) return null;

              const childType = activeParentNode ? getChildType(activeParentNode.type) : "continent";

              return (
                <div
                  key={colIndex}
                  className="flex-shrink-0 w-52 flex flex-col justify-between h-full bg-black/5"
                >
                  {/* Node List - scrolled vertically via ScrollArea */}
                  <ScrollArea className="flex-grow">
                    {columnNodes.length === 0 ? (
                      <div className="p-4 text-[9px] font-mono text-white/20 text-center uppercase tracking-wider">
                        Empty {childType}
                      </div>
                    ) : (
                      <div className="py-1">
                        {columnNodes
                          .sort((a, b) => a.name.localeCompare(b.name))
                          .map((node) => {
                            const isSelected = selectedPath[colIndex] === node.id;
                            const hasChildren = locations.some((l) => l.parent_id === node.id);

                            return (
                              <div
                                key={node.id}
                                className={`group w-full text-left px-3 py-1.5 text-xs font-sans tracking-wide transition-all flex items-center justify-between ${
                                  isSelected
                                    ? "bg-white/10 text-white font-semibold"
                                    : "text-white/60 hover:bg-white/5 hover:text-white"
                                }`}
                              >
                                <button
                                  type="button"
                                  className="flex-grow text-left truncate pr-1"
                                  onClick={() => handleSelectNode(node.id, colIndex)}
                                >
                                  {node.name}
                                </button>
                                
                                <div className="flex items-center gap-0.5 shrink-0">
                                  <button
                                    type="button"
                                    title={`Edit ${node.name} location & hierarchy`}
                                    onClick={(e) => handleOpenEdit(node, e)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-white/40 hover:text-amber-400 hover:bg-white/10 rounded-xs"
                                  >
                                    <Pencil className="h-3 w-3" />
                                  </button>
                                  
                                  {hasChildren ? (
                                    <ChevronRight
                                      className="h-3.5 w-3.5 opacity-40 shrink-0 cursor-pointer"
                                      onClick={() => handleSelectNode(node.id, colIndex)}
                                    />
                                  ) : isSelected && selectedLocationId === node.id ? (
                                    <Check className="h-3 w-3 text-emerald-400 shrink-0" />
                                  ) : null}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </ScrollArea>

                  {/* Add Child Form */}
                  {colIndex > 0 && (
                    <div className="p-2 border-t border-white/10 bg-black/30">
                      <div className="flex gap-1 items-center">
                        <Input
                          placeholder={`+ Add ${childType}...`}
                          value={newChildName[colIndex] || ""}
                          onChange={(e) =>
                            setNewChildName((prev) => ({
                              ...prev,
                              [colIndex]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddChild(activeParentId, colIndex);
                            }
                          }}
                          className="h-8 bg-black/20 border-white/10 rounded-none text-[11px] text-white placeholder-white/20 focus-visible:ring-white/30 focus-visible:ring-1 focus-visible:ring-offset-0"
                        />
                        <Button
                          type="button"
                          size="icon"
                          onClick={() => handleAddChild(activeParentId, colIndex)}
                          disabled={creatingChildAt === colIndex || !newChildName[colIndex]?.trim()}
                          className="h-8 w-8 bg-white/5 hover:bg-white/15 text-white rounded-none flex-shrink-0"
                        >
                          {creatingChildAt === colIndex ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Plus className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}

      {/* Location Hierarchy Edit Modal */}
      <EditLocationDialog
        node={editingNode}
        allLocations={locations}
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onLocationUpdated={handleLocationUpdated}
      />
    </div>
  );
}
