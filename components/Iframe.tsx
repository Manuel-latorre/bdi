"use client";

import React, { useState, useEffect, useRef } from "react";
import Arrow from "./Arrow";

//const ARCANE_WS_URL = "wss://live.arcanemirage.com/p/e782cf6b-32a3-4b2b-a2be-468ec62e4c34?key=aWQ9NTA2NyZrZXk9ZTc4MmNmNmItMzJhMy00YjJiLWEyYmUtNDY4ZWM2MmU0YzM0JnRva2VuPXlSVzUyTDRGaVhicw==";

const VideoToIframe = () => {
  const [showOverlay, setShowOverlay] = useState(false);
  const [showIframe, setShowIframe] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Función para emitir eventos UI usando postMessage
  const emitUIEvent = (descriptor: string | { event: string; data: any }) => {
    if (iframeRef.current) {
      console.log("Emitiendo evento UI:", descriptor);
      iframeRef.current.contentWindow?.postMessage({
        type: 'uiEvent',
        payload: descriptor
      }, '*');
    }
  };

  useEffect(() => {
    // Escuchar mensajes del iframe
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = event.data;
        console.log("Mensaje recibido:", data);

        switch (data.type) {
          case 'afkWarning':
            console.log("AFK Warning detectado");
            setShowIframe(false);
            emitUIEvent({
              event: 'AFKDetected',
              data: { status: 'warning' }
            });
            break;

          case 'afkWarningDeactivate':
            console.log("AFK Warning desactivado");
            setShowIframe(true);
            break;

          case 'afkTimedOut':
            console.log("Sesión terminada por inactividad");
            setShowIframe(false);
            emitUIEvent({
              event: 'AFKDetected',
              data: { status: 'timedOut' }
            });
            break;

          case 'loading':
            console.log("Cargando experiencia...");
            break;

          case 'ready':
            console.log("Experiencia lista");
            setShowIframe(true);
            // Enviar evento de prueba cuando la experiencia está lista
            emitUIEvent({
              event: 'TestEvent',
              data: { message: 'Hello from frontend!' }
            });
            break;

          case 'customEvent':
            console.log("Evento personalizado recibido:", data.payload);
            break;
        }
      } catch (error) {
        console.error("Error al procesar mensaje:", error);
      }
    };

    window.addEventListener('message', handleMessage);

    // Configurar un intervalo para enviar el evento TestEvent cada 30 segundos
    const testInterval = setInterval(() => {
      emitUIEvent({
        event: 'TestEvent',
        data: { message: 'Periodic test from frontend!', timestamp: new Date().toISOString() }
      });
    }, 30000);

    return () => {
      window.removeEventListener('message', handleMessage);
      clearInterval(testInterval);
    };
  }, []);

  const startExperience = () => {
    setShowIframe(true);
    emitUIEvent({
      event: 'ExperienceStarted',
      data: { timestamp: new Date().toISOString() }
    });
  };

  return (
    <div className="relative w-full h-screen">
      {!showIframe ? (
        <div 
          className="relative w-full h-full"
          onMouseEnter={() => setShowOverlay(true)}
          onMouseLeave={() => setShowOverlay(false)}
          onTouchStart={() => setShowOverlay(true)}
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
        <iframe
          ref={iframeRef}
          id="arcane-player-frame"
          src="https://embed.arcanemirage.com/e782cf6b-32a3-4b2b-a2be-468ec62e4c34?key=aWQ9NTA2NyZrZXk9ZTc4MmNmNmItMzJhMy00YjJiLWEyYmUtNDY4ZWM2MmU0YzM0JnRva2VuPXlSVzUyTDRGaVhicw=="
          frameBorder="0"
          width="100%"
          height="100%"
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
