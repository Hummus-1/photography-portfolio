import React from "react";

export interface LogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  showDot?: boolean;
  animated?: boolean;
}

export function Logo({
  size = 32,
  showDot = true,
  animated = true,
  className = "",
  ...props
}: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={`select-none shrink-0 overflow-visible ${className}`}
      aria-label="Precision Viewfinder Logo"
      {...props}
    >
      {/* Isotipo: Visor Técnico de Precisión Centrado (Centro en 32, 32) */}
      <g className="origin-center">
        {/* Círculo Exterior Tenue / Guía de Composición (Radio 26) */}
        <circle
          cx="32"
          cy="32"
          r="26"
          className={`stroke-foreground/30 fill-none transition-all duration-700 ease-out origin-center ${
            animated ? "group-hover:stroke-film-amber/60 group-hover:rotate-[30deg]" : ""
          }`}
          strokeWidth="1"
        />

        {/* Retícula de Enfoque Principal / Ejes de Cruz */}
        <g
          className={`stroke-foreground transition-colors duration-300 ${
            animated ? "group-hover:stroke-foreground" : ""
          }`}
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <line x1="32" y1="2" x2="32" y2="11" className={animated ? "transition-transform duration-300 group-hover:-translate-y-0.5" : ""} />
          <line x1="32" y1="53" x2="32" y2="62" className={animated ? "transition-transform duration-300 group-hover:translate-y-0.5" : ""} />
          <line x1="2" y1="32" x2="11" y2="32" className={animated ? "transition-transform duration-300 group-hover:-translate-x-0.5" : ""} />
          <line x1="53" y1="32" x2="62" y2="32" className={animated ? "transition-transform duration-300 group-hover:translate-x-0.5" : ""} />
        </g>

        {/* Círculo Interior Continuo Punteado (Radio 13, Simétrico) */}
        <circle
          cx="32"
          cy="32"
          r="13"
          className={`stroke-foreground/80 fill-none transition-all duration-700 ease-out origin-center ${
            animated ? "group-hover:stroke-film-amber group-hover:-rotate-45" : ""
          }`}
          strokeWidth="1.5"
          strokeDasharray="2.55 2.55"
        />

        {/* Punto de Foco Central / Registro Rojo (Red Dot) */}
        {showDot && (
          <g className="origin-center">
            {/* Halo de Enfoque Activo en Hover */}
            {animated && (
              <circle
                cx="32"
                cy="32"
                r="6"
                className="fill-film-amber/25 opacity-0 group-hover:opacity-100 group-hover:scale-125 origin-center transition-all duration-300 pointer-events-none"
              />
            )}
            {/* Núcleo Central Red Dot */}
            <circle
              cx="32"
              cy="32"
              r="3.5"
              className={`fill-film-amber transition-all duration-300 origin-center ${
                animated ? "group-hover:scale-110" : ""
              }`}
            />
          </g>
        )}
      </g>
    </svg>
  );
}

export default Logo;
