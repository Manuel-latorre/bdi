"use client";

import React, { useState, useEffect, useRef } from "react";
import Arrow from "./Arrow";

//const ARCANE_WS_URL = "wss://live.arcanemirage.com/p/e782cf6b-32a3-4b2b-a2be-468ec62e4c34?key=aWQ9NTA2NyZrZXk9ZTc4MmNmNmItMzJhMy00YjJiLWEyYmUtNDY4ZWM2MmU0YzM0JnRva2VuPXlSVzUyTDRGaVhicw==";

const VideoToIframe = () => {
  const [showOverlay, setShowOverlay] = useState(false);
  const [showIframe, setShowIframe] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  // Función para manejar eventos UI desde el frontend hacia UE
  const emitUIEvent = (descriptor: string | { event: string; data: any }) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      console.log("Emitiendo evento UI:", descriptor);
      socketRef.current.send(JSON.stringify({
        type: 'uiEvent',
        payload: descriptor
      }));
    }
  };

  const connectWebSocket = () => {
    if (socketRef.current?.readyState === WebSocket.OPEN) return;

    const wsUrl = `wss://live.arcanemirage.com/p/e782cf6b-32a3-4b2b-a2be-468ec62e4c34?key=aWQ9NTA2NyZrZXk9ZTc4MmNmNmItMzJhMy00YjJiLWEyYmUtNDY4ZWM2MmU0YzM0JnRva2VuPXlSVzUyTDRGaVhicw==`;
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("Conectado al WebSocket de Arcane");
      // Enviar mensaje de autenticación inicial
      ws.send(JSON.stringify({
        type: 'auth',
        projectId: "e782cf6b-32a3-4b2b-a2be-468ec62e4c34",
        key: "aWQ9NTA2NyZrZXk9ZTc4MmNmNmItMzJhMy00YjJiLWEyYmUtNDY4ZWM2MmU0YzM0JnRva2VuPXlSVzUyTDRGaVhicw=="
      }));

      // Enviar evento de prueba inmediatamente después de conectar
      emitUIEvent({
        event: 'TestEvent',
        data: { message: 'Hello from frontend!' }
      });
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Mensaje recibido:", data);

        // Manejar diferentes tipos de eventos
        switch (data.type) {
          case 'afkWarning':
            console.log("AFK Warning detectado");
            setShowIframe(false);
            // Emitir evento cuando se detecta AFK
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
            // Emitir evento cuando se termina la sesión por AFK
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
            // Emitir evento cuando la experiencia está lista
            emitUIEvent({
              event: 'ExperienceReady',
              data: { status: 'ready' }
            });
            break;

          case 'customEvent':
            // Manejar eventos personalizados desde UE
            console.log("Evento personalizado recibido:", data.payload);
            break;
        }
      } catch (error) {
        console.error("Error al procesar mensaje:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("Error en WebSocket:", error);
    };

    ws.onclose = (event) => {
      console.log(`Desconectado del WebSocket de Arcane ${event.code} ${event.reason}`);
      // Intentar reconectar después de 5 segundos
      reconnectTimeoutRef.current = setTimeout(connectWebSocket, 5000);
    };
  };

  useEffect(() => {
    connectWebSocket();

    // Configurar un intervalo para enviar el evento TestEvent cada 30 segundos
    const testInterval = setInterval(() => {
      emitUIEvent({
        event: 'TestEvent',
        data: { message: 'Periodic test from frontend!', timestamp: new Date().toISOString() }
      });
    }, 30000);

    // Limpiar al desmontar
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      clearInterval(testInterval);
      socketRef.current?.close();
    };
  }, []);

  const startExperience = () => {
    setShowIframe(true);
    // Emitir evento cuando el usuario inicia la experiencia
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
