"use client";

import React, { useState, useEffect } from "react";
import Arrow from "./Arrow";

declare global {
  interface Window {
    ArcanePlayer: {
      onPlayerEvent: (event: string, callback: () => void) => void;
    };
  }
}

const VideoToIframe = () => {
  const [showVideo, setShowVideo] = useState(true);
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    if (!showVideo) {
      const setupArcanePlayer = () => {
        if (window.ArcanePlayer) {
          console.log("🎮 Configurando eventos del player...");
          
          // Detectar actividad del usuario
          window.ArcanePlayer.onPlayerEvent("userInteraction", () => {
            console.log("👆 Interacción detectada");
          });

          // Detectar cuando el usuario está inactivo
          window.ArcanePlayer.onPlayerEvent("afkWarning", () => {
            console.log("⚠️ Usuario inactivo");
          });

          // Detectar cuando el usuario vuelve a estar activo
          window.ArcanePlayer.onPlayerEvent("afkWarningDeactivate", () => {
            console.log("✅ Usuario activo nuevamente");
          });

          // Detectar timeout por inactividad
          window.ArcanePlayer.onPlayerEvent("afkTimedOut", () => {
            console.log("⏰ Timeout por inactividad");
            setShowVideo(true);
            window.location.reload();
          });
        }
      };

      // Intentar configurar el player cada 500ms hasta que esté disponible
      const interval = setInterval(() => {
        if (window.ArcanePlayer) {
          setupArcanePlayer();
          clearInterval(interval);
        }
      }, 500);

      return () => clearInterval(interval);
    }
  }, [showVideo]);

  return (
    <div className="relative w-full h-screen">
      {showVideo ? (
        <div 
          className="relative w-full h-full"
          onMouseEnter={() => setShowOverlay(true)}
          onMouseLeave={() => setShowOverlay(false)}
          onTouchStart={() => setShowOverlay(true)}
        >
          <video
            className="w-full h-full object-cover"
            loop
            muted
            playsInline
            autoPlay
          >
            <source src="https://res.cloudinary.com/drsrva2kp/video/upload/v1737997149/CasaLoft2024_1_1_gegyh5.mp4" type="video/mp4" />
          </video>
          
          <div className={`absolute inset-0 bg-black transition-opacity duration-300 ${showOverlay ? "opacity-50" : "opacity-0"}`} />
          
          <button
            className={`px-2 py-1 rounded-full text-center border bg-white text-black flex items-start justify-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300 ${
              showOverlay ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            onClick={() => setShowVideo(false)}
          >
            <p className="text-xl uppercase tracking-wide translate-y-0.5 translate-x-4 font-medium">Comenzar</p>
            <div className="translate-y-4 translate-x-4">
              <Arrow />
            </div>
          </button>
        </div>
      ) : (
        <iframe
          id="arcane-player-frame"
          src="https://embed.arcanemirage.com/e782cf6b-32a3-4b2b-a2be-468ec62e4c34?key=aWQ9NTA2NyZrZXk9ZTc4MmNmNmItMzJhMy00YjJiLWEyYmUtNDY4ZWM2MmU0YzM0JnRva2VuPXlSVzUyTDRGaVhicw=="
          className="w-full h-full"
          allow="fullscreen; microphone"
          allowFullScreen
          data-enable-events-passthrough="true"
          data-enable-touch-input="true"
          data-enable-fake-mouse-with-touch="true"
        />
      )}
    </div>
  );
};

export default VideoToIframe;
