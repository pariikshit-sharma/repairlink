import React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showTagline?: boolean;
  taglineVariant?: "possibilities" | "support";
  className?: string;
  href?: string;
  inverted?: boolean;
}

export function Logo({
  size = "md",
  showTagline = false,
  taglineVariant = "possibilities",
  className,
  href = "/",
  inverted = false,
}: LogoProps) {
  const iconSizes = {
    sm: "w-8 h-6",
    md: "w-11 h-8",
    lg: "w-14 h-10",
    xl: "w-18 h-13",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl sm:text-2xl",
    lg: "text-2xl sm:text-3xl",
    xl: "text-3xl sm:text-4xl",
  };

  const content = (
    <div className={cn("inline-flex items-center gap-3 select-none group", className)}>
      {/* Official Infinity-Figures Ribbon Emblem */}
      <div className={cn(iconSizes[size], "relative flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 duration-200")}>
        <svg
          viewBox="0 0 44 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="repairlink-ribbon" x1="4" y1="18" x2="40" y2="18" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={inverted ? "#FFFFFF" : "#17253D"} />
              <stop offset="42%" stopColor={inverted ? "#CBD5E1" : "#1E2B45"} />
              <stop offset="58%" stopColor="#DF7B30" />
              <stop offset="100%" stopColor="#E78235" />
            </linearGradient>
          </defs>

          {/* Left Figure Head */}
          <circle cx="12" cy="7" r="3.6" fill={inverted ? "#FFFFFF" : "#17253D"} />

          {/* Right Figure Head */}
          <circle cx="32" cy="7" r="3.6" fill="#E78235" />

          {/* Infinity Connecting Ribbon */}
          <path
            d="M12 14C7.5 14 4 17.5 4 22C4 26.5 7.5 30 12 30C16.5 30 20.5 25.5 22 22C23.5 18.5 27.5 14 32 14C36.5 14 40 17.5 40 22C40 26.5 36.5 30 32 30C27.5 30 23.5 25.5 22 22C20.5 18.5 16.5 14 12 14Z"
            stroke="url(#repairlink-ribbon)"
            strokeWidth="4.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Official Wordmark */}
      <div className="flex flex-col justify-center shrink-0">
        <div className="flex items-baseline tracking-tight font-extrabold font-sans leading-none">
          <span className={cn(textSizes[size], inverted ? "text-white" : "text-[#17253D]")}>
            Repair
          </span>
          <span className={cn(textSizes[size], inverted ? "text-amber-400" : "text-[#E78235]")}>
            Link
          </span>
        </div>

        {showTagline && (
          <div className="flex items-center gap-1.5 mt-1 whitespace-nowrap">
            <span className="w-2.5 h-[1.5px] bg-[#E78235] shrink-0" />
            <span
              className={cn(
                "text-[9px] sm:text-[10px] font-semibold tracking-tight whitespace-nowrap",
                inverted ? "text-slate-300" : "text-[#5A6E7F]"
              )}
            >
              Connecting People to Possibilities
            </span>
            <span className="w-2.5 h-[1.5px] bg-[#E78235] shrink-0" />
          </div>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg transition-opacity hover:opacity-95"
        aria-label="RepairLink Home"
      >
        {content}
      </Link>
    );
  }

  return content;
}
