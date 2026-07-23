"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LogOut, MapPin, Loader2, FolderOpen } from "lucide-react";
import { AdminLogin } from "@/components/admin/admin-login";
import { CreateAlbumDialog } from "@/components/admin/create-album-dialog";
import { AlbumSidebar } from "@/components/admin/album-sidebar";
import { ImageUploader } from "@/components/admin/image-uploader";
import { EditorialGroupEditor } from "@/components/admin/editorial-group-editor";
import { AlbumAutoFillToolbar } from "@/components/admin/album-auto-fill-toolbar";
import { Album, Photo } from "@/lib/types";

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

  // Loading Screen
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0E1012] text-[#e8e5f0]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // LOGIN SCREEN
  if (!session) {
    return <AdminLogin onLoginSuccess={() => supabase.auth.getSession().then(({ data: { session } }) => setSession(session))} />;
  }

  const activeAlbum = albums.find((a) => a.id === selectedAlbumId);

  return (
    <div className="min-h-screen bg-[#0E1012] text-[#e8e5f0] p-6 md:p-12 transition-colors duration-400">
      {/* Dashboard Top bar */}
      <div className="mx-auto max-w-[1600px] flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-8 mb-12 gap-6">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight">
            Dashboard
          </h1>
          <p className="font-mono text-[10px] tracking-widest text-white/50 uppercase mt-1">
            Logged in as {session.user.email}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <CreateAlbumDialog
            isOpen={isAlbumModalOpen}
            onOpenChange={setIsAlbumModalOpen}
            onAlbumCreated={handleAlbumCreated}
          />

          <Button
            variant="outline"
            onClick={handleLogout}
            className="border-white/10 text-white hover:bg-white/5 rounded-none flex items-center gap-2 font-mono text-xs uppercase tracking-widest"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] grid grid-cols-1 lg:grid-cols-4 gap-12">
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
              {/* Album metadata info */}
              <div className="p-6 bg-white/5 border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h3 className="font-serif text-xl font-bold tracking-wide">
                    {activeAlbum.title}
                  </h3>
                  <p className="text-xs text-white/60 mt-1 max-w-xl">
                    {activeAlbum.description || "No description provided."}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono uppercase tracking-widest text-white/40">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {activeAlbum.location_path && activeAlbum.location_path.length > 0 
                      ? activeAlbum.location_path.map(n => n.name).join(" / ") 
                      : activeAlbum.location || "Unspecified Location"}
                  </span>
                  <span>•</span>
                  <span>{activeAlbum.date}</span>
                </div>
              </div>

              {/* AI Auto-Fill & Title Suggestions Toolbar */}
              <AlbumAutoFillToolbar
                album={activeAlbum}
                photosCount={photos.length}
                onAlbumUpdated={handleAlbumUpdated}
              />

              {/* Upload Drag & Drop Uploader */}
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
            <div className="text-center py-24 bg-white/5 border border-white/10 flex flex-col items-center justify-center">
              <FolderOpen className="h-10 w-10 text-white/30 mb-4" />
              <p className="font-serif font-bold text-sm tracking-widest uppercase">
                Select an Album
              </p>
              <p className="text-xs text-white/40 mt-1 max-w-xs">
                Choose an existing album from the sidebar or click "Create Album" to initialize a new collection.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
