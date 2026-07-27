"use client";

import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import {
  Search,
  MapPin,
  Check,
  Plus,
  Loader2,
  Pencil,
  Sparkles,
  X,
  Globe,
  Compass,
  ChevronDown,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { EditLocationDialog, LocationNode } from "./edit-location-dialog";
import { geocodeLocation } from "@/lib/geocoding";

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

  // Search & Navigation Modes
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"search" | "cascade">("search");

  // Cascading Dropdowns State
  const [selectedCountryId, setSelectedCountryId] = useState<string>("");
  const [selectedRegionId, setSelectedRegionId] = useState<string>("");
  const [selectedSpotId, setSelectedSpotId] = useState<string>("");

  // New location inline form
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newSpotName, setNewSpotName] = useState("");
  const [creating, setCreating] = useState(false);

  // Editing state for location items
  const [editingNode, setEditingNode] = useState<LocationNode | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("locations")
        .select("id, name, type, parent_id, lat, lng");
      if (error) throw error;
      setLocations(data || []);
    } catch (err: any) {
      console.error("Error fetching locations:", err);
      toast.error("Failed to load locations hierarchy");
    } finally {
      setLoading(false);
    }
  };

  // Reconstruct path and sync dropdowns when selectedLocationId changes
  useEffect(() => {
    if (!selectedLocationId || locations.length === 0) {
      setSelectedCountryId("");
      setSelectedRegionId("");
      setSelectedSpotId("");
      return;
    }

    const node = locations.find((l) => l.id === selectedLocationId);
    if (!node) return;

    // Traverse upwards to populate cascade selectors
    const pathNodes: LocationNode[] = [];
    let current: LocationNode | undefined = node;
    while (current) {
      pathNodes.unshift(current);
      current = locations.find((l) => l.id === current?.parent_id);
    }

    const countryNode = pathNodes.find(
      (n) => n.type === "country" || n.type === "sub-region"
    );
    const regionNode = pathNodes.find(
      (n) => n.type === "region" || n.type === "island"
    );
    const spotNode = pathNodes.find(
      (n) => n.type === "city" || n.type === "spot"
    );

    if (countryNode) setSelectedCountryId(countryNode.id);
    if (regionNode) setSelectedRegionId(regionNode.id);
    if (spotNode) setSelectedSpotId(spotNode.id);
  }, [selectedLocationId, locations]);

  // Helper to build full display path name (e.g. "Anaga, Tenerife, Spain")
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

  // Helper to build hierarchy string (e.g. "Spain › Canary Islands")
  const buildHierarchyString = (node: LocationNode): string => {
    const pathNodes: string[] = [];
    let current: LocationNode | undefined = locations.find(
      (l) => l.id === node.parent_id
    );
    while (current) {
      pathNodes.unshift(current.name);
      current = locations.find((l) => l.id === current?.parent_id);
    }
    return pathNodes.join(" › ");
  };

  // Countries & Sub-regions list
  const countriesList = useMemo(() => {
    return locations
      .filter((l) => l.type === "country" || l.type === "sub-region")
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [locations]);

  // Regions & Islands for active country
  const regionsList = useMemo(() => {
    if (!selectedCountryId) return [];
    // Get direct children OR descendants of selected country
    const directChildren = locations.filter(
      (l) => l.parent_id === selectedCountryId
    );
    return directChildren.sort((a, b) => a.name.localeCompare(b.name));
  }, [locations, selectedCountryId]);

  // Spots & Cities for active region
  const spotsList = useMemo(() => {
    if (!selectedRegionId) return [];
    const directChildren = locations.filter(
      (l) => l.parent_id === selectedRegionId
    );
    return directChildren.sort((a, b) => a.name.localeCompare(b.name));
  }, [locations, selectedRegionId]);

  // Filtered search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase().trim();
    return locations
      .filter(
        (l) =>
          l.name.toLowerCase().includes(query) ||
          l.type.toLowerCase().includes(query) ||
          buildFullName(l).toLowerCase().includes(query)
      )
      .slice(0, 12)
      .map((node) => ({
        node,
        fullName: buildFullName(node),
        hierarchy: buildHierarchyString(node),
      }));
  }, [locations, searchQuery]);

  // Shortcut locations for quick selection
  const shortcutLocations = useMemo(() => {
    const names = ["Greenland", "Spain", "Iceland", "Mongolia", "Tenerife", "Anaga", "Disko Bay"];
    return locations.filter((l) => names.includes(l.name)).slice(0, 5);
  }, [locations]);

  const activeNode = selectedLocationId
    ? locations.find((l) => l.id === selectedLocationId)
    : null;

  const handleSelectNode = (node: LocationNode) => {
    onSelectLocation(node.id, buildFullName(node));
    setSearchQuery("");
    toast.success(`Selected location: "${node.name}"`);
  };

  const handleClearSelection = () => {
    onSelectLocation(null, "");
    setSelectedCountryId("");
    setSelectedRegionId("");
    setSelectedSpotId("");
  };

  const handleOpenEdit = (node: LocationNode, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingNode(node);
    setIsEditDialogOpen(true);
  };

  const handleLocationUpdated = async () => {
    await fetchLocations();
  };

  // Quick inline creation of new location with auto-geocoding
  const handleCreateNewSpot = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newSpotName.trim();
    if (!cleanName) {
      toast.error("Please enter a location spot name");
      return;
    }

    const parentId = selectedRegionId || selectedCountryId || null;
    let parentName = "";
    if (parentId) {
      const parentNode = locations.find((l) => l.id === parentId);
      if (parentNode) parentName = parentNode.name;
    }

    setCreating(true);
    try {
      // Auto-detect GPS coordinates via OpenStreetMap Nominatim API
      const geocodeRes = await geocodeLocation(cleanName, parentName);

      const type = selectedRegionId ? "spot" : selectedCountryId ? "region" : "country";

      const { data, error } = await supabase
        .from("locations")
        .insert({
          name: cleanName,
          type,
          parent_id: parentId,
          lat: geocodeRes?.lat || null,
          lng: geocodeRes?.lng || null,
        })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          toast.error(`"${cleanName}" already exists under this parent location.`);
        } else {
          throw error;
        }
        return;
      }

      const newNode = data as LocationNode;
      await fetchLocations();
      handleSelectNode(newNode);
      setNewSpotName("");
      setIsCreatingNew(false);

      if (geocodeRes) {
        toast.success(`Created "${cleanName}" with GPS: ${geocodeRes.lat}°, ${geocodeRes.lng}°`);
      } else {
        toast.success(`Created location "${cleanName}"`);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to create location");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6 bg-black/20 border border-white/10 text-white/50 text-xs font-mono">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        LOADING LOCATIONS TAXONOMY...
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4 w-full bg-[#16181c] border border-white/10 p-4 text-white">
      
      {/* Top Bar: Title & Active Selection Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-emerald-400" />
          <span className="font-mono text-xs uppercase tracking-wider font-semibold">
            Location Atlas Selector
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-black/40 p-1 border border-white/10 text-[10px] font-mono uppercase tracking-wider">
          <button
            type="button"
            onClick={() => setActiveTab("search")}
            className={`px-3 py-1 transition-all cursor-pointer ${
              activeTab === "search"
                ? "bg-amber-400 text-black font-bold shadow-sm"
                : "text-white/60 hover:text-white"
            }`}
          >
            Search & Quick Pick
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("cascade")}
            className={`px-3 py-1 transition-all cursor-pointer ${
              activeTab === "cascade"
                ? "bg-amber-400 text-black font-bold shadow-sm"
                : "text-white/60 hover:text-white"
            }`}
          >
            Browse By Country
          </button>
        </div>
      </div>

      {/* Active Selection Display Banner */}
      {activeNode ? (
        <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 truncate">
            <div className="p-1.5 rounded-full bg-emerald-500/20 text-emerald-400 shrink-0">
              <Check className="h-3.5 w-3.5" />
            </div>
            <div className="flex flex-col truncate">
              <div className="font-semibold text-emerald-200 truncate">
                {buildFullName(activeNode)}
              </div>
              <div className="text-[10px] font-mono text-emerald-400/70 uppercase tracking-widest flex items-center gap-2">
                <span>Type: {activeNode.type}</span>
                {activeNode.lat != null && activeNode.lng != null && (
                  <span>• GPS: {activeNode.lat}°, {activeNode.lng}°</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleOpenEdit(activeNode)}
              className="h-7 border-amber-400/30 text-amber-300 hover:bg-amber-400/20 text-[10px] font-mono uppercase tracking-widest cursor-pointer px-2.5"
            >
              <Pencil className="h-3 w-3 mr-1" /> Edit
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearSelection}
              className="h-7 text-white/50 hover:text-white text-[10px] font-mono uppercase cursor-pointer px-2"
              title="Clear selection"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-2.5 bg-black/20 border border-white/5 text-xs text-white/40 font-mono uppercase tracking-widest flex items-center gap-2">
          <Compass className="h-3.5 w-3.5 text-white/30" />
          <span>No location selected. Search or browse below.</span>
        </div>
      )}

      {/* Mode 1: Search & Quick Pick */}
      {activeTab === "search" && (
        <div className="space-y-3">
          {/* Quick Shortcuts Ribbon */}
          {shortcutLocations.length > 0 && !searchQuery && (
            <div className="space-y-1.5">
              <div className="text-[10px] font-mono uppercase tracking-widest text-white/40">
                Popular Portfolio Destinations
              </div>
              <div className="flex flex-wrap gap-2">
                {shortcutLocations.map((loc) => (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => handleSelectNode(loc)}
                    className="px-2.5 py-1 bg-white/5 hover:bg-white/15 border border-white/10 text-xs text-white/80 hover:text-white font-sans transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <MapPin className="h-3 w-3 text-emerald-400" />
                    <span>{loc.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Input Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/40" />
            <Input
              placeholder="Search any country, island, city, or spot (e.g. Tenerife, Skógafoss, Nuuk)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-black/40 border-white/15 rounded-none text-white text-xs pl-9 pr-10 h-9 focus-visible:ring-amber-400/50"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-xs text-white/40 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Search Results List */}
          {searchQuery && (
            <ScrollArea className="border border-white/10 bg-black/40 max-h-60 w-full">
              <div className="divide-y divide-white/5">
                {searchResults.length === 0 ? (
                  <div className="p-6 text-center space-y-3">
                    <p className="text-xs font-mono text-white/40 uppercase tracking-widest">
                      No location found for &quot;{searchQuery}&quot;
                    </p>
                    <Button
                      type="button"
                      onClick={() => {
                        setNewSpotName(searchQuery);
                        setIsCreatingNew(true);
                      }}
                      className="bg-amber-400 text-black hover:bg-amber-300 text-xs font-bold uppercase tracking-wider h-8"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add &quot;{searchQuery}&quot; as new location
                    </Button>
                  </div>
                ) : (
                  searchResults.map(({ node, fullName, hierarchy }) => (
                    <div
                      key={node.id}
                      onClick={() => handleSelectNode(node)}
                      className="p-3 hover:bg-white/10 transition-all flex items-center justify-between cursor-pointer group"
                    >
                      <div className="flex flex-col gap-0.5 truncate">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white text-xs">{node.name}</span>
                          <span className="px-1.5 py-0.5 bg-white/10 text-[9px] font-mono uppercase text-white/60">
                            {node.type}
                          </span>
                          {node.lat != null && node.lng != null && (
                            <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-0.5">
                              <MapPin className="h-2.5 w-2.5" /> {node.lat}°, {node.lng}°
                            </span>
                          )}
                        </div>
                        {hierarchy && (
                          <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest truncate">
                            {hierarchy}
                          </div>
                        )}
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => handleOpenEdit(node, e)}
                        className="opacity-0 group-hover:opacity-100 text-white/40 hover:text-amber-300 hover:bg-white/10"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          )}
        </div>
      )}

      {/* Mode 2: Cascading Dropdowns */}
      {activeTab === "cascade" && (
        <div className="space-y-4 pt-1">
          {/* Step 1: Select Country */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase tracking-widest text-white/60 flex items-center gap-1">
              <Layers className="h-3 w-3 text-amber-400" />
              1. Select Country or Territory
            </label>
            <select
              value={selectedCountryId}
              onChange={(e) => {
                const id = e.target.value;
                setSelectedCountryId(id);
                setSelectedRegionId("");
                setSelectedSpotId("");
                const node = locations.find((l) => l.id === id);
                if (node) handleSelectNode(node);
              }}
              className="w-full h-9 bg-black/40 border border-white/15 text-white text-xs px-3 focus:outline-none focus:border-amber-400"
            >
              <option value="">-- Choose Country --</option>
              {countriesList.map((country) => (
                <option key={country.id} value={country.id} className="bg-[#16181c] text-white">
                  {country.name}
                </option>
              ))}
            </select>
          </div>

          {/* Step 2: Select Region / Island */}
          {selectedCountryId && (
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-widest text-white/60 flex items-center gap-1">
                <ChevronDown className="h-3 w-3 text-amber-400" />
                2. Select Region or Island (Optional)
              </label>
              <select
                value={selectedRegionId}
                onChange={(e) => {
                  const id = e.target.value;
                  setSelectedRegionId(id);
                  setSelectedSpotId("");
                  const node = locations.find((l) => l.id === id);
                  if (node) handleSelectNode(node);
                }}
                className="w-full h-9 bg-black/40 border border-white/15 text-white text-xs px-3 focus:outline-none focus:border-amber-400"
              >
                <option value="">-- All Regions / Islands --</option>
                {regionsList.map((region) => (
                  <option key={region.id} value={region.id} className="bg-[#16181c] text-white">
                    {region.name} ({region.type})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Step 3: Select Specific Spot */}
          {selectedRegionId && spotsList.length > 0 && (
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-widest text-white/60 flex items-center gap-1">
                <MapPin className="h-3 w-3 text-emerald-400" />
                3. Select Specific Spot or City (Optional)
              </label>
              <select
                value={selectedSpotId}
                onChange={(e) => {
                  const id = e.target.value;
                  setSelectedSpotId(id);
                  const node = locations.find((l) => l.id === id);
                  if (node) handleSelectNode(node);
                }}
                className="w-full h-9 bg-black/40 border border-white/15 text-white text-xs px-3 focus:outline-none focus:border-amber-400"
              >
                <option value="">-- All Spots --</option>
                {spotsList.map((spot) => (
                  <option key={spot.id} value={spot.id} className="bg-[#16181c] text-white">
                    {spot.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Inline Create New Location Spot Trigger */}
      {!isCreatingNew ? (
        <div className="pt-2 border-t border-white/10 flex items-center justify-between">
          <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
            Don&apos;t see your location?
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsCreatingNew(true)}
            className="h-7 border-white/15 text-white hover:bg-white/10 text-[10px] font-mono uppercase tracking-wider cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 mr-1 text-amber-400" /> Quick Add Location
          </Button>
        </div>
      ) : (
        <form onSubmit={handleCreateNewSpot} className="p-3 bg-black/50 border border-amber-400/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300 flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Quick Add New Location (Auto GPS)
            </span>
            <button
              type="button"
              onClick={() => setIsCreatingNew(false)}
              className="text-white/40 hover:text-white cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="e.g. El Teide National Park"
              value={newSpotName}
              onChange={(e) => setNewSpotName(e.target.value)}
              className="bg-black/40 border-white/15 text-xs text-white h-8"
              required
            />
            <Button
              type="submit"
              disabled={creating || !newSpotName.trim()}
              className="bg-amber-400 text-black hover:bg-amber-300 text-xs font-bold uppercase tracking-wider h-8 shrink-0 px-3 cursor-pointer"
            >
              {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save & Select"}
            </Button>
          </div>
        </form>
      )}

      {/* Edit Location Dialog Modal */}
      {editingNode && (
        <EditLocationDialog
          node={editingNode}
          allLocations={locations}
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onLocationUpdated={handleLocationUpdated}
        />
      )}

    </div>
  );
}
