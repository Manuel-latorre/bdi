"use client";

import React, { useState, useEffect, useRef } from "react";
import Arrow from "./Arrow";

interface ArcanePlayer {
  play: () => void;
  emitUIEvent: (descriptor: string | object) => boolean;
  onReceiveEvent: (name: string, listener: (response: string) => void) => void;
  onPlayerEvent: (name: string, listener: (data?: any) => void) => void;
  toggleFullscreen: () => boolean;
  getPlayerState: () => 'loading' | 'ready' | 'idle' | 'disconnected' | 'exit';
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
  const playerRef = useRef<ArcanePlayer | null>(null);

  useEffect(() => {
    if (!showIframe || !containerRef.current) return;

    const script = document.createElement('script');
    script.src = 'https://embed.arcanemirage.com/e782cf6b-32a3-4b2b-a2be-468ec62e4c34/e';
    
    script.onload = () => {
      window.initArcanePlayer();
    };

    const handleArcanePlayerLoaded = () => {
      const player = window.ArcanePlayer;
      playerRef.current = player;

      // Eventos del player
      player.onPlayerEvent('loading', () => {
        console.log('Estado: Cargando experiencia');
      });

      player.onPlayerEvent('ready', () => {
        console.log('Estado: Experiencia lista');
        player.play();
        
        // Ejemplo de envío de evento a UE cuando está listo
        player.emitUIEvent({
          event: 'PlayerReady',
          data: { timestamp: new Date().toISOString() }
        });
      });

      player.onPlayerEvent('idle', () => {
        console.log('Estado: Idle');
      });

      player.onPlayerEvent('disconnected', () => {
        console.log('Estado: Desconectado');
        handleDisconnection();
      });

      player.onPlayerEvent('exit', () => {
        console.log('Estado: Salida');
        setShowIframe(false);
      });

      player.onPlayerEvent('afkWarning', () => {
        console.log('Advertencia: Inactividad detectada');
        player.emitUIEvent('AfkWarningReceived');
      });

      player.onPlayerEvent('afkWarningDeactivate', () => {
        console.log('Advertencia de inactividad desactivada');
      });

      player.onPlayerEvent('afkTimedOut', () => {
        console.log('Timeout por inactividad');
        handleDisconnection();
      });

      // Manejo de archivos
      player.onPlayerEvent('fileProgress', (progress: number) => {
        console.log('Progreso de descarga:', progress);
      });

      player.onPlayerEvent('fileReceived', (data: { file: Blob, extension: string }) => {
        handleFileDownload(data);
      });

      // Escuchar eventos desde UE
      player.onReceiveEvent('event.CustomEvent', (response) => {
        try {
          const data = JSON.parse(response);
          console.log('Evento recibido desde UE:', data);
        } catch (error) {
          console.error('Error al procesar evento de UE:', error);
        }
      });
    };

    const handleDisconnection = () => {
      if (playerRef.current) {
        const currentState = playerRef.current.getPlayerState();
        console.log('Estado al desconectar:', currentState);
      }
      setShowIframe(false);
      window.location.reload();
    };

    const handleFileDownload = (data: { file: Blob, extension: string }) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(data.file);
      a.download = `arcane_file_${Date.now()}.${data.extension}`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(a.href);
      a.remove();
    };

    window.addEventListener('ArcanePlayerLoaded', handleArcanePlayerLoaded);

    containerRef.current.appendChild(script);

    return () => {
      window.removeEventListener('ArcanePlayerLoaded', handleArcanePlayerLoaded);
      script.remove();
      playerRef.current = null;
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
            data-idle-timeout="900"
            data-capture-mouse="false"
            data-enable-events-passthrough="true"
            data-hide-ui-controls="true"
            data-autoplay="false"
            data-enable-touch-input="true"
            data-enable-fake-mouse-with-touch="true"
            data-touch-mouse-threshold="10"
            className="w-full h-full"
            style={{
              touchAction: 'none',
              WebkitUserSelect: 'none',
              userSelect: 'none',
              WebkitTouchCallout: 'none'
            }}
          />
        </div>
      )}
    </div>
  );
};

export default VideoToIframe;
