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
    const handleArcanePlayerLoaded = () => {
      if (window.ArcanePlayer) {
        console.log("ArcanePlayer cargado correctamente");

        // Escuchar eventos del player
        window.ArcanePlayer.onPlayerEvent("afkWarning", () => {
          console.log("⚠️ Advertencia de inactividad");
        });

        window.ArcanePlayer.onPlayerEvent("afkWarningDeactivate", () => {
          console.log("✅ Usuario activo nuevamente");
          setShowVideo(true);
          window.location.reload();
        });

        window.ArcanePlayer.onPlayerEvent("afkTimedOut", () => {
          console.log("⛔ Tiempo de inactividad agotado");
          setShowVideo(true);
          window.location.reload();
        });
      }
    };

    window.addEventListener("ArcanePlayerLoaded", handleArcanePlayerLoaded);

    return () => {
      window.removeEventListener("ArcanePlayerLoaded", handleArcanePlayerLoaded);
    };
  }, []); // Ejecutar solo una vez cuando el componente se monta

  return (
    <div className="relative w-full h-screen">
      {showVideo ? (
        <div
          className="relative w-full h-full"
          onMouseEnter={() => setShowOverlay(true)}
          onMouseLeave={() => setShowOverlay(false)}
          onClick={() => setShowOverlay(true)}
        >
          <video
            className="w-full h-full object-cover"
            loop
            muted
            playsInline
            autoPlay
          >
            <source
              src="https://res.cloudinary.com/drsrva2kp/video/upload/v1737997149/CasaLoft2024_1_1_gegyh5.mp4"
              type="video/mp4"
            />
          </video>

          <div
            className={`absolute inset-0 bg-black transition-opacity duration-300 ${
              showOverlay ? "opacity-50" : "opacity-0"
            }`}
          />

          <button
            className={`px-2 py-1 rounded-full text-center border bg-white text-black flex items-start justify-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300 ${
              showOverlay ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            onClick={() => setShowVideo(false)}
          >
            <p className="text-xl uppercase tracking-wide translate-y-0.5 translate-x-4 font-medium">
              Comenzar
            </p>
            <div className="translate-y-4 translate-x-4">
              <Arrow />
            </div>
          </button>
        </div>
      ) : (
        <iframe
        id="arcane-player-frame"
        src="https://embed.arcanemirage.com/e782cf6b-32a3-4b2b-a2be-468ec62e4c34?key=aWQ9NTA2NyZrZXk9ZTc4MmNmNmItMzJhMy00YjJiLWEyYmUtNDY4ZWM2MmU0YzM0JnRva2VuPXlSVzUyTDRGaVhicw=="
        frameBorder="0"
        width="100%"
        height="100%"
        className="w-full h-full"
        allow="fullscreen; microphone"
        allowFullScreen
        data-enable-events-passthrough="true"
        />
      )}
    </div>
  );
};

export default VideoToIframe;
/* 

"use client";

import React, { useState, useRef, useEffect } from "react";
import Arrow from "./Arrow";

const VideoToIframe = () => {
  const [showVideo, setShowVideo] = useState(true);
  const [showOverlay, setShowOverlay] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  const INACTIVITY_TIMEOUT = 59000; // 59 segundos

  useEffect(() => {
    setIsDesktop(window.matchMedia("(hover: hover)").matches);
  }, []);

  const handleStartExperience = () => {
    setShowVideo(false);
    resetInactivityTimer();
  };

  const resetInactivityTimer = () => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    inactivityTimerRef.current = setTimeout(() => {
      setShowVideo(true);
    }, INACTIVITY_TIMEOUT);
  };

  useEffect(() => {
    if (!showVideo) {
      resetInactivityTimer();

      // Eventos para detectar interacción y reiniciar el temporizador
      const interactionEvents = ["mousemove", "click", "touchstart", "touchmove", "keydown"];

      const handleUserInteraction = () => {
        resetInactivityTimer();
      };

      interactionEvents.forEach(event =>
        document.addEventListener(event, handleUserInteraction)
      );

      return () => {
        if (inactivityTimerRef.current) {
          clearTimeout(inactivityTimerRef.current);
        }
        interactionEvents.forEach(event =>
          document.removeEventListener(event, handleUserInteraction)
        );
      };
    }
  }, [showVideo]);

  return (
    <div className="relative w-full h-screen">
      {showVideo ? (
        <div
          className="relative w-full h-full"
          onMouseEnter={() => setShowOverlay(true)}
          onMouseLeave={() => isDesktop && setShowOverlay(false)}
          onTouchStart={() => setShowOverlay(true)}
        >
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            loop
            muted
            playsInline
            autoPlay
          >
            <source src="https://res.cloudinary.com/drsrva2kp/video/upload/v1737997149/CasaLoft2024_1_1_gegyh5.mp4" type="video/mp4" />
            Tu navegador no soporta el video.
          </video>
          <div
            className={`absolute inset-0 bg-black transition-opacity duration-300 ${
              showOverlay ? "opacity-50" : "opacity-0"
            }`}
          />
          <button
            className={`px-2 py-1 rounded-full text-center border bg-white text-black flex items-start justify-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300 ${
              showOverlay ? "opacity-100" : "opacity-0"
            }`}
            onClick={handleStartExperience}
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
          frameBorder="0"
          width="100%"
          height="100%"
          className="w-full h-full"
          allow="fullscreen; microphone"
          allowFullScreen
        />
      )}
    </div>
  );
};

export default VideoToIframe;

*/
