export interface EXIFData {
  camera?: string;
  lens?: string;
  iso?: number;
  aperture?: string;
  shutter?: string;
  focal_length?: string;
  date_taken?: string;
  gps?: {
    latitude: number;
    longitude: number;
  };
}

export interface LocationNode {
  id: string;
  name: string;
  type: string;
  iso_code?: string;
  lat?: number;
  lng?: number;
}

export interface Photo {
  id: string;
  url: string;
  thumbnail_url: string;
  width: number;
  height: number;
  aspect_ratio: number;
  location: string | null;
  tags: string[];
  color_palette: string[];
  sort_order: number;
  exif: EXIFData;
  score?: number | null;
  description?: string | null;
}

export interface Album {
  id: string;
  title: string;
  slug: string;
  description: string;
  location: string | null; // legacy flat location string
  location_id?: string | null;
  location_path?: LocationNode[];
  date: string;
  cover_image_url: string | null;
  is_published: boolean;
  tags: string[];
  cover_color_palette?: string[];
  score?: number | null;
  lat?: number;
  lng?: number;
  country_code?: string;
}

