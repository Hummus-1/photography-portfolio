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
}

export interface Album {
  id: string;
  title: string;
  slug: string;
  description: string;
  location: string;
  date: string;
  cover_image_url: string | null;
  is_published: boolean;
}
