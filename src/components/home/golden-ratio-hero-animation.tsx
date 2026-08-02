"use client";

import React, { useRef, useEffect } from "react";

// Golden Ratio Constant Phi
const PHI = (1 + Math.sqrt(5)) / 2; // ~1.618033988749895
const GOLDEN_ANGLE = 137.50776405003785; // degrees

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
    return { r: 217, g: 107, b: 39 }; // Fallback to --film-amber (#d96b27)
  }
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function GoldenRatioHeroAnimation() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Animation Refs
  const animFrameId = useRef<number | null>(null);
  const rotationRef = useRef<number>(0);
  const startTimeRef = useRef<number | null>(null);

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

      // Slow background rotation for visual grace
      rotationRef.current += dt * 0.03;

      // Total elapsed time in seconds
      const elapsedTime = (now - startTimeRef.current) / 1000;

      ctx.clearRect(0, 0, width, height);

      // Fetch dynamic website accent color (--film-amber / --accent)
      const rootStyles = getComputedStyle(document.documentElement);
      const accentHex =
        rootStyles.getPropertyValue("--film-amber").trim() ||
        rootStyles.getPropertyValue("--accent").trim() ||
        "#d96b27";
      const accentRgb = hexToRgb(accentHex);

      const cx = width / 2;
      const cy = height / 2;
      // Preserve full animation scale regardless of reduced component height
      const scaleBase = Math.max(width * 0.7, height);
      const maxRadius = Math.min(scaleBase * 0.42, 340);

      // Draw 4 Staggered Golden Ratio Lines (0.5s delay each, in 4 2D directions)
      drawFourDirectionalSpirals(
        ctx,
        cx,
        cy,
        maxRadius,
        rotationRef.current,
        elapsedTime,
        accentRgb
      );

      animFrameId.current = requestAnimationFrame(render);
    };

    animFrameId.current = requestAnimationFrame(render);

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  // Renderer for 4 Golden Ratio Lines offset by 90-degree 2D directions and 0.5s delayed starts
  const drawFourDirectionalSpirals = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    maxRadius: number,
    rotation: number,
    elapsedTime: number,
    accent: RGB
  ) => {
    ctx.save();
    ctx.translate(cx, cy);

    // Deep ambient radial background glow
    const ambientPulse = ctx.createRadialGradient(0, 0, 0, 0, 0, maxRadius * 1.05);
    ambientPulse.addColorStop(0, `rgba(${accent.r}, ${accent.g}, ${accent.b}, 0.24)`);
    ambientPulse.addColorStop(0.4, `rgba(${accent.r}, ${accent.g}, ${accent.b}, 0.07)`);
    ambientPulse.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = ambientPulse;
    ctx.beginPath();
    ctx.arc(0, 0, maxRadius * 1.05, 0, Math.PI * 2);
    ctx.fill();

    // Logarithmic Spiral parameters
    const b = Math.log(PHI) / (Math.PI / 2); // ~0.3063489
    const a = maxRadius * 0.0055;
    const totalTurns = 4.8;
    const maxTotalTheta = totalTurns * Math.PI * 2;

    // Time timing config
    const legDuration = 8.33; // seconds to draw from root to end (or end to root)
    const cycleDuration = legDuration * 2; // full forming + retracting cycle

    // 4 cardinal 2D directions (0deg, 90deg, 180deg, 270deg)
    const directions = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
    const delayPerLine = 0.5; // 0.5s delay between consecutive lines

    ctx.save();
    ctx.rotate(rotation);

    directions.forEach((dirAngle, lineIdx) => {
      const lineStartTime = lineIdx * delayPerLine;
      if (elapsedTime < lineStartTime) return; // Wait for staggered 0.5s delay start

      const activeTime = elapsedTime - lineStartTime;
      const cycleTime = activeTime % cycleDuration;

      // Calculate progress [0, 1]: 0 -> 1 during forming, 1 -> 0 during retracting
      let rawProgress = 0;
      if (cycleTime <= legDuration) {
        rawProgress = cycleTime / legDuration; // Forming outward from root
      } else {
        rawProgress = 1 - (cycleTime - legDuration) / legDuration; // Retracting back to root
      }

      // Ease-In acceleration curve: line starts slow near root and accelerates at latter stages
      const easedProgress = Math.pow(rawProgress, 2.2);

      const currentMaxTheta = maxTotalTheta * easedProgress;
      if (currentMaxTheta <= 0.02) return;

      ctx.save();
      ctx.rotate(dirAngle);

      // Alpha modifier for staggered line depth
      const lineAlpha = 1.0 - lineIdx * 0.08;

      // 1. Outer Bloom Stroke Pass
      ctx.shadowColor = `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${0.85 * lineAlpha})`;
      ctx.shadowBlur = 18;
      ctx.strokeStyle = `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${0.35 * lineAlpha})`;
      ctx.lineWidth = 5;

      ctx.beginPath();
      let started = false;
      for (let theta = 0; theta <= currentMaxTheta; theta += 0.012) {
        const radius = a * Math.exp(b * theta);
        if (radius > maxRadius * 0.95) break;
        const x = radius * Math.cos(theta);
        const y = radius * Math.sin(theta);

        if (!started) {
          ctx.moveTo(x, y);
          started = true;
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // 2. Core Luminous Golden Spiral Stroke
      const strokeGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, maxRadius * 0.95);
      strokeGrad.addColorStop(0, `rgba(255, 253, 245, ${0.98 * lineAlpha})`);
      strokeGrad.addColorStop(0.3, `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${0.95 * lineAlpha})`);
      strokeGrad.addColorStop(0.8, `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${0.7 * lineAlpha})`);
      strokeGrad.addColorStop(1, `rgba(${accent.r}, ${accent.g}, ${accent.b}, 0)`);

      ctx.shadowBlur = 12;
      ctx.shadowColor = `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${0.9 * lineAlpha})`;
      ctx.strokeStyle = strokeGrad;
      ctx.lineWidth = 3.2;

      ctx.beginPath();
      started = false;
      for (let theta = 0; theta <= currentMaxTheta; theta += 0.012) {
        const radius = a * Math.exp(b * theta);
        if (radius > maxRadius * 0.95) break;
        const x = radius * Math.cos(theta);
        const y = radius * Math.sin(theta);

        if (!started) {
          ctx.moveTo(x, y);
          started = true;
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      ctx.restore();
    });

    // Hairline Golden Angle Rays for geometric backdrop
    ctx.save();
    ctx.strokeStyle = `rgba(${accent.r}, ${accent.g}, ${accent.b}, 0.07)`;
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

    ctx.restore();
    ctx.restore();
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
