"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronLeft, ChevronRight, Layers } from "lucide-react";
import { Photo } from "@/lib/types";

interface TimelineProps {
  photos: Photo[];
  activePhotoId: string;
}

interface TimelineNodeItem {
  id: string;
  type: "single" | "group";
  photos: Photo[];
  firstPhoto: Photo;
  globalIndices: number[];
}

function getTimelineNodes(photos: Photo[]): TimelineNodeItem[] {
  const nodes: TimelineNodeItem[] = [];
  let i = 0;
  while (i < photos.length) {
    const current = photos[i];
    if (current.group_id) {
      const gId = current.group_id;
      const groupPhotos: Photo[] = [current];
      const indices: number[] = [i];
      let j = i + 1;
      while (j < photos.length && photos[j].group_id === gId) {
        groupPhotos.push(photos[j]);
        indices.push(j);
        j++;
      }
      if (groupPhotos.length > 1) {
        nodes.push({
          id: `photo-${current.id}`,
          type: "group",
          photos: groupPhotos,
          firstPhoto: current,
          globalIndices: indices,
        });
        i = j;
        continue;
      }
    }
    nodes.push({
      id: `photo-${current.id}`,
      type: "single",
      photos: [current],
      firstPhoto: current,
      globalIndices: [i],
    });
    i++;
  }
  return nodes;
}

export function Timeline({ photos, activePhotoId }: TimelineProps) {
  const nodes = getTimelineNodes(photos);

  // Find active node index
  const activeNodeIndex = nodes.findIndex((node) =>
    node.photos.some((p) => `photo-${p.id}` === activePhotoId)
  );
  const currentNodeIndex = activeNodeIndex >= 0 ? activeNodeIndex : 0;

  // Scroll triggers for fading in the vertical desktop timeline
  const { scrollY } = useScroll();
  const timelineOpacity = useTransform(scrollY, [200, 500], [0, 1]);
  const timelineTranslateX = useTransform(scrollY, [200, 500], [-15, 0]);

  // Height percentage for vertical timeline progress track
  const timelineFillPercentage =
    nodes.length > 1 ? currentNodeIndex / (nodes.length - 1) : 0;

  const scrollToPhoto = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const rect = element.getBoundingClientRect();
      const elementTop = rect.top + window.scrollY;
      const elementHeight = rect.height;
      const viewportHeight = window.innerHeight;

      let targetScroll = elementTop - viewportHeight / 2 + elementHeight / 2;
      const minTopSpacing = 110;
      if (elementTop - targetScroll < minTopSpacing) {
        targetScroll = elementTop - minTopSpacing;
      }

      if (typeof window !== "undefined" && (window as any).lenis) {
        (window as any).lenis.scrollTo(targetScroll, { duration: 1.2 });
      } else {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  const navigateNode = (dir: "next" | "prev") => {
    const nextIdx = dir === "next" ? currentNodeIndex + 1 : currentNodeIndex - 1;
    if (nextIdx >= 0 && nextIdx < nodes.length) {
      scrollToPhoto(nodes[nextIdx].id);
    }
  };

  return (
    <>
      {/* Sticky Interactive Timeline Sidebar (Desktop) */}
      <aside className="hidden lg:block w-20 shrink-0 relative z-30">
        <motion.div
          style={{ opacity: timelineOpacity, x: timelineTranslateX }}
          className="sticky top-28 h-[calc(100vh-200px)] flex flex-col items-center justify-center z-30"
        >
          {/* Timeline Vertical Track */}
          <div className="relative h-[65vh] flex flex-col justify-between py-4 items-center">
            {/* Background and Foreground tracks */}
            <div className="absolute top-0 bottom-0 left-[11px] w-[2px] bg-foreground/10 rounded-full">
              <motion.div
                className="absolute top-0 left-0 right-0 bg-foreground origin-top rounded-full"
                animate={{ height: `${timelineFillPercentage * 100}%` }}
                transition={{ type: "spring", stiffness: 80, damping: 20 }}
              />
            </div>

            {/* Render 1 Dot per Node (grouped rows collapsed into 1 single dot) */}
            {nodes.map((node, nodeIdx) => {
              const isActive = node.photos.some((p) => `photo-${p.id}` === activePhotoId);
              const isGroup = node.type === "group";

              return (
                <div key={node.id} className="relative flex items-center group/node z-10">
                  <button
                    onClick={() => scrollToPhoto(node.id)}
                    className="w-6 h-6 flex items-center justify-center focus:outline-none cursor-pointer"
                    aria-label={
                      isGroup
                        ? `Jump to photo row group ${nodeIdx + 1}`
                        : `Jump to photo ${node.globalIndices[0] + 1}`
                    }
                  >
                    <motion.div
                      animate={{
                        scale: isActive ? (isGroup ? 1.4 : 1.3) : 1,
                        backgroundColor: isActive ? "var(--foreground)" : "var(--background)",
                        borderColor: isActive ? "var(--foreground)" : "var(--foreground)",
                      }}
                      transition={{ duration: 0.3 }}
                      className={`rounded-full border-2 border-foreground ${
                        isGroup ? "w-4 h-4 ring-2 ring-foreground/20" : "w-3.5 h-3.5"
                      }`}
                    />
                  </button>

                  {/* Timeline Node Hover Preview Card */}
                  <div className="absolute left-8 opacity-0 translate-x-2 pointer-events-none group-hover/node:opacity-100 group-hover/node:translate-x-0 transition-all duration-300 z-30">
                    <div className="flex items-center gap-3 p-2 bg-background/95 border border-foreground/15 rounded-2xl shadow-xl backdrop-blur-md w-52 select-none">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-foreground/5 flex items-center justify-center border border-foreground/10">
                        <Image
                          src={node.firstPhoto.thumbnail_url || node.firstPhoto.url}
                          alt=""
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1 text-[9px] font-mono text-foreground/45 uppercase tracking-wider">
                          {isGroup ? (
                            <>
                              <Layers className="h-3 w-3" />
                              <span>Row Group ({node.photos.length})</span>
                            </>
                          ) : (
                            <span>Still #{node.globalIndices[0] + 1}</span>
                          )}
                        </div>
                        <span className="text-xs font-semibold truncate text-foreground/90">
                          {node.firstPhoto.location || (isGroup ? `${node.photos.length} Photos` : `Frame #${node.globalIndices[0] + 1}`)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="w-px h-12 bg-foreground/10 mt-6" />
          <span className="text-[9px] font-mono tracking-widest rotate-90 origin-center whitespace-nowrap mt-8 text-foreground/40 font-semibold uppercase">
            Timeline
          </span>
        </motion.div>
      </aside>

      {/* Mobile Floating Scrubber */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-xs h-12 bg-background/85 border border-foreground/10 rounded-full shadow-2xl backdrop-blur-xl z-40 flex items-center justify-between px-3">
        <button
          onClick={() => navigateNode("prev")}
          className="p-1.5 rounded-full hover:bg-foreground/5 text-foreground/60 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          disabled={currentNodeIndex === 0}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <span className="text-[10px] font-mono font-medium uppercase tracking-widest text-foreground/75">
          Section {String(currentNodeIndex + 1).padStart(2, "0")} / {String(nodes.length).padStart(2, "0")}
        </span>

        <button
          onClick={() => navigateNode("next")}
          className="p-1.5 rounded-full hover:bg-foreground/5 text-foreground/60 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          disabled={currentNodeIndex === nodes.length - 1}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </>
  );
}
