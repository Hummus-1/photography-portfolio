"use client";

import { useEffect } from "react";

/**
 * ImageGuard adds global client-side protections:
 * 1. Disables context menu (right-click) on all images and protected canvas elements.
 * 2. Disables drag-and-drop actions on images.
 * 3. Prevents common browser shortcuts intended to save media (Ctrl+S / Cmd+S on image targets).
 */
export function ImageGuard() {
  useEffect(() => {
    // Prevent right-click context menu on images and protected elements
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const isImage =
        target.tagName === "IMG" ||
        target.tagName === "PICTURE" ||
        target.closest("img") ||
        target.closest("[data-protected-image]") ||
        target.classList.contains("protected-image");

      if (isImage) {
        e.preventDefault();
      }
    };

    // Prevent drag-to-desktop or drag-to-save on images
    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const isImage =
        target.tagName === "IMG" ||
        target.closest("img") ||
        target.closest("[data-protected-image]");

      if (isImage) {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", handleContextMenu, { capture: true });
    document.addEventListener("dragstart", handleDragStart, { capture: true });

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu, { capture: true });
      document.removeEventListener("dragstart", handleDragStart, { capture: true });
    };
  }, []);

  return null;
}
