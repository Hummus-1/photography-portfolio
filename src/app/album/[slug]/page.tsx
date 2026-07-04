import { supabase } from "@/lib/supabase";
import { Navigation } from "@/components/navigation";
import { AlbumViewer } from "@/components/album-viewer";
import { notFound } from "next/navigation";

interface Photo {
  id: string;
  url: string;
  thumbnail_url: string;
  width: number;
  height: number;
  aspect_ratio: number;
  location: string | null;
  tags: string[];
  color_palette: string[];
  exif: any;
}

interface Album {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  cover_image_url: string;
}

// Complete mock datasets for full local fidelity before DB is set up
const MOCK_ALBUMS: { [key: string]: { album: Album; photos: Photo[] } } = {
  "visit-greenland": {
    album: {
      id: "mock-1",
      title: "Visit Greenland",
      description: "Commissioned by Visit Greenland, this collection captures the essence of Greenland's breathtaking glaciers, iceberg-filled fjords, and vibrant cultural heritage.",
      location: "Greenland",
      date: "2023-03-15",
      cover_image_url: "https://images.unsplash.com/photo-1517783999520-f068d7431a60?auto=format&fit=crop&q=80&w=1600",
    },
    photos: [
      {
        id: "g1",
        url: "https://images.unsplash.com/photo-1517783999520-f068d7431a60?auto=format&fit=crop&q=80&w=1600",
        thumbnail_url: "https://images.unsplash.com/photo-1517783999520-f068d7431a60?auto=format&fit=crop&q=80&w=300",
        width: 1600,
        height: 1066,
        aspect_ratio: 1.5,
        location: "Disko Bay Glaciers",
        tags: ["glacier", "iceberg", "arctic", "nature", "blue", "water"],
        color_palette: ["#1F2B3E", "#4B6584", "#A5B1C2", "#D1D8E0", "#F1F2F6"],
        exif: {
          camera: "Sony ILCE-7RM5",
          lens: "FE 24-70mm F2.8 GM II",
          iso: 100,
          aperture: "f/8.0",
          shutter: "1/400s",
          focal_length: "35mm",
        },
      },
      {
        id: "g2",
        url: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=800",
        thumbnail_url: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=300",
        width: 800,
        height: 1200,
        aspect_ratio: 0.67,
        location: "Nuuk Color Cabins",
        tags: ["architecture", "cabin", "red", "snow", "winter", "cozy"],
        color_palette: ["#8B0000", "#D3D3D3", "#1A1A1A", "#FFFFFF", "#2F4F4F"],
        exif: {
          camera: "Sony ILCE-7RM5",
          lens: "FE 50mm F1.2 GM",
          iso: 250,
          aperture: "f/1.2",
          shutter: "1/1000s",
          focal_length: "50mm",
        },
      },
      {
        id: "g3",
        url: "https://images.unsplash.com/photo-1520637695736-3d36881c1626?auto=format&fit=crop&q=80&w=1600",
        thumbnail_url: "https://images.unsplash.com/photo-1520637695736-3d36881c1626?auto=format&fit=crop&q=80&w=300",
        width: 1600,
        height: 940,
        aspect_ratio: 1.7,
        location: "Ilulissat Icefjord",
        tags: ["iceberg", "sea", "ocean", "landscape", "aerial", "minimalist"],
        color_palette: ["#0C1E36", "#2D4B75", "#7D97BC", "#C4D4E8", "#EAF0F6"],
        exif: {
          camera: "Sony ILCE-7RM5",
          lens: "FE 70-200mm F2.8 GM OSS II",
          iso: 100,
          aperture: "f/5.6",
          shutter: "1/800s",
          focal_length: "135mm",
        },
      },
      {
        id: "g4",
        url: "https://images.unsplash.com/photo-1489674261821-fc92859c151e?auto=format&fit=crop&q=80&w=800",
        thumbnail_url: "https://images.unsplash.com/photo-1489674261821-fc92859c151e?auto=format&fit=crop&q=80&w=300",
        width: 800,
        height: 1000,
        aspect_ratio: 0.8,
        location: "Qeqertarsuaq Volcanic Beach",
        tags: ["black sand", "coast", "water", "foggy", "moody", "monochrome"],
        color_palette: ["#111111", "#444444", "#888888", "#CCCCCC", "#EEEEEE"],
        exif: {
          camera: "Sony ILCE-7RM5",
          lens: "FE 24-70mm F2.8 GM II",
          iso: 400,
          aperture: "f/4.0",
          shutter: "1/200s",
          focal_length: "24mm",
        },
      },
      {
        id: "g5",
        url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=1600",
        thumbnail_url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=300",
        width: 1600,
        height: 1066,
        aspect_ratio: 1.5,
        location: "Tasiilaq Fjords",
        tags: ["nature", "mountain", "sunset", "reflection", "lake", "orange"],
        color_palette: ["#3D251E", "#72473B", "#B68B75", "#E4C5AF", "#2E3A46"],
        exif: {
          camera: "Sony ILCE-7RM5",
          lens: "FE 24-70mm F2.8 GM II",
          iso: 100,
          aperture: "f/11",
          shutter: "1/5s",
          focal_length: "45mm",
        },
      },
    ],
  },
  "inspired-by-iceland": {
    album: {
      id: "mock-2",
      title: "Inspired by Iceland",
      description: "An exploration of Iceland's raw volcanic landscapes, towering waterfalls, and moody black sand beaches under the midnight sun.",
      location: "Iceland",
      date: "2024-06-20",
      cover_image_url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=1600",
    },
    photos: [
      {
        id: "i1",
        url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=1600",
        thumbnail_url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=300",
        width: 1600,
        height: 1066,
        aspect_ratio: 1.5,
        location: "Skógafoss Waterfall",
        tags: ["waterfall", "nature", "mist", "rainbow", "green", "landscape"],
        color_palette: ["#0F1E19", "#294639", "#5F7D6B", "#A4BCA9", "#E1ECE5"],
        exif: {
          camera: "Sony ILCE-7RM5",
          lens: "FE 16-35mm F2.8 GM II",
          iso: 100,
          aperture: "f/11",
          shutter: "1/2s",
          focal_length: "18mm",
        },
      },
      {
        id: "i2",
        url: "https://images.unsplash.com/photo-1504893524553-ac55fce69cbf?auto=format&fit=crop&q=80&w=800",
        thumbnail_url: "https://images.unsplash.com/photo-1504893524553-ac55fce69cbf?auto=format&fit=crop&q=80&w=300",
        width: 800,
        height: 1200,
        aspect_ratio: 0.67,
        location: "Vík Black Sand Beach",
        tags: ["sea", "cliffs", "moody", "fog", "waves", "dark"],
        color_palette: ["#09090C", "#25262B", "#5C5E62", "#A6A8AB", "#D9DBDD"],
        exif: {
          camera: "Sony ILCE-7RM5",
          lens: "FE 24-70mm F2.8 GM II",
          iso: 400,
          aperture: "f/5.6",
          shutter: "1/250s",
          focal_length: "70mm",
        },
      },
    ],
  },
  "follow-the-tracks": {
    album: {
      id: "mock-3",
      title: "Follow the Tracks",
      description: "Documenting the nomadic lifestyle and endless steppes of Mongolia, following the tracks of ancient horse cultures.",
      location: "Mongolia",
      date: "2025-09-05",
      cover_image_url: "https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&q=80&w=1600",
    },
    photos: [
      {
        id: "m1",
        url: "https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&q=80&w=1600",
        thumbnail_url: "https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&q=80&w=300",
        width: 1600,
        height: 1066,
        aspect_ratio: 1.5,
        location: "Altai Mountains",
        tags: ["mountains", "steppes", "clouds", "nomadic", "landscape", "adventure"],
        color_palette: ["#3D3528", "#6D5F4A", "#A19277", "#DCD5C5", "#1C2D37"],
        exif: {
          camera: "Sony ILCE-7RM5",
          lens: "FE 24-70mm F2.8 GM II",
          iso: 100,
          aperture: "f/7.1",
          shutter: "1/500s",
          focal_length: "28mm",
        },
      },
    ],
  },
};

async function getAlbumData(slug: string) {
  // Try to load from database first
  try {
    const { data: album, error: albumError } = await supabase
      .from("albums")
      .select("*")
      .eq("slug", slug)
      .single();

    if (albumError || !album) {
      // Return mock if database returns error or empty (which happens before DB setup is complete)
      if (MOCK_ALBUMS[slug]) {
        return MOCK_ALBUMS[slug];
      }
      return null;
    }

    const { data: photos, error: photosError } = await supabase
      .from("photos")
      .select("*")
      .eq("album_id", album.id)
      .order("sort_order", { ascending: true });

    if (photosError) {
      throw photosError;
    }

    return {
      album: album as Album,
      photos: (photos || []) as Photo[],
    };
  } catch {
    if (MOCK_ALBUMS[slug]) {
      return MOCK_ALBUMS[slug];
    }
    return null;
  }
}

interface AlbumPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function AlbumPage({ params }: AlbumPageProps) {
  const { slug } = await params;
  const data = await getAlbumData(slug);

  if (!data) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-background transition-colors duration-400">
      <Navigation />
      <AlbumViewer album={data.album} photos={data.photos} />
    </div>
  );
}
