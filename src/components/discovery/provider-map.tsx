"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MapPin,
  Navigation,
  ZoomIn,
  ZoomOut,
  Crosshair,
  ExternalLink,
  ShieldCheck,
  Star,
  Clock,
  Layers,
  Wrench,
  AlertCircle,
} from "lucide-react";
import { ProviderItem } from "@/lib/data/providers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ProviderMapProps {
  providers: ProviderItem[];
  selectedProviderId: string | null;
  onSelectProvider: (id: string) => void;
  userCity?: string;
  onRequestService?: (provider: ProviderItem) => void;
}

export function ProviderMap({
  providers,
  selectedProviderId,
  onSelectProvider,
  userCity = "New Delhi",
  onRequestService,
}: ProviderMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapboxLoaded, setMapboxLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [hoveredProvider, setHoveredProvider] = useState<ProviderItem | null>(null);

  const selectedProvider = providers.find((p) => p.id === selectedProviderId) || null;
  const activePopup = hoveredProvider || selectedProvider;

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  // Attempt to initialize Mapbox GL if token exists
  useEffect(() => {
    if (!mapboxToken || mapboxToken.includes("example") || mapboxToken.length < 15) {
      setMapError(true);
      return;
    }

    let isMounted = true;
    async function initMapbox() {
      try {
        const mapboxgl = (await import("mapbox-gl")).default;
        // @ts-ignore
        mapboxgl.accessToken = mapboxToken;

        if (mapContainerRef.current && isMounted) {
          const map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: "mapbox://styles/mapbox/light-v11",
            center: [77.22, 28.55], // Delhi NCR center
            zoom: 11,
          });

          // Add navigation controls
          map.addControl(new mapboxgl.NavigationControl(), "top-right");

          // Add markers for each provider
          providers.forEach((prov) => {
            const el = document.createElement("div");
            el.className = "cursor-pointer group";
            el.innerHTML = `
              <div style="background-color: #087F8C; border: 2px solid white; border-radius: 9999px; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.2);">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                </svg>
              </div>
            `;

            el.addEventListener("click", () => onSelectProvider(prov.id));

            new mapboxgl.Marker(el)
              .setLngLat([prov.location.lng, prov.location.lat])
              .setPopup(
                new mapboxgl.Popup({ offset: 25 }).setHTML(`
                  <div style="padding: 4px; font-family: sans-serif;">
                    <strong style="color: #17253D; font-size: 13px;">${prov.businessName}</strong>
                    <p style="font-size: 11px; color: #667784; margin: 2px 0;">${prov.location.neighborhood} • ${prov.distanceKm} km</p>
                    <span style="color: #087F8C; font-weight: bold; font-size: 11px;">★ ${prov.rating} (${prov.reviewCount} reviews)</span>
                  </div>
                `)
              )
              .addTo(map);
          });

          setMapboxLoaded(true);
        }
      } catch (err) {
        console.warn("Mapbox GL init error, falling back to Interactive Radar Map:", err);
        setMapError(true);
      }
    }

    initMapbox();

    return () => {
      isMounted = false;
    };
  }, [mapboxToken, providers, onSelectProvider]);

  return (
    <div className="relative w-full h-[360px] sm:h-[460px] lg:h-[540px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-subtle flex flex-col">
      {/* Top Map Toolbar */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
        <div className="bg-white/95 backdrop-blur-sm border border-slate-200/90 rounded-xl px-3 py-1.5 shadow-sm text-xs font-bold text-secondary flex items-center gap-2">
          <Navigation className="w-3.5 h-3.5 text-primary" />
          <span>{userCity} Service Zone</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
        </div>
        <Badge variant="outline" className="bg-white/90 text-[10px] hidden sm:inline-flex">
          {providers.length} Vetted Technicians Live
        </Badge>
      </div>

      {/* Mapbox Canvas or High-Fidelity Interactive Vector Radar View */}
      {!mapError && mapboxToken ? (
        <div ref={mapContainerRef} className="w-full h-full" />
      ) : (
        /* High-Craft Interactive Radar Locator (Delhi NCR Assistive Grid) */
        <div className="relative w-full h-full bg-gradient-to-br from-slate-900 via-secondary to-[#0F2236] text-white flex items-center justify-center overflow-hidden select-none">
          {/* Subtle Coordinate Grid Lines */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#45C2CF_1px,transparent_1px)] [background-size:24px_24px]" />

          {/* Concentric Distance Rings (2km, 5km, 10km radius) */}
          <div className="relative flex items-center justify-center w-full h-full">
            {/* 10km ring */}
            <div className="absolute w-[320px] h-[320px] sm:w-[460px] sm:h-[460px] rounded-full border border-teal-500/20 animate-pulse" />
            <span className="absolute text-[10px] font-mono text-teal-400/40 translate-y-36 sm:translate-y-52">
              10 km Radius
            </span>

            {/* 5km ring */}
            <div className="absolute w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] rounded-full border border-teal-400/30" />
            <span className="absolute text-[10px] font-mono text-teal-400/60 translate-y-24 sm:translate-y-36">
              5 km Radius
            </span>

            {/* 2km ring */}
            <div className="absolute w-[110px] h-[110px] sm:w-[160px] sm:h-[160px] rounded-full border border-teal-300/40 bg-teal-500/5" />
            <span className="absolute text-[10px] font-mono text-teal-300/70 translate-y-12 sm:translate-y-18">
              2 km
            </span>

            {/* User Center Pulse Node */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-secondary shadow-lg shadow-emerald-500/40 ring-4 ring-accent/30 animate-pulse">
                <MapPin className="w-4 h-4 text-emerald-800" />
              </div>
              <span className="mt-1 text-[10px] font-bold tracking-tight bg-slate-950/80 px-2 py-0.5 rounded-full border border-white/10">
                Your Location
              </span>
            </div>

            {/* Interactive Provider Nodes on Radar */}
            {providers.map((prov, index) => {
              // Calculate deterministic polar coordinates around center
              const angles = [35, 140, 220, 310, 80];
              const angle = angles[index % angles.length] * (Math.PI / 180);
              const radiusPixels = Math.min(prov.distanceKm * 28 + 35, 190);
              const x = Math.cos(angle) * radiusPixels;
              const y = Math.sin(angle) * radiusPixels;

              const isSelected = prov.id === selectedProviderId;

              return (
                <div
                  key={prov.id}
                  style={{
                    transform: `translate(${x}px, ${y}px)`,
                  }}
                  className="absolute z-20 transition-all duration-300"
                >
                  <button
                    type="button"
                    onClick={() => onSelectProvider(prov.id)}
                    onMouseEnter={() => setHoveredProvider(prov)}
                    onMouseLeave={() => setHoveredProvider(null)}
                    className={`relative p-1.5 rounded-full transition-all group focus:outline-none ${
                      isSelected
                        ? "bg-[#E78235] text-white scale-125 ring-4 ring-amber-400/50 z-30 shadow-elevated"
                        : "bg-primary text-white hover:scale-110 hover:bg-primary-400 shadow-md ring-2 ring-white/40"
                    }`}
                    aria-label={`Select ${prov.businessName}`}
                  >
                    <Wrench className="w-3.5 h-3.5" />

                    {/* Distance Pill */}
                    <span
                      className={`absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap shadow-sm ${
                        isSelected
                          ? "bg-[#E78235] text-white"
                          : "bg-slate-900/90 text-slate-200 border border-white/20"
                      }`}
                    >
                      {prov.distanceKm} km
                    </span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Map info watermark */}
          <div className="absolute bottom-3 left-3 z-20 text-[10px] text-slate-400 flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-white/10">
            <Layers className="w-3 h-3 text-primary" />
            <span>Assistive Discovery Radar • Real-Time Geo-Proximity</span>
          </div>
        </div>
      )}

      {/* Selected / Hovered Provider Floating Popup Card on Map */}
      {activePopup && (
        <div className="absolute bottom-3 right-3 left-3 sm:left-auto sm:w-80 z-30 bg-white rounded-xl p-3.5 border border-slate-200 shadow-elevated text-secondary animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold text-secondary line-clamp-1">
                  {activePopup.businessName}
                </h4>
                {activePopup.isVerified && (
                  <Badge variant="accent" className="text-[9px] py-0 px-1 shrink-0">
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {activePopup.location.neighborhood} • {activePopup.distanceKm} km away
              </p>
            </div>
            <div className="flex items-center gap-0.5 text-xs font-bold text-amber-600 shrink-0">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              <span>{activePopup.rating}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-600 py-1.5 border-y border-slate-100 my-2">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-primary" />
              <span>ETA {activePopup.estimatedResponseTime}</span>
            </span>
            <span className="font-semibold text-primary">
              Starts at ₹{activePopup.startingPriceInr}
            </span>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Button
              size="sm"
              variant="outline"
              asChild
              className="w-1/2 text-[11px] h-8 font-semibold"
            >
              <a href={`/providers/${activePopup.id}`}>View Details</a>
            </Button>
            <Button
              size="sm"
              onClick={() => onRequestService && onRequestService(activePopup)}
              className="w-1/2 text-[11px] h-8 font-bold bg-primary hover:bg-primary-600 text-white"
            >
              Request Service
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
