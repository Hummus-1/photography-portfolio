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
    return { r: 217, g: 107, b: 39 }; // Fallback to --primary (#d96b27)
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
  
  // Performance optimization refs
  const accentRgbRef = useRef<RGB>({ r: 217, g: 107, b: 39 });
  const frameCountRef = useRef<number>(0);

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

  // Canvas render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = parent.clientWidth;
      height = parent.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);

      // Immediately fetch accent color on resize
      const rootStyles = getComputedStyle(document.documentElement);
      const accentHex =
        rootStyles.getPropertyValue("--primary").trim() ||
        rootStyles.getPropertyValue("--accent").trim() ||
        "#d96b27";
      accentRgbRef.current = hexToRgb(accentHex);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    let lastTime = performance.now();

    const render = (now: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = now;
      }

      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Periodically refresh accent color every 60 frames (~1 sec) instead of every frame
      if (frameCountRef.current % 60 === 0) {
        const rootStyles = getComputedStyle(document.documentElement);
        const accentHex =
          rootStyles.getPropertyValue("--primary").trim() ||
          rootStyles.getPropertyValue("--accent").trim() ||
          "#d96b27";
        accentRgbRef.current = hexToRgb(accentHex);
      }
      frameCountRef.current++;

      // Slow background rotation for visual grace
      rotationRef.current += dt * 0.025;

      // Total elapsed time in seconds
      const elapsedTime = (now - startTimeRef.current) / 1000;

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      // Preserve full animation scale regardless of reduced component height
      const scaleBase = Math.max(width * 0.7, height);
      const maxRadius = Math.min(scaleBase * 0.42, 340);

      // Draw 16 Golden Ratio Lines with optimized single-pass Path2D rendering
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

      animFrameId.current = requestAnimationFrame(render);
    };

    animFrameId.current = requestAnimationFrame(render);

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  // Renderer for 16 Golden Ratio Lines offset by 22.5-degree 2D directions with multi-tone shimmer
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

    ctx.save();
    ctx.rotate(rotation);

    lineConfigs.forEach((config, lineIdx) => {
      if (elapsedTime < config.startTime) return; // Wait for line's randomized start delay

      const activeTime = elapsedTime - config.startTime;
      const cycleDuration = config.legDuration * 2 + PEAK_PAUSE_DURATION + ROOT_PAUSE_DURATION;
      const cycleTime = activeTime % cycleDuration;

      // Calculate progress [0, 1]: forming outward -> 2s hold at max length -> retracting -> root turnaround
      let rawProgress = 0;
      if (cycleTime <= config.legDuration) {
        rawProgress = cycleTime / config.legDuration; // Forming outward
      } else if (cycleTime <= config.legDuration + PEAK_PAUSE_DURATION) {
        rawProgress = 1.0; // Hold at max length for 2 seconds
      } else if (cycleTime <= config.legDuration * 2 + PEAK_PAUSE_DURATION) {
        const retractTime = cycleTime - (config.legDuration + PEAK_PAUSE_DURATION);
        rawProgress = 1.0 - retractTime / config.legDuration; // Retracting back to root
      } else {
        rawProgress = 0.0; // Root turnaround
      }

      // Ease-Out curve: fast burst at the beginning, graceful deceleration at the end of line formation
      const easedProgress = 1 - Math.pow(1 - rawProgress, 2.2);

      const currentMaxTheta = MAX_TOTAL_THETA * easedProgress;
      if (currentMaxTheta <= 0.02) return;

      ctx.save();
      ctx.rotate(config.dirAngle);

      // Alpha modifier across 16 lines for clean depth layering
      const lineAlpha = 1.0 - (lineIdx % 4) * 0.05 - Math.floor(lineIdx / 4) * 0.03;

      // Single-pass Path2D generation: halves trigonometric calculations per frame
      const linePath = new Path2D();
      let started = false;
      for (let theta = 0; theta <= currentMaxTheta; theta += 0.016) {
        const radius = a * Math.exp(B_PARAM * theta);
        if (radius > maxRadius * 0.95) break;
        const x = radius * Math.cos(theta);
        const y = radius * Math.sin(theta);

        if (!started) {
          linePath.moveTo(x, y);
          started = true;
        } else {
          linePath.lineTo(x, y);
        }
      }

      // 1. Outer Bloom Stroke Pass
      ctx.shadowColor = `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${0.8 * lineAlpha})`;
      ctx.shadowBlur = 16;
      ctx.strokeStyle = `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${0.3 * lineAlpha})`;
      ctx.lineWidth = 4.5;
      ctx.stroke(linePath);

      // 2. Core Shimmering Multi-tone Golden Spiral Stroke
      const shimmerOffset = (Math.sin(elapsedTime * 1.8 + lineIdx * 0.4) + 1) * 0.06;

      const strokeGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, maxRadius * 0.95);
      strokeGrad.addColorStop(0, `rgba(255, 253, 245, ${0.98 * lineAlpha})`);
      strokeGrad.addColorStop(
        Math.min(0.38, 0.22 + shimmerOffset),
        `rgba(247, 226, 185, ${0.95 * lineAlpha})`
      );
      strokeGrad.addColorStop(
        Math.min(0.72, 0.52 + shimmerOffset),
        `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${0.85 * lineAlpha})`
      );
      strokeGrad.addColorStop(0.82, `rgba(195, 88, 32, ${0.7 * lineAlpha})`);
      strokeGrad.addColorStop(1, `rgba(${accent.r}, ${accent.g}, ${accent.b}, 0)`);

      ctx.shadowBlur = 10;
      ctx.shadowColor = `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${0.85 * lineAlpha})`;
      ctx.strokeStyle = strokeGrad;
      ctx.lineWidth = 2.8;
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
      className="relative w-full h-[340px] sm:h-[400px] lg:h-[450px] flex items-center justify-center select-none overflow-visible"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block bg-transparent"
      />
    </div>
  );
}
