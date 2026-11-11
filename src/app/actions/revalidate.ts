"use server";

import { revalidatePath } from "next/cache";

/**
 * On-demand revalidation Server Action.
 * Call this whenever albums or photos are updated, published, or reordered
 * in the admin dashboard to instantly purge the ISR cache and serve fresh content.
 */
export async function revalidateAlbumPaths(slug?: string) {
  try {
    // Revalidate home page exhibition gallery
    revalidatePath("/");
    // Revalidate destinations spatial index
    revalidatePath("/destinations");
    // Revalidate specific album view if slug provided
    if (slug) {
      revalidatePath(`/album/${slug}`);
    }
    return { success: true };
  } catch (err: any) {
    console.error("Failed to revalidate paths:", err);
    return { success: false, error: err?.message };
  }
}
