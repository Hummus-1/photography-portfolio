"use client";

import React, { useState, useEffect, useRef } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Convert ISO string (YYYY-MM-DD or ISO timestamp) to DD/MM/YYYY
export function isoToDDMMYYYY(isoStr?: string | null): string {
  if (!isoStr) return "";
  const trimmed = isoStr.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [y, m, d] = trimmed.split("-");
    return `${d}/${m}/${y}`;
  }
  if (trimmed.includes("T")) {
    const datePart = trimmed.split("T")[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
      const [y, m, d] = datePart.split("-");
      return `${d}/${m}/${y}`;
    }
  }
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
    return trimmed;
  }
  return trimmed;
}

// Convert DD/MM/YYYY or common string date inputs to ISO string (YYYY-MM-DD)
export function parseToIso(inputStr?: string | null): string | null {
  if (!inputStr) return null;
  const trimmed = inputStr.trim();
  if (!trimmed) return null;

  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  // 8 digits DDMMYYYY
  if (/^\d{8}$/.test(trimmed)) {
    const d = trimmed.slice(0, 2);
    const m = trimmed.slice(2, 4);
    const y = trimmed.slice(4, 8);
    const dNum = parseInt(d, 10);
    const mNum = parseInt(m, 10);
    const yNum = parseInt(y, 10);
    if (mNum >= 1 && mNum <= 12 && dNum >= 1 && dNum <= 31 && yNum >= 1900 && yNum <= 2100) {
      return `${y}-${m}-${d}`;
    }
  }

  // Split by /, -, or .
  const parts = trimmed.split(/[/.-]/);
  if (parts.length === 3) {
    const [p1, p2, p3] = parts;
    // Format DD/MM/YYYY
    if (p3.length === 4) {
      const d = p1.padStart(2, "0");
      const m = p2.padStart(2, "0");
      const y = p3;
      const dNum = parseInt(d, 10);
      const mNum = parseInt(m, 10);
      const yNum = parseInt(y, 10);
      if (mNum >= 1 && mNum <= 12 && dNum >= 1 && dNum <= 31 && yNum >= 1900 && yNum <= 2100) {
        return `${y}-${m}-${d}`;
      }
    }
    // Format YYYY/MM/DD
    if (p1.length === 4) {
      const y = p1;
      const m = p2.padStart(2, "0");
      const d = p3.padStart(2, "0");
      const dNum = parseInt(d, 10);
      const mNum = parseInt(m, 10);
      const yNum = parseInt(y, 10);
      if (mNum >= 1 && mNum <= 12 && dNum >= 1 && dNum <= 31 && yNum >= 1900 && yNum <= 2100) {
        return `${y}-${m}-${d}`;
      }
    }
  }

  return null;
}

// Backward compatibility alias for ddmmYYYYToIso
export function ddmmYYYYToIso(displayStr?: string | null): string {
  const parsed = parseToIso(displayStr);
  return parsed || displayStr || "";
}

export interface DateSelectorProps {
  id?: string;
  name?: string;
  value?: string | null; // Expects ISO 'YYYY-MM-DD' or 'DD/MM/YYYY' or empty
  onChange?: (isoValue: string) => void;
  className?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export function DateSelector({
  id,
  name,
  value,
  onChange,
  className,
  placeholder = "DD/MM/YYYY",
  required = false,
  disabled = false,
}: DateSelectorProps) {
  const [displayValue, setDisplayValue] = useState<string>(() => isoToDDMMYYYY(value));
  const [isFocused, setIsFocused] = useState(false);

  // Sync internal displayValue when prop value changes externally (if not focused)
  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(isoToDDMMYYYY(value));
    }
  }, [value, isFocused]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setDisplayValue(raw);

    if (raw.trim() === "") {
      onChange?.("");
      return;
    }

    const iso = parseToIso(raw);
    if (iso) {
      onChange?.(iso);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (!displayValue.trim()) {
      onChange?.("");
      setDisplayValue("");
      return;
    }

    const iso = parseToIso(displayValue);
    if (iso) {
      onChange?.(iso);
      setDisplayValue(isoToDDMMYYYY(iso));
    }
  };

  const handleNativeDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isoVal = e.target.value; // YYYY-MM-DD
    if (isoVal) {
      setDisplayValue(isoToDDMMYYYY(isoVal));
      onChange?.(isoVal);
    }
  };

  const currentIsoValue = value ? (parseToIso(value) || value) : "";

  return (
    <div className="relative flex items-center w-full">
      {/* Text Input for Typing DD/MM/YYYY */}
      <input
        id={id}
        name={name}
        type="text"
        value={displayValue}
        onChange={handleTextChange}
        onFocus={() => setIsFocused(true)}
        onBlur={handleBlur}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        maxLength={10}
        className={cn(
          "w-full bg-white/5 border border-white/15 text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-film-amber font-mono text-xs h-10 px-3 pr-10 transition-colors",
          className
        )}
      />

      {/* Calendar Icon Button overlaying Native Date Picker */}
      <div className="absolute right-0 top-0 bottom-0 px-3 flex items-center justify-center text-white/50 hover:text-film-amber transition-colors group">
        <CalendarIcon className="h-4 w-4 pointer-events-none group-hover:text-film-amber" />
        <input
          type="date"
          value={currentIsoValue}
          onChange={handleNativeDateChange}
          disabled={disabled}
          tabIndex={-1}
          aria-label="Pick date from calendar"
          title="Open calendar date picker"
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full text-xs"
        />
      </div>
    </div>
  );
}
