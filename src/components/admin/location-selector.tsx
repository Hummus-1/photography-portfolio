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
  Globe2,
  Navigation,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { EditLocationDialog, LocationNode } from "./edit-location-dialog";
import {
  geocodeLocation,
  searchLocationSuggestions,
  GeocodeSuggestion,
} from "@/lib/geocoding";

interface LocationSelectorProps {
  selectedLocationId: string | null;
  onSelectLocation: (id: string | null, fullName: string) => void;
}

const ALLOWED_LOCATION_TYPES = [
  "continent",
  "country",
  "sub-region",
  "region",
  "island",
  "city",
  "spot",
  "custom",
];

function normalizeType(typeStr: string): string {
  const lower = (typeStr || "").toLowerCase();
  if (ALLOWED_LOCATION_TYPES.includes(lower)) return lower;
  if (lower.includes("country")) return "country";
  if (lower.includes("state") || lower.includes("province") || lower.includes("region")) return "region";
  if (lower.includes("island")) return "island";
  if (lower.includes("city") || lower.includes("town") || lower.includes("village")) return "city";
  return "spot";
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

  // Geocoding suggestions state
  const [suggestions, setSuggestions] = useState<GeocodeSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

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

  // Debounced search for OpenStreetMap suggestions when typing
  useEffect(() => {
    if (!isCreatingNew || newSpotName.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const hits = await searchLocationSuggestions(newSpotName);
        setSuggestions(hits);
      } catch (err) {
        console.error("Suggestion lookup error:", err);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [newSpotName, isCreatingNew]);

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
    return locations
      .filter((l) => l.parent_id === selectedCountryId)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [locations, selectedCountryId]);

  // Specific Spots/Cities for active region
  const spotsList = useMemo(() => {
    if (!selectedRegionId) return [];
    return locations
      .filter((l) => l.parent_id === selectedRegionId)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [locations, selectedRegionId]);

  // Filtered search list across all nodes
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return locations.slice(0, 25);
    const q = searchQuery.toLowerCase().trim();
    return locations.filter((loc) => {
      const full = buildFullName(loc).toLowerCase();
      const hier = buildHierarchyString(loc).toLowerCase();
      return loc.name.toLowerCase().includes(q) || full.includes(q) || hier.includes(q);
    });
  }, [locations, searchQuery]);

  const activeNode = useMemo(() => {
    return locations.find((l) => l.id === selectedLocationId) || null;
  }, [locations, selectedLocationId]);

  const handleSelectNode = (node: LocationNode | null) => {
    if (!node) {
      onSelectLocation(null, "");
      return;
    }
    const fullName = buildFullName(node);
    onSelectLocation(node.id, fullName);
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

  // Resolves the proper continent parent ID for any country node to satisfy DB check_parent constraint
  const getContinentIdForCountry = (countryName: string, allLocs: LocationNode[]): string => {
    const continents = allLocs.filter((l) => l.type === "continent");
    if (continents.length === 0) {
      throw new Error("No continent nodes found in database.");
    }

    const lower = countryName.toLowerCase();
    if (
      ["argentina", "chile", "brazil", "brasil", "peru", "colombia", "venezuela", "ecuador", "bolivia", "paraguay", "uruguay"].some(
        (c) => lower.includes(c)
      )
    ) {
      return (
        continents.find((c) => c.name.toLowerCase().includes("south america"))?.id ||
        continents[0].id
      );
    }
    if (
      ["united states", "usa", "canada", "mexico", "greenland", "costa rica", "cuba", "jamaica", "panama"].some(
        (c) => lower.includes(c)
      )
    ) {
      return (
        continents.find((c) => c.name.toLowerCase().includes("north america"))?.id ||
        continents[0].id
      );
    }
    if (
      ["japan", "china", "india", "thailand", "indonesia", "vietnam", "korea", "philippines", "malaysia"].some(
        (c) => lower.includes(c)
      )
    ) {
      return continents.find((c) => c.name.toLowerCase().includes("asia"))?.id || continents[0].id;
    }
    if (
      ["morocco", "egypt", "south africa", "kenya", "tanzania", "nigeria", "ghana", "ethiopia", "madagascar"].some(
        (c) => lower.includes(c)
      )
    ) {
      return continents.find((c) => c.name.toLowerCase().includes("africa"))?.id || continents[0].id;
    }
    if (["australia", "new zealand", "fiji"].some((c) => lower.includes(c))) {
      return continents.find((c) => c.name.toLowerCase().includes("oceania"))?.id || continents[0].id;
    }

    // Default to Europe (Spain, France, UK, Iceland, Norway, Italy, Germany, etc.)
    return continents.find((c) => c.name.toLowerCase().includes("europe"))?.id || continents[0].id;
  };

  // Helper to ensure a location node exists in Supabase
  const getOrCreateLocationNode = async (
    name: string,
    rawType: string,
    parentId: string | null,
    lat?: number,
    lng?: number,
    currentLocs: LocationNode[] = locations
  ): Promise<LocationNode> => {
    const type = normalizeType(rawType);
    let finalParentId = parentId;

    // To satisfy Postgres CHECK constraint `check_parent_for_custom_locations`:
    // Country & Sub-region types MUST have a non-null parent_id (pointing to a continent)
    if ((type === "country" || type === "sub-region") && !finalParentId) {
      finalParentId = getContinentIdForCountry(name, currentLocs);
    }

    // Check if node already exists under this parent
    const existing = currentLocs.find(
      (l) => l.name.toLowerCase() === name.toLowerCase() && l.parent_id === finalParentId
    );
    if (existing) return existing;

    // Insert new node into Supabase
    const { data, error } = await supabase
      .from("locations")
      .insert({
        name: name.trim(),
        type,
        parent_id: finalParentId,
        lat: lat || null,
        lng: lng || null,
      })
      .select()
      .single();

    if (error) {
      // Handle Unique Constraint (name, parent_id) collision gracefully
      if (error.code === "23505") {
        const { data: refetched } = await supabase
          .from("locations")
          .select("id, name, type, parent_id, lat, lng")
          .eq("name", name.trim())
          .eq("parent_id", finalParentId)
          .single();

        if (refetched) return refetched as LocationNode;
      }
      throw error;
    }

    const newNode = data as LocationNode;
    currentLocs.push(newNode);
    return newNode;
  };

  // When a user selects a specific OpenStreetMap suggestion (e.g. "Seville, Andalusia, Spain" or "Córdoba, Argentina")
  const handleSelectSuggestion = async (sugg: GeocodeSuggestion) => {
    setCreating(true);
    try {
      // Fetch fresh locations from DB to prevent stale state issues
      const { data: latestLocs, error: fetchErr } = await supabase
        .from("locations")
        .select("id, name, type, parent_id, lat, lng");
      if (fetchErr) throw fetchErr;

      const currentLocList = latestLocs as LocationNode[];
      let parentNodeId: string | null = selectedRegionId || selectedCountryId || null;

      // Automatically construct parent Country & Region hierarchy if missing
      if (!parentNodeId && sugg.country) {
        const countryNode = await getOrCreateLocationNode(
          sugg.country,
          "country",
          null,
          undefined,
          undefined,
          currentLocList
        );
        parentNodeId = countryNode.id;

        if (sugg.state && sugg.state.toLowerCase() !== sugg.country.toLowerCase()) {
          const regionNode = await getOrCreateLocationNode(
            sugg.state,
            "region",
            countryNode.id,
            undefined,
            undefined,
            currentLocList
          );
          parentNodeId = regionNode.id;
        }
      }

      const spotNode = await getOrCreateLocationNode(
        sugg.name,
        sugg.type || "spot",
        parentNodeId,
        sugg.lat,
        sugg.lng,
        currentLocList
      );

      await fetchLocations();
      handleSelectNode(spotNode);

      toast.success(
        `Created & selected "${sugg.name}" (${sugg.country || "GPS: " + sugg.lat + "°"})`
      );

      setNewSpotName("");
      setSuggestions([]);
      setIsCreatingNew(false);
    } catch (err: any) {
      console.error("Error creating location suggestion:", err);
      toast.error(err.message || "Failed to process location suggestion");
    } finally {
      setCreating(false);
    }
  };

  // Manual fallback location creation
  const handleCreateNewSpotManual = async () => {
    const cleanName = newSpotName.trim();
    if (!cleanName) {
      toast.error("Please enter a location spot name");
      return;
    }

    setCreating(true);
    try {
      const { data: latestLocs, error: fetchErr } = await supabase
        .from("locations")
        .select("id, name, type, parent_id, lat, lng");
      if (fetchErr) throw fetchErr;

      const currentLocList = latestLocs as LocationNode[];
      let parentId = selectedRegionId || selectedCountryId || null;
      let parentName = "";
      if (parentId) {
        const parentNode = currentLocList.find((l) => l.id === parentId);
        if (parentNode) parentName = parentNode.name;
      }

      const geocodeRes = await geocodeLocation(cleanName, parentName);

      // Auto-extract country/region from geocoded display name if available and no parent selected
      if (!parentId && geocodeRes?.displayName) {
        const parts = geocodeRes.displayName.split(",").map((p) => p.trim());
        if (parts.length >= 2) {
          const rawCountry = parts[parts.length - 1];
          const rawRegion = parts.length >= 3 ? parts[parts.length - 2] : undefined;

          const countryNode = await getOrCreateLocationNode(
            rawCountry,
            "country",
            null,
            undefined,
            undefined,
            currentLocList
          );
          parentId = countryNode.id;

          if (rawRegion && rawRegion.toLowerCase() !== rawCountry.toLowerCase() && rawRegion.toLowerCase() !== cleanName.toLowerCase()) {
            const regionNode = await getOrCreateLocationNode(
              rawRegion,
              "region",
              countryNode.id,
              undefined,
              undefined,
              currentLocList
            );
            parentId = regionNode.id;
          }
        }
      }

      const type = selectedRegionId ? "spot" : selectedCountryId ? "region" : "city";

      const newNode = await getOrCreateLocationNode(
        cleanName,
        type,
        parentId,
        geocodeRes?.lat,
        geocodeRes?.lng,
        currentLocList
      );

      await fetchLocations();
      handleSelectNode(newNode);

      setNewSpotName("");
      setSuggestions([]);
      setIsCreatingNew(false);

      if (geocodeRes) {
        toast.success(`Created "${cleanName}" with GPS: ${geocodeRes.lat}°, ${geocodeRes.lng}°`);
      } else {
        toast.success(`Created location "${cleanName}"`);
      }
    } catch (err: any) {
      console.error("Error creating location manually:", err);
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
          <Globe className="h-4 w-4 text-film-amber" />
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
                ? "bg-film-amber text-white font-bold shadow-sm"
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
                ? "bg-film-amber text-white font-bold shadow-sm"
                : "text-white/60 hover:text-white"
            }`}
          >
            Browse By Country
          </button>
        </div>
      </div>

      {/* Active Selection Display Banner */}
      {activeNode ? (
        <div className="p-3 bg-film-amber/10 border border-film-amber/30 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 truncate">
            <div className="p-1.5 rounded-full bg-film-amber/20 text-film-amber shrink-0">
              <Check className="h-3.5 w-3.5" />
            </div>
            <div className="flex flex-col truncate">
              <div className="font-semibold text-film-amber truncate">
                {buildFullName(activeNode)}
              </div>
              <div className="text-[10px] font-mono text-film-amber/70 uppercase tracking-widest flex items-center gap-2">
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
              className="h-7 px-2.5 border-film-amber/40 text-film-amber hover:bg-film-amber/20 text-[10px] font-mono uppercase tracking-wider cursor-pointer"
            >
              <Pencil className="h-3 w-3 mr-1" /> Edit
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearSelection}
              className="h-7 px-2 text-white/50 hover:text-white hover:bg-white/10 text-[10px] font-mono uppercase tracking-wider cursor-pointer"
            >
              Clear
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-white/[0.02] border border-dashed border-white/10 text-xs text-white/40 font-mono flex items-center justify-between">
          <span>No location selected for this album container.</span>
          <span className="text-[10px] uppercase text-film-amber">Optional</span>
        </div>
      )}

      {/* Mode 1: Instant Search Filter */}
      {activeTab === "search" && (
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-white/40" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search spots, regions, or countries (e.g. Seville, Teide, Spain)..."
              className="w-full bg-black/40 border-white/10 text-xs font-mono text-white placeholder-white/40 pl-9 pr-3 py-2 rounded-none focus-visible:ring-film-amber"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-[10px] font-mono text-white/40 hover:text-white"
              >
                CLEAR
              </button>
            )}
          </div>

          <ScrollArea className="h-48 border border-white/10 bg-black/20 p-2">
            <div className="space-y-1">
              {searchResults.length === 0 ? (
                <div className="p-4 text-center text-xs font-mono text-white/40 space-y-1">
                  <p>No existing locations match &quot;{searchQuery}&quot;</p>
                  <p className="text-[10px] text-film-amber uppercase">
                    Use &quot;Quick Add Location&quot; below to resolve &amp; save it!
                  </p>
                </div>
              ) : (
                searchResults.map((loc) => {
                  const isSelected = loc.id === selectedLocationId;
                  const fullName = buildFullName(loc);
                  const hierarchyStr = buildHierarchyString(loc);

                  return (
                    <div
                      key={loc.id}
                      onClick={() => handleSelectNode(loc)}
                      className={`group p-2 flex items-center justify-between text-xs cursor-pointer transition-all border ${
                        isSelected
                          ? "bg-film-amber/20 border-film-amber/40 text-film-amber font-semibold"
                          : "bg-white/[0.02] border-transparent hover:bg-white/[0.06] hover:border-white/10 text-white/80"
                      }`}
                    >
                      <div className="flex flex-col truncate pr-2">
                        <div className="flex items-center gap-2 truncate">
                          <MapPin className="h-3 w-3 text-film-amber shrink-0" />
                          <span className="truncate">{fullName}</span>
                          <span className="text-[9px] font-mono opacity-50 uppercase px-1 bg-white/10 shrink-0">
                            {loc.type}
                          </span>
                        </div>
                        {hierarchyStr && (
                          <span className="text-[10px] font-mono text-white/40 truncate pl-5">
                            {hierarchyStr}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={(e) => handleOpenEdit(loc, e)}
                          className="p-1 text-white/40 hover:text-film-amber transition-colors"
                          title="Edit Location Node"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Mode 2: Cascading Selectors */}
      {activeTab === "cascade" && (
        <div className="space-y-3">
          {/* Step 1: Select Country */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase tracking-widest text-white/60 flex items-center gap-1">
              <Globe className="h-3 w-3 text-film-amber" />
              1. Select Country or Sub-Region
            </label>
            <select
              value={selectedCountryId}
              onChange={(e) => {
                const id = e.target.value;
                setSelectedCountryId(id);
                setSelectedRegionId("");
                setSelectedSpotId("");
                const node = locations.find((l) => l.id === id);
                handleSelectNode(node || null);
              }}
              className="w-full h-9 bg-black/40 border border-white/15 text-white text-xs px-3 focus:outline-none focus:border-film-amber"
            >
              <option value="">-- Choose Country --</option>
              {countriesList.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#16181c] text-white">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Step 2: Select Region / Island */}
          {selectedCountryId && (
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-widest text-white/60 flex items-center gap-1">
                <Compass className="h-3 w-3 text-film-amber" />
                2. Select Island or Region (Optional)
              </label>
              <select
                value={selectedRegionId}
                onChange={(e) => {
                  const id = e.target.value;
                  setSelectedRegionId(id);
                  setSelectedSpotId("");
                  const node = locations.find((l) => l.id === id);
                  handleSelectNode(
                    node || locations.find((l) => l.id === selectedCountryId) || null
                  );
                }}
                className="w-full h-9 bg-black/40 border border-white/15 text-white text-xs px-3 focus:outline-none focus:border-film-amber"
              >
                <option value="">-- All Regions / Whole Country --</option>
                {regionsList.map((r) => (
                  <option key={r.id} value={r.id} className="bg-[#16181c] text-white">
                    {r.name} ({r.type})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Step 3: Select Specific Spot */}
          {selectedRegionId && spotsList.length > 0 && (
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-widest text-white/60 flex items-center gap-1">
                <MapPin className="h-3 w-3 text-film-amber" />
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
                className="w-full h-9 bg-black/40 border border-white/15 text-white text-xs px-3 focus:outline-none focus:border-film-amber"
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

      {/* Inline Create New Location Trigger & Suggestions Palette */}
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
            <Plus className="h-3.5 w-3.5 mr-1 text-film-amber" /> Quick Add Location
          </Button>
        </div>
      ) : (
        <div className="p-3.5 bg-black/60 border border-film-amber/40 space-y-3 relative">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-film-amber font-semibold flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-film-amber" /> Quick Add Location (With OSM Smart Suggestions)
            </span>
            <button
              type="button"
              onClick={() => {
                setIsCreatingNew(false);
                setNewSpotName("");
                setSuggestions([]);
              }}
              className="text-white/40 hover:text-white cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Type name (e.g. Seville, Teide National Park, Cordoba)..."
                value={newSpotName}
                onChange={(e) => setNewSpotName(e.target.value)}
                className="bg-black/40 border-white/15 text-xs text-white h-9 focus-visible:ring-film-amber"
              />
              <Button
                type="button"
                onClick={handleCreateNewSpotManual}
                disabled={creating || !newSpotName.trim()}
                className="bg-film-amber text-white hover:bg-film-amber/90 text-xs font-bold uppercase tracking-wider h-9 shrink-0 px-4 cursor-pointer"
              >
                {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save Location"}
              </Button>
            </div>

            {/* Smart Suggestions Box (e.g. Seville Spain, Teide National Park, etc.) */}
            {loadingSuggestions ? (
              <div className="p-2 text-[10px] font-mono text-film-amber/70 flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                Fetching geographic suggestions...
              </div>
            ) : suggestions.length > 0 ? (
              <div className="space-y-1.5 pt-1">
                <span className="text-[9px] font-mono uppercase tracking-widest text-white/50 block">
                  Select Geographic Match to Auto-Build Hierarchy &amp; GPS:
                </span>
                <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                  {suggestions.map((sugg, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectSuggestion(sugg)}
                      className="p-2.5 bg-white/5 hover:bg-film-amber/20 border border-white/10 hover:border-film-amber/40 transition-all cursor-pointer flex items-center justify-between text-xs group"
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <Navigation className="h-3.5 w-3.5 text-film-amber shrink-0 group-hover:scale-110 transition-transform" />
                        <div className="flex flex-col truncate">
                          <span className="font-bold text-white truncate">
                            {sugg.name}
                            {sugg.country && (
                              <span className="font-normal text-film-amber ml-1.5 text-[11px]">
                                ({sugg.state ? `${sugg.state}, ` : ""}{sugg.country})
                              </span>
                            )}
                          </span>
                          <span className="text-[9px] font-mono text-white/40 truncate">
                            {sugg.displayName}
                          </span>
                        </div>
                      </div>

                      <span className="text-[9px] font-mono text-film-amber/90 shrink-0 bg-black/40 px-2 py-0.5 border border-film-amber/30">
                        {sugg.lat}°, {sugg.lng}°
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
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
