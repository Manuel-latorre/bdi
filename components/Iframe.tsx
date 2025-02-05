"use client";

import React, { useState, useEffect, useRef } from "react";
import Arrow from "./Arrow";

interface ArcanePlayer {
  play: () => void;
  emitUIEvent: (descriptor: string | object) => boolean;
  onReceiveEvent: (name: string, listener: (response: string) => void) => void;
  onPlayerEvent: (name: string, listener: (data?: any) => void) => void;
  toggleFullscreen: () => boolean;
}

declare global {
  interface Window {
    ArcanePlayer: ArcanePlayer;
    initArcanePlayer: () => void;
  }
}

//const ARCANE_WS_URL = "wss://live.arcanemirage.com/p/e782cf6b-32a3-4b2b-a2be-468ec62e4c34?key=aWQ9NTA2NyZrZXk9ZTc4MmNmNmItMzJhMy00YjJiLWEyYmUtNDY4ZWM2MmU0YzM0JnRva2VuPXlSVzUyTDRGaVhicw==";

const VideoToIframe = () => {
  const [showOverlay, setShowOverlay] = useState(false);
  const [showIframe, setShowIframe] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showIframe || !containerRef.current) return;

    const script = document.createElement('script');
    script.src = 'https://embed.arcanemirage.com/e782cf6b-32a3-4b2b-a2be-468ec62e4c34/e';
    
    script.onload = () => {
      window.initArcanePlayer();
    };

    const handleArcanePlayerLoaded = () => {
      const player = window.ArcanePlayer;

      player.onPlayerEvent('loading', () => {
        console.log('Loading experience...');
      });

      player.onPlayerEvent('ready', () => {
        console.log('Experience ready');
        player.play();
      });

      player.onPlayerEvent('afkWarning', () => {
        console.log('AFK Warning detected');
      });

      player.onPlayerEvent('afkTimedOut', () => {
        console.log('AFK Timeout - reloading...');
        setShowIframe(false);
        window.location.reload();
      });

      player.onPlayerEvent('disconnected', () => {
        console.log('Disconnected - reloading...');
        setShowIframe(false);
        window.location.reload();
      });
    };

    window.addEventListener('ArcanePlayerLoaded', handleArcanePlayerLoaded);

    containerRef.current.appendChild(script);

    return () => {
      window.removeEventListener('ArcanePlayerLoaded', handleArcanePlayerLoaded);
      script.remove();
    };
  }, [showIframe]);

  const startExperience = () => {
    setShowIframe(true);
  };

  return (
    <div className="relative w-full h-screen">
      {!showIframe ? (
        <div 
          className="relative w-full h-full"
          onMouseEnter={() => setShowOverlay(true)}
          onMouseLeave={() => setShowOverlay(false)}
        >
          <video className="w-full h-full object-cover" loop muted playsInline autoPlay>
            <source src="https://res.cloudinary.com/drsrva2kp/video/upload/v1737997149/CasaLoft2024_1_1_gegyh5.mp4" type="video/mp4" />
          </video>

          <div className={`absolute inset-0 bg-black transition-opacity duration-300 ${showOverlay ? "opacity-50" : "opacity-0"}`} />
          
          <button
            className={`px-2 py-1 rounded-full text-center border bg-white text-black flex items-start justify-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300 ${
              showOverlay ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            onClick={startExperience}
          >
            <p className="text-xl uppercase tracking-wide translate-y-0.5 translate-x-4 font-medium">Comenzar</p>
            <div className="translate-y-4 translate-x-4">
              <Arrow />
            </div>
          </button>
        </div>
      ) : (
        <div 
          ref={containerRef}
          className="w-full h-full"
        >
          <div
            id="arcane-player"
            data-project-id="5067"
            data-project-key="e782cf6b-32a3-4b2b-a2be-468ec62e4c34"
            data-idle-timeout="200"
            data-capture-mouse="false"
            data-enable-events-passthrough="true"
            data-hide-ui-controls="true"
            data-autoplay="false"
            className="w-full h-full"
          />
        </div>
      )}
    </div>
  );
};

export default VideoToIframe;
