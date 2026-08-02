"use client";

import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LogOut, MapPin, Loader2, FolderOpen, Eye, Sparkles, Layers, ShieldCheck, Database, ExternalLink } from "lucide-react";
import { Navigation } from "@/components/navigation";
import { AdminLogin } from "@/components/admin/admin-login";
import { CreateAlbumDialog } from "@/components/admin/create-album-dialog";
import { AlbumSidebar } from "@/components/admin/album-sidebar";
import { ImageUploader } from "@/components/admin/image-uploader";
import { EditorialGroupEditor } from "@/components/admin/editorial-group-editor";
import { AlbumAutoFillToolbar } from "@/components/admin/album-auto-fill-toolbar";
import { ThinkingOrb } from "@/components/admin/thinking-orb";
import { Album, Photo } from "@/lib/types";
import { isoToDDMMYYYY } from "@/components/ui/date-selector";

export default function AdminPage() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Dashboard states
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>("");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [albumLoading, setAlbumLoading] = useState(false);
  const [photosLoading, setPhotosLoading] = useState(false);
  const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false);

  // Check auth session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch albums once authenticated
  useEffect(() => {
    if (session) {
      fetchAlbums();
    }
  }, [session]);

  // Fetch photos when album changes
  useEffect(() => {
    if (selectedAlbumId) {
      fetchPhotos(selectedAlbumId);
    } else {
      setPhotos([]);
    }
  }, [selectedAlbumId]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.info("Logged out");
  };

  const fetchAlbums = async () => {
    setAlbumLoading(true);
    try {
      const { data, error } = await supabase
        .from("albums_with_locations")
        .select("*")
        .order("date", { ascending: false });

      if (error) throw error;
      setAlbums(data || []);
      if (data && data.length > 0 && !selectedAlbumId) {
        setSelectedAlbumId(data[0].id);
      }
    } catch (err: any) {
      toast.error(`Error loading albums: ${err.message}`);
    } finally {
      setAlbumLoading(false);
    }
  };

  const fetchPhotos = async (albumId: string) => {
    setPhotosLoading(true);
    try {
      const { data, error } = await supabase
        .from("photos")
        .select("*")
        .eq("album_id", albumId)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      setPhotos(data || []);
    } catch (err: any) {
      toast.error(`Error loading photos: ${err.message}`);
    } finally {
      setPhotosLoading(false);
    }
  };

  const handleAlbumCreated = (newAlbum: Album) => {
    setAlbums((prev) => [newAlbum, ...prev]);
    setSelectedAlbumId(newAlbum.id);
  };

  const handlePublishToggle = async (albumId: string, isPublished: boolean) => {
    try {
      const { error } = await supabase
        .from("albums")
        .update({ is_published: isPublished })
        .eq("id", albumId);

      if (error) throw error;
      setAlbums((prev) =>
        prev.map((alb) => (alb.id === albumId ? { ...alb, is_published: isPublished } : alb))
      );
      toast.success(isPublished ? "Album published" : "Album set to draft");
    } catch (err: any) {
      toast.error(`Failed to update publication: ${err.message}`);
    }
  };

  const handleFeaturedToggle = async (albumId: string, isFeatured: boolean) => {
    try {
      const { error } = await supabase
        .from("albums")
        .update({ is_featured: isFeatured })
        .eq("id", albumId);

      if (error) throw error;
      toast.success(isFeatured ? "Album featured on homepage" : "Album removed from homepage feature");
      setAlbums((prev) =>
        prev.map((alb) => (alb.id === albumId ? { ...alb, is_featured: isFeatured } : alb))
      );
    } catch (err: any) {
      toast.error(`Failed to update featured status: ${err.message}`);
    }
  };

  const handleDeleteAlbum = async (albumId: string) => {
    if (!confirm("Are you sure you want to delete this album and all its photos?")) return;
    try {
      const { error } = await supabase.from("albums").delete().eq("id", albumId);
      if (error) throw error;
      toast.success("Album deleted");
      setAlbums((prev) => prev.filter((alb) => alb.id !== albumId));
      if (selectedAlbumId === albumId) {
        setSelectedAlbumId("");
      }
    } catch (err: any) {
      toast.error(`Deletion failed: ${err.message}`);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm("Are you sure you want to delete this photo?")) return;
    try {
      const { error } = await supabase.from("photos").delete().eq("id", photoId);
      if (error) throw error;
      toast.success("Photo deleted");
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    } catch (err: any) {
      toast.error(`Delete failed: ${err.message}`);
    }
  };

  const handleUpdatePhoto = async (
    photoId: string,
    updates: {
      location?: string | null;
      tags: string[];
      score: number | null;
      description: string | null;
      exif?: any;
    }
  ) => {
    try {
      const { error } = await supabase
        .from("photos")
        .update(updates)
        .eq("id", photoId);

      if (error) throw error;
      toast.success("Photo updated successfully");
      
      setPhotos((prev) =>
        prev.map((p) => (p.id === photoId ? { ...p, ...updates } : p))
      );

      fetchAlbums();
    } catch (err: any) {
      toast.error(`Update failed: ${err.message}`);
      throw err;
    }
  };

  const handleSetCoverPhoto = async (photoUrl: string) => {
    if (!selectedAlbumId) return;
    try {
      const { error } = await supabase
        .from("albums")
        .update({ cover_image_url: photoUrl })
        .eq("id", selectedAlbumId);

      if (error) throw error;
      toast.success("Album cover updated!");
      handleAlbumCoverUpdated(selectedAlbumId, photoUrl);
    } catch (err: any) {
      toast.error(`Failed to update cover photo: ${err.message}`);
    }
  };

  const handleAlbumCoverUpdated = (albumId: string, coverUrl: string) => {
    setAlbums((prev) =>
      prev.map((a) => (a.id === albumId ? { ...a, cover_image_url: coverUrl } : a))
    );
  };

  const handleAlbumUpdated = (updatedAlbum: Album) => {
    setAlbums((prev) =>
      prev.map((a) => (a.id === updatedAlbum.id ? { ...a, ...updatedAlbum } : a))
    );
  };

  const stats = useMemo(() => {
    return {
      totalAlbums: albums.length,
      published: albums.filter((a) => a.is_published).length,
      featured: albums.filter((a) => a.is_featured).length,
    };
  }, [albums]);

  // Loading Screen
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#090A0C] text-[#e8e5f0]">
        <ThinkingOrb state="thinking" size="lg" label="Initializing Studio Engine" sublabel="Authenticating & syncing state" />
      </div>
    );
  }

  // LOGIN SCREEN
  if (!session) {
    return <AdminLogin onLoginSuccess={() => supabase.auth.getSession().then(({ data: { session } }) => setSession(session))} />;
  }

  const activeAlbum = albums.find((a) => a.id === selectedAlbumId);

  return (
    <div className="min-h-screen bg-[#090A0C] text-[#e8e5f0] pb-12 transition-colors duration-400">
      {/* Site Navigation Bar */}
      <Navigation />

      {/* Ambient background glow */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[300px] bg-film-amber/5 blur-[120px] pointer-events-none" />

      {/* Elevated Admin Control Header */}
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 md:px-12 pt-6 mb-8 relative z-10">
        <div className="p-6 sm:p-8 bg-[#121519]/80 backdrop-blur-2xl border border-white/10 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
          {/* Ambient radial glow backdrop */}
          <div className="absolute -top-12 -right-12 w-80 h-80 bg-film-amber/10 rounded-full blur-3xl pointer-events-none" />

          {/* Left title & session info */}
          <div className="space-y-3 z-10">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white">
                Admin Dashboard
              </h1>
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-300 font-mono text-[10px] uppercase tracking-widest">
                <span>System Live • R2 & Supabase</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-white/50">
              <span className="text-white/80 font-medium">Logged in as {session.user.email}</span>
              <span className="text-white/20">•</span>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 bg-white/5 border border-white/10 text-white/70 text-[10px] uppercase tracking-wider">
                  {stats.totalAlbums} Collections
                </span>
                <span className="px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] uppercase tracking-wider">
                  {stats.published} Published
                </span>
                <span className="px-2.5 py-0.5 bg-film-amber/10 border border-film-amber/20 text-film-amber text-[10px] uppercase tracking-wider font-semibold">
                  ★ {stats.featured} Featured
                </span>
              </div>
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-3 flex-wrap z-10">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/15 text-white font-mono text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
            >
              <ExternalLink className="h-3.5 w-3.5 text-film-amber" />
              <span>View Public Gallery</span>
            </a>

            <CreateAlbumDialog
              isOpen={isAlbumModalOpen}
              onOpenChange={setIsAlbumModalOpen}
              onAlbumCreated={handleAlbumCreated}
            />

            <Button
              variant="outline"
              onClick={handleLogout}
              className="border-white/10 text-white/70 hover:text-white hover:bg-white/10 rounded-none px-4 py-2 font-mono text-xs uppercase tracking-widest cursor-pointer flex items-center gap-2"
            >
              <LogOut className="h-4 w-4 text-red-400/80" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Grid Workspace */}
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 md:px-12 grid grid-cols-1 lg:grid-cols-4 gap-8 relative z-10">
        <AlbumSidebar
          albums={albums}
          selectedAlbumId={selectedAlbumId}
          onSelectAlbum={setSelectedAlbumId}
          albumLoading={albumLoading}
          onPublishToggle={handlePublishToggle}
          onFeaturedToggle={handleFeaturedToggle}
          onDeleteAlbum={handleDeleteAlbum}
        />

        {/* Main Section: Drag & Drop Upload and Interactive Collage Editor */}
        <div className="lg:col-span-3 space-y-8">
          {activeAlbum ? (
            <>
              {/* Album Metadata Banner Header */}
              <div className="p-6 bg-gradient-to-r from-white/[0.04] via-white/[0.02] to-white/[0.04] border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <div className="flex items-center gap-2">
                    <ThinkingOrb state={activeAlbum.is_published ? "success" : "idle"} size="sm" />
                    <h3 className="font-serif text-2xl font-bold tracking-wide text-white">
                      {activeAlbum.title}
                    </h3>
                  </div>
                  <p className="text-xs text-white/60 mt-1 max-w-xl">
                    {activeAlbum.description || "No description provided."}
                  </p>
                </div>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                  <div className="flex items-center gap-4 text-xs font-mono uppercase tracking-widest text-white/40">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-film-amber" />
                      {activeAlbum.location_path && activeAlbum.location_path.length > 0 
                        ? activeAlbum.location_path.map(n => n.name).join(" / ") 
                        : activeAlbum.location || "Unspecified Location"}
                    </span>
                    <span>•</span>
                    <span>{activeAlbum.date ? isoToDDMMYYYY(activeAlbum.date) : "Date pending"}</span>
                  </div>

                  <a
                    href={`/album/${activeAlbum.slug}?preview=true`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-film-amber/10 hover:bg-film-amber/20 border border-film-amber/30 text-film-amber font-mono text-xs uppercase tracking-wider transition-all"
                  >
                    <Eye className="h-4 w-4" />
                    Preview Album
                  </a>
                </div>
              </div>

              {/* AI Auto-Fill & Title Suggestions Toolbar */}
              <AlbumAutoFillToolbar
                album={activeAlbum}
                photosCount={photos.length}
                onAlbumUpdated={handleAlbumUpdated}
              />

              {/* Drag & Drop Image Uploader */}
              <ImageUploader
                selectedAlbumId={selectedAlbumId}
                photosCount={photos.length}
                albums={albums}
                onUploadComplete={() => {
                  fetchPhotos(selectedAlbumId);
                  fetchAlbums();
                }}
                onAlbumCoverUpdated={handleAlbumCoverUpdated}
              />

              {/* Editorial Layout & Row Grouping Editor */}
              <EditorialGroupEditor
                album={activeAlbum}
                photos={photos}
                photosLoading={photosLoading}
                coverImageUrl={activeAlbum.cover_image_url}
                onSetCoverPhoto={handleSetCoverPhoto}
                onDeletePhoto={handleDeletePhoto}
                onUpdatePhoto={handleUpdatePhoto}
                onSaveSuccess={() => fetchPhotos(selectedAlbumId)}
              />
            </>
          ) : (
            <div className="text-center py-28 bg-white/[0.02] border border-white/10 flex flex-col items-center justify-center space-y-3">
              <ThinkingOrb state="idle" size="lg" />
              <p className="font-serif font-bold text-base tracking-widest uppercase text-white">
                Select an Album Collection
              </p>
              <p className="text-xs text-white/40 max-w-xs font-mono">
                Choose an existing collection from the left sidebar or click "Create Album" to start a new project.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
