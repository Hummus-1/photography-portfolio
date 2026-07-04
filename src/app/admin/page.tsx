"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
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
import {
  Upload,
  Plus,
  LogOut,
  Camera,
  Image as ImageIcon,
  FolderOpen,
  MapPin,
  Trash2,
  Lock,
  Tag,
  Loader2,
} from "lucide-react";
import Image from "next/image";

interface Album {
  id: string;
  title: string;
  slug: string;
  description: string;
  location: string;
  date: string;
  cover_image_url: string | null;
  is_published: boolean;
}

interface Photo {
  id: string;
  url: string;
  thumbnail_url: string;
  location: string | null;
  tags: string[];
  color_palette: string[];
  sort_order: number;
  exif: any;
}

export default function AdminPage() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Dashboard states
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>("");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [albumLoading, setAlbumLoading] = useState(false);
  const [photosLoading, setPhotosLoading] = useState(false);

  // New Album Form
  const [newAlbumTitle, setNewAlbumTitle] = useState("");
  const [newAlbumDescription, setNewAlbumDescription] = useState("");
  const [newAlbumLocation, setNewAlbumLocation] = useState("");
  const [newAlbumDate, setNewAlbumDate] = useState("");
  const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false);

  // Upload States
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      toast.success("Successfully logged in");
    } catch (err: any) {
      toast.error(err.message || "Failed to log in");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.info("Logged out");
  };

  const fetchAlbums = async () => {
    setAlbumLoading(true);
    try {
      const { data, error } = await supabase
        .from("albums")
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

  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlbumTitle || !newAlbumDate || !newAlbumLocation) {
      toast.error("Please fill in required fields");
      return;
    }

    const slug = newAlbumTitle
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    try {
      const { data, error } = await supabase
        .from("albums")
        .insert({
          title: newAlbumTitle,
          slug,
          description: newAlbumDescription,
          location: newAlbumLocation,
          date: newAlbumDate,
          is_published: false,
        })
        .select()
        .single();

      if (error) throw error;
      toast.success("Album created successfully");
      setIsAlbumModalOpen(false);
      setAlbums((prev) => [data, ...prev]);
      setSelectedAlbumId(data.id);

      // Reset form
      setNewAlbumTitle("");
      setNewAlbumDescription("");
      setNewAlbumLocation("");
      setNewAlbumDate("");
    } catch (err: any) {
      toast.error(err.message || "Failed to create album");
    }
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

  const handleFileUpload = async (files: FileList) => {
    if (!selectedAlbumId) {
      toast.error("Please select or create an album first");
      return;
    }

    setUploading(true);
    const totalFiles = files.length;

    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession) {
        toast.error("Session expired. Please log in again.");
        return;
      }

      for (let i = 0; i < totalFiles; i++) {
        const file = files[i];
        setUploadProgress(`Uploading ${i + 1}/${totalFiles}: ${file.name}...`);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("albumId", selectedAlbumId);
        formData.append("sortOrder", (photos.length + i).toString());

        const res = await fetch("/api/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${currentSession.access_token}`,
          },
          body: formData,
        });

        const result = await res.json();
        if (!res.ok) {
          throw new Error(result.error || "Upload failed");
        }

        // Set cover image for album if it doesn't have one
        const currentAlbum = albums.find((a) => a.id === selectedAlbumId);
        if (currentAlbum && !currentAlbum.cover_image_url) {
          const coverUrl = result.photo.url;
          await supabase
            .from("albums")
            .update({ cover_image_url: coverUrl })
            .eq("id", selectedAlbumId);
          
          setAlbums((prev) =>
            prev.map((a) => (a.id === selectedAlbumId ? { ...a, cover_image_url: coverUrl } : a))
          );
        }
      }

      toast.success("All images uploaded successfully!");
      fetchPhotos(selectedAlbumId);
    } catch (err: any) {
      toast.error(`Upload error: ${err.message}`);
    } finally {
      setUploading(false);
      setUploadProgress("");
    }
  };

  // Drag and drop event handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
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
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#0E1012] px-6 text-[#e8e5f0]">
        <Card className="w-full max-w-md bg-[#14171a] border-white/10 text-white rounded-none">
          <CardHeader className="space-y-2 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/15">
              <Lock className="h-6 w-6 text-[#e8e5f0]" />
            </div>
            <CardTitle className="font-serif text-2xl font-bold tracking-wider uppercase">
              Admin Login
            </CardTitle>
            <CardDescription className="text-white/60 font-mono text-[10px] uppercase tracking-widest">
              Stills Photography Portal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-mono uppercase tracking-widest text-xs">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@stills.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-black/20 border-white/10 rounded-none h-11 focus-visible:ring-white focus:border-white text-white cursor-none"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="font-mono uppercase tracking-widest text-xs">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-black/20 border-white/10 rounded-none h-11 focus-visible:ring-white focus:border-white text-white cursor-none"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={loginLoading}
                className="w-full bg-[#e8e5f0] text-[#0E1012] hover:bg-[#d4d0de] transition-colors h-11 rounded-none font-bold uppercase tracking-widest text-xs cursor-none"
              >
                {loginLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Authenticate
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeAlbum = albums.find((a) => a.id === selectedAlbumId);

  // MAIN ADMIN TERMINAL DASHBOARD
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
          <Dialog open={isAlbumModalOpen} onOpenChange={setIsAlbumModalOpen}>
            <DialogTrigger render={
              <Button className="bg-[#e8e5f0] text-[#0E1012] hover:bg-[#d4d0de] rounded-none px-5 py-2.5 font-bold text-xs uppercase tracking-widest flex items-center gap-2 cursor-none">
                <Plus className="h-4 w-4" />
                Create Album
              </Button>
            } />
            <DialogContent className="bg-[#14171a] border-white/10 text-white rounded-none max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-serif text-xl font-bold uppercase tracking-wider">
                  New Photo Album
                </DialogTitle>
                <DialogDescription className="text-white/60 text-xs">
                  Create a new album container to organize and upload your photos.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateAlbum} className="space-y-5 pt-4">
                <div className="space-y-1.5">
                  <Label htmlFor="title" className="font-mono text-[10px] uppercase tracking-widest text-white/70">
                    Album Title *
                  </Label>
                  <Input
                    id="title"
                    value={newAlbumTitle}
                    onChange={(e) => setNewAlbumTitle(e.target.value)}
                    placeholder="e.g. Visit Greenland"
                    className="bg-black/20 border-white/10 rounded-none text-white focus-visible:ring-white cursor-none"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="location" className="font-mono text-[10px] uppercase tracking-widest text-white/70">
                      Location *
                    </Label>
                    <Input
                      id="location"
                      value={newAlbumLocation}
                      onChange={(e) => setNewAlbumLocation(e.target.value)}
                      placeholder="e.g. Greenland"
                      className="bg-black/20 border-white/10 rounded-none text-white focus-visible:ring-white cursor-none"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="date" className="font-mono text-[10px] uppercase tracking-widest text-white/70">
                      Date *
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={newAlbumDate}
                      onChange={(e) => setNewAlbumDate(e.target.value)}
                      className="bg-black/20 border-white/10 rounded-none text-white focus-visible:ring-white cursor-none"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="description" className="font-mono text-[10px] uppercase tracking-widest text-white/70">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={newAlbumDescription}
                    onChange={(e) => setNewAlbumDescription(e.target.value)}
                    placeholder="Describe this photo collection..."
                    rows={4}
                    className="bg-black/20 border-white/10 rounded-none text-white focus-visible:ring-white resize-none cursor-none"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                  <DialogClose render={
                    <Button type="button" variant="outline" className="border-white/10 text-white rounded-none hover:bg-white/5 cursor-none font-mono uppercase tracking-wider text-xs">
                      Cancel
                    </Button>
                  } />
                  <Button type="submit" className="bg-[#e8e5f0] text-[#0E1012] hover:bg-[#d4d0de] rounded-none cursor-none font-bold uppercase tracking-wider text-xs">
                    Create
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            onClick={handleLogout}
            className="border-white/10 text-white hover:bg-white/5 rounded-none flex items-center gap-2 font-mono text-xs uppercase tracking-widest cursor-none"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] grid grid-cols-1 lg:grid-cols-4 gap-12">
        
        {/* Sidebar: Album list selection */}
        <div className="space-y-6 lg:col-span-1 border-r border-white/10 pr-6 lg:pr-12">
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-white/40 mb-6">
            <FolderOpen className="h-4 w-4" />
            <span>Select Album</span>
          </div>

          {albumLoading ? (
            <div className="flex py-10 justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-white/50" />
            </div>
          ) : albums.length === 0 ? (
            <p className="text-sm text-white/40 italic">No albums created yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {albums.map((album) => {
                const isSelected = album.id === selectedAlbumId;
                return (
                  <div
                    key={album.id}
                    className={`relative p-4 flex flex-col items-start text-left cursor-none transition-all duration-300 border ${
                      isSelected
                        ? "bg-white/5 border-white/20 text-[#e8e5f0]"
                        : "border-transparent text-white/60 hover:text-white hover:bg-white/5"
                    }`}
                    onClick={() => setSelectedAlbumId(album.id)}
                  >
                    <div className="flex w-full items-center justify-between gap-3 mb-2">
                      <h4 className="font-serif font-bold text-sm tracking-wide truncate">
                        {album.title}
                      </h4>
                      {!album.is_published && (
                        <span className="text-[8px] font-mono tracking-widest bg-white/10 text-white/60 px-1.5 py-0.5 uppercase">
                          Draft
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-white/40 uppercase">
                      <MapPin className="h-3 w-3" />
                      <span>{album.location}</span>
                    </div>

                    <div className="w-full flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                      {/* Publish Switcher */}
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <Switch
                          id={`pub-${album.id}`}
                          checked={album.is_published}
                          onCheckedChange={(checked) => handlePublishToggle(album.id, checked)}
                          className="scale-75 cursor-none"
                        />
                        <Label htmlFor={`pub-${album.id}`} className="text-[9px] font-mono uppercase tracking-widest text-white/50 cursor-none">
                          Published
                        </Label>
                      </div>

                      {/* Delete album */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAlbum(album.id);
                        }}
                        className="text-white/40 hover:text-red-400 p-1 cursor-none transition-colors"
                        title="Delete Album"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Main Section: Drag & Drop Upload and Photo management */}
        <div className="lg:col-span-3 space-y-12">
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
                    {activeAlbum.location}
                  </span>
                  <span>•</span>
                  <span>{activeAlbum.date}</span>
                </div>
              </div>

              {/* Upload Drag & Drop Uploader */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed py-14 flex flex-col items-center justify-center transition-all duration-300 rounded-none cursor-none ${
                  dragActive
                    ? "border-[#e8e5f0] bg-white/5"
                    : "border-white/10 hover:border-white/20 hover:bg-white/5"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                  multiple
                  accept="image/*"
                  className="hidden"
                />

                {uploading ? (
                  <div className="flex flex-col items-center gap-4 text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-[#e8e5f0]" />
                    <p className="font-mono text-sm tracking-wider">{uploadProgress}</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
                      <Upload className="h-6 w-6 text-white/60" />
                    </div>
                    <p className="font-serif font-bold text-sm tracking-wider">
                      Drag & drop images here or click to browse
                    </p>
                    <p className="font-mono text-[9px] text-white/40 uppercase tracking-widest">
                      Supports high-resolution JPEG, PNG, TIFF, and RAW files
                    </p>
                  </div>
                )}
              </div>

              {/* Photos List display */}
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h4 className="font-serif text-lg font-bold tracking-wide flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 opacity-70" />
                    <span>Album Photos ({photos.length})</span>
                  </h4>
                </div>

                {photosLoading ? (
                  <div className="flex py-20 justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-white/50" />
                  </div>
                ) : photos.length === 0 ? (
                  <p className="text-sm text-white/40 italic py-10 text-center">
                    No photos uploaded to this album yet. Drag and drop to begin!
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {photos.map((photo) => (
                      <Card
                        key={photo.id}
                        className="bg-[#14171a] border-white/10 rounded-none text-white overflow-hidden flex flex-col justify-between"
                      >
                        <div className="relative aspect-[3/2] w-full bg-black/20">
                          <Image
                            src={photo.thumbnail_url || photo.url}
                            alt=""
                            fill
                            sizes="(max-width: 768px) 100vw, 350px"
                            className="object-cover"
                          />
                          <button
                            onClick={() => handleDeletePhoto(photo.id)}
                            className="absolute top-3 right-3 bg-black/75 hover:bg-red-500/80 p-2 rounded-none transition-colors border border-white/10 cursor-none"
                            title="Delete Photo"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <CardContent className="p-4 space-y-4">
                          {/* EXIF parameters summary */}
                          {photo.exif.camera && (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 text-xs font-semibold text-white/80">
                                <Camera className="h-3.5 w-3.5 opacity-70" />
                                <span className="truncate">{photo.exif.camera}</span>
                              </div>
                              <div className="text-[10px] font-mono text-white/40">
                                {[
                                  photo.exif.focal_length,
                                  photo.exif.aperture,
                                  photo.exif.shutter,
                                  photo.exif.iso ? `ISO ${photo.exif.iso}` : null,
                                ]
                                  .filter(Boolean)
                                  .join(" • ")}
                              </div>
                            </div>
                          )}

                          {/* Color Palette bar */}
                          {photo.color_palette && photo.color_palette.length > 0 && (
                            <div className="flex gap-1.5">
                              {photo.color_palette.map((color, idx) => (
                                <div
                                  key={idx}
                                  className="h-3 flex-grow border border-white/5"
                                  style={{ backgroundColor: color }}
                                  title={color}
                                />
                              ))}
                            </div>
                          )}

                          {/* Tags Display */}
                          {photo.tags && photo.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {photo.tags.map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="text-[8px] font-mono uppercase bg-white/5 border border-white/10 px-1.5 py-0.5 text-white/60 tracking-wider flex items-center gap-1"
                                >
                                  <Tag className="h-2 w-2" />
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
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
