"use client";

import React, { useRef, useEffect } from "react";

// Golden Ratio Constants
const PHI = (1 + Math.sqrt(5)) / 2; // ~1.618033988749895
const GOLDEN_ANGLE = 137.50776405003785; // degrees
const B_PARAM = Math.log(PHI) / (Math.PI / 2); // ~0.3063489
const MAX_TOTAL_THETA = Math.log(0.95 / 0.0055) / B_PARAM; // ~16.8166 rad
const PEAK_PAUSE_DURATION = 2.0; // 2s hold at max length
const ROOT_PAUSE_DURATION = 0.1;

interface RGB {
  r: number;
  g: number;
  b: number;
}

function hexToRgb(hex: string): RGB {
  let cleaned = hex.trim().replace("#", "");
  if (cleaned.length === 3) {
    cleaned = cleaned.split("").map((c) => c + c).join("");
  }
  const num = parseInt(cleaned, 16);
  if (isNaN(num)) {
    return { r: 97, g: 132, b: 216 }; // Fallback to --primary (#6184D8)
  }
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

interface LineConfig {
  dirAngle: number;
  startTime: number;
  legDuration: number;
}

export function GoldenRatioHeroAnimation() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Animation Refs
  const animFrameId = useRef<number | null>(null);
  const rotationRef = useRef<number>(0);
  const startTimeRef = useRef<number | null>(null);
  const lineConfigsRef = useRef<LineConfig[]>([]);
  const isVisibleRef = useRef<boolean>(true);
  
  // Performance optimization refs
  const accentRgbRef = useRef<RGB>({ r: 97, g: 132, b: 216 });

  // Generate randomized line speeds and start delays once on component initialization
  if (lineConfigsRef.current.length === 0) {
    // 16 2D directions spaced 22.5 degrees (PI / 8) apart
    const directions = Array.from({ length: 16 }, (_, i) => (i * Math.PI) / 8);
    let accumulatedDelay = 0;

    lineConfigsRef.current = directions.map((dirAngle) => {
      // Random start delay between 0.25s and 0.65s relative to previous line
      const delay = 0.25 + Math.random() * 0.4;
      accumulatedDelay += delay;

      // Random speed/duration for each line (between 5.0s and 8.5s per leg)
      const legDuration = 5.0 + Math.random() * 3.5;

      return {
        dirAngle,
        startTime: accumulatedDelay,
        legDuration,
      };
    });
  }

  // Helper to fetch theme accent color without forced layout inside RAF
  const updateAccentColor = () => {
    if (typeof window === "undefined") return;
    const rootStyles = getComputedStyle(document.documentElement);
    const accentHex =
      rootStyles.getPropertyValue("--primary").trim() ||
      rootStyles.getPropertyValue("--accent").trim() ||
      "#6184D8";
    accentRgbRef.current = hexToRgb(accentHex);
  };

  // Canvas render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = 0;
    let height = 0;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = parent.clientWidth;
      height = parent.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      updateAccentColor();
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Observe theme attribute/class changes on <html> instead of polling getComputedStyle in RAF
    const themeObserver = new MutationObserver(() => {
      updateAccentColor();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style", "data-theme"],
    });

    // Check for user's reduced motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const prefersReducedMotion = mediaQuery.matches;

    let lastTime = performance.now();

    const drawFrame = (elapsedTime: number) => {
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const scaleBase = Math.max(width * 0.7, height);
      const maxRadius = Math.min(scaleBase * 0.42, 340);

      drawDirectionalSpirals(
        ctx,
        cx,
        cy,
        maxRadius,
        rotationRef.current,
        elapsedTime,
        accentRgbRef.current,
        lineConfigsRef.current
      );
    };

    // If reduced motion is requested, render a single elegant static snapshot
    if (prefersReducedMotion) {
      drawFrame(7.5);
      return () => {
        window.removeEventListener("resize", resizeCanvas);
        themeObserver.disconnect();
      };
    }

    const startAnimation = () => {
      if (animFrameId.current !== null) return;
      lastTime = performance.now();
      
      const render = (now: number) => {
        if (!isVisibleRef.current) {
          animFrameId.current = null;
          return;
        }

        if (startTimeRef.current === null) {
          startTimeRef.current = now;
        }

        const dt = Math.min((now - lastTime) / 1000, 0.1);
        lastTime = now;

        // Slow background rotation
        rotationRef.current += dt * 0.025;
        const elapsedTime = (now - startTimeRef.current) / 1000;

        drawFrame(elapsedTime);

        animFrameId.current = requestAnimationFrame(render);
      };

      animFrameId.current = requestAnimationFrame(render);
    };

    const stopAnimation = () => {
      if (animFrameId.current !== null) {
        cancelAnimationFrame(animFrameId.current);
        animFrameId.current = null;
      }
    };

    // IntersectionObserver to completely halt RAF when scrolled out of view
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting) {
          startAnimation();
        } else {
          stopAnimation();
        }
      },
      { rootMargin: "50px" }
    );

    observer.observe(container);

    return () => {
      stopAnimation();
      observer.disconnect();
      themeObserver.disconnect();
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  // Renderer for 16 Golden Ratio Lines with multi-pass bloom (GPU-friendly, no shadowBlur)
  const drawDirectionalSpirals = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    maxRadius: number,
    rotation: number,
    elapsedTime: number,
    accent: RGB,
    lineConfigs: LineConfig[]
  ) => {
    ctx.save();
    ctx.translate(cx, cy);

    // Deep ambient radial background glow
    const ambientPulse = ctx.createRadialGradient(0, 0, 0, 0, 0, maxRadius * 1.08);
    ambientPulse.addColorStop(0, `rgba(${accent.r}, ${accent.g}, ${accent.b}, 0.22)`);
    ambientPulse.addColorStop(0.45, `rgba(${accent.r}, ${accent.g}, ${accent.b}, 0.06)`);
    ambientPulse.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = ambientPulse;
    ctx.beginPath();
    ctx.arc(0, 0, maxRadius * 1.08, 0, Math.PI * 2);
    ctx.fill();

    const a = maxRadius * 0.0055;
    const maxPathRadius = maxRadius * 0.95;

    ctx.save();
    ctx.rotate(rotation);

    // Optimized theta step: 0.048 gives sub-pixel precision while cutting ~70% of math & vertex calculations
    const THETA_STEP = 0.048;

    lineConfigs.forEach((config, lineIdx) => {
      if (elapsedTime < config.startTime) return;

      const activeTime = elapsedTime - config.startTime;
      const cycleDuration = config.legDuration * 2 + PEAK_PAUSE_DURATION + ROOT_PAUSE_DURATION;
      const cycleTime = activeTime % cycleDuration;

      // Calculate progress [0, 1]
      let rawProgress = 0;
      if (cycleTime <= config.legDuration) {
        rawProgress = cycleTime / config.legDuration;
      } else if (cycleTime <= config.legDuration + PEAK_PAUSE_DURATION) {
        rawProgress = 1.0;
      } else if (cycleTime <= config.legDuration * 2 + PEAK_PAUSE_DURATION) {
        const retractTime = cycleTime - (config.legDuration + PEAK_PAUSE_DURATION);
        rawProgress = 1.0 - retractTime / config.legDuration;
      } else {
        rawProgress = 0.0;
      }

      // Ease-Out curve
      const easedProgress = 1 - Math.pow(1 - rawProgress, 2.2);
      const currentMaxTheta = MAX_TOTAL_THETA * easedProgress;
      if (currentMaxTheta <= 0.02) return;

      ctx.save();
      ctx.rotate(config.dirAngle);

      const lineAlpha = 1.0 - (lineIdx % 4) * 0.05 - Math.floor(lineIdx / 4) * 0.03;

      // High-performance Path2D generation
      const linePath = new Path2D();
      let started = false;
      for (let theta = 0; theta <= currentMaxTheta; theta += THETA_STEP) {
        const radius = a * Math.exp(B_PARAM * theta);
        if (radius > maxPathRadius) break;
        const x = radius * Math.cos(theta);
        const y = radius * Math.sin(theta);

        if (!started) {
          linePath.moveTo(x, y);
          started = true;
        } else {
          linePath.lineTo(x, y);
        }
      }

      // Layered GPU-friendly bloom strokes (replaces expensive Gaussian shadowBlur)
      // 1. Wide Ambient Halo Under-stroke
      ctx.strokeStyle = `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${0.12 * lineAlpha})`;
      ctx.lineWidth = 6.0;
      ctx.stroke(linePath);

      // 2. Mid Bloom Stroke
      ctx.strokeStyle = `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${0.32 * lineAlpha})`;
      ctx.lineWidth = 3.6;
      ctx.stroke(linePath);

      // 3. Core Shimmering Multi-tone Spiral Stroke
      const shimmerOffset = (Math.sin(elapsedTime * 1.8 + lineIdx * 0.4) + 1) * 0.06;

      const lightAccentR = Math.min(255, accent.r + 55);
      const lightAccentG = Math.min(255, accent.g + 55);
      const lightAccentB = Math.min(255, accent.b + 55);

      const darkAccentR = Math.round(accent.r * 0.7);
      const darkAccentG = Math.round(accent.g * 0.7);
      const darkAccentB = Math.round(accent.b * 0.7);

      const strokeGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, maxPathRadius);
      strokeGrad.addColorStop(0, `rgba(255, 255, 255, ${0.98 * lineAlpha})`);
      strokeGrad.addColorStop(
        Math.min(0.38, 0.22 + shimmerOffset),
        `rgba(${lightAccentR}, ${lightAccentG}, ${lightAccentB}, ${0.95 * lineAlpha})`
      );
      strokeGrad.addColorStop(
        Math.min(0.72, 0.52 + shimmerOffset),
        `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${0.85 * lineAlpha})`
      );
      strokeGrad.addColorStop(0.82, `rgba(${darkAccentR}, ${darkAccentG}, ${darkAccentB}, ${0.7 * lineAlpha})`);
      strokeGrad.addColorStop(1, `rgba(${accent.r}, ${accent.g}, ${accent.b}, 0)`);

      ctx.strokeStyle = strokeGrad;
      ctx.lineWidth = 2.0;
      ctx.stroke(linePath);

      ctx.restore();
    });

    ctx.restore(); // Restore line rotation transform

    // Hairline Golden Angle Rays for geometric backdrop
    ctx.save();
    ctx.strokeStyle = `rgba(${accent.r}, ${accent.g}, ${accent.b}, 0.06)`;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 8]);

    for (let i = 0; i < 12; i++) {
      const rayAngle = (i * GOLDEN_ANGLE * Math.PI) / 180;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(rayAngle) * maxRadius * 0.88, Math.sin(rayAngle) * maxRadius * 0.88);
      ctx.stroke();
    }
    ctx.restore();

    ctx.restore(); // Restore center translation
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[340px] sm:h-[400px] lg:h-[450px] flex items-center justify-center select-none overflow-visible will-change-transform"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block bg-transparent"
      />
    </div>
  );
}
