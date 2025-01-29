"use client";


import React, { useState, useRef, useEffect } from "react";
import Arrow from "./Arrow";

type PlayerEventMap = {
  ready: void;
  loading: void;
  afkWarning: void;
  afkWarningDeactivate: void;
  afkTimedOut: void;
  fileProgress: number;
  fileReceived: {
    file: Blob;
    extension: string;
  };
};

interface ArcanePlayer {
  play: () => void;
  emitUIEvent: (descriptor: string | object) => boolean;
  onReceiveEvent: (name: string, listener: (response: string) => void) => void;
  onPlayerEvent: <T extends keyof PlayerEventMap>(
    name: T,
    listener: (data: PlayerEventMap[T]) => void
  ) => void;
  toggleFullscreen: () => boolean;
}

declare global {
  interface Window {
    ArcanePlayer: ArcanePlayer;
    initArcanePlayer: () => void;
  }
}

const PROJECT_KEY = "e782cf6b-32a3-4b2b-a2be-468ec62e4c34";
const AUTH_KEY = "aWQ9NTA2NyZrZXk9ZTc4MmNmNmItMzJhMy00YjJiLWEyYmUtNDY4ZWM2MmU0YzM0JnRva2VuPXlSVzUyTDRGaVhicw==";

const VideoToIframe = () => {
    const [showVideo, setShowVideo] = useState(true);
    const [showOverlay, setShowOverlay] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const arcaneInitialized = useRef(false);

    useEffect(() => {
        setIsDesktop(window.matchMedia("(hover: hover)").matches);
    }, []);

    const handleStartExperience = () => {
        setShowVideo(false);
    };

    useEffect(() => {
        if (!showVideo && !arcaneInitialized.current) {
            const iframeContainer = document.getElementById('arcane-player');
            if (!iframeContainer) return;

            // Limpiar contenido previo
            iframeContainer.innerHTML = '';

            // Crear e insertar el script de Arcane
            const script = document.createElement('script');
            script.src = `https://embed.arcanemirage.com/${PROJECT_KEY}/e`;
            script.async = true;
            
            script.onload = () => {
                if (window.initArcanePlayer) {
                    window.initArcanePlayer();
                }
            };

            // Escuchar eventos de Arcane
            window.addEventListener('ArcanePlayerLoaded', () => {
                if (window.ArcanePlayer) {
                    const player = window.ArcanePlayer;

                    // Configurar eventos de Arcane
                    player.onPlayerEvent('ready', () => {
                        console.log('Arcane Player Ready');
                        player.play();
                    });

                    player.onPlayerEvent('afkWarning', () => {
                        console.log('AFK Warning received');
                    });

                    player.onPlayerEvent('afkTimedOut', () => {
                        console.log('AFK Timeout - returning to video');
                        setShowVideo(true);
                    });

                    player.onPlayerEvent('loading', () => {
                        console.log('Loading Arcane Player');
                    });

                    player.onReceiveEvent('CustomUIEventResponse', (response) => {
                        console.log('Custom UI Event:', response);
                    });
                }
            });

            document.body.appendChild(script);
            arcaneInitialized.current = true;

            // Configurar el div para Arcane
            const arcaneDiv = document.createElement('div');
            arcaneDiv.id = 'arcane-player-instance';
            arcaneDiv.setAttribute('data-project-id', '5067');
            arcaneDiv.setAttribute('data-project-key', PROJECT_KEY);
            arcaneDiv.setAttribute('data-idle-timeout', '50');
            arcaneDiv.setAttribute('data-capture-mouse', 'true');
            arcaneDiv.setAttribute('data-enable-events-passthrough', 'true');
            arcaneDiv.setAttribute('data-hide-ui-controls', 'false');
            arcaneDiv.setAttribute('data-autoplay', 'true');
            arcaneDiv.className = 'w-full h-full';
            
            iframeContainer.appendChild(arcaneDiv);

            return () => {
                arcaneInitialized.current = false;
                if (iframeContainer) {
                    iframeContainer.innerHTML = '';
                }
                // Limpiar eventos
                const scripts = document.querySelectorAll('script[src*="arcanemirage"]');
                scripts.forEach(s => s.remove());
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
                        <p className="text-xl uppercase tracking-wide translate-y-0.5 translate-x-4 font-medium">
                            Comenzar
                        </p>
                        <div className="translate-y-4 translate-x-4">
                            <Arrow />
                        </div>
                    </button>
                </div>
            ) : (
                <div id="arcane-player" className="w-full h-full"></div>
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