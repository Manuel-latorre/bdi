"use client";

import React, { useState, useEffect, useRef } from "react";

const IFRAME_DOMAIN = "https://embed.arcanemirage.com";

const VideoToIframe = () => {
  const [showOverlay, setShowOverlay] = useState(false);
  const [showIframe, setShowIframe] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!showIframe) return;

    const eventListeners: Record<string, (response: any) => void> = {
      MySimpleEvent: (response) => {
        console.log("Simple event response:", response);
      },
      "event.MyCustomEventWithData": (response) => {
        try {
          const data = JSON.parse(response);
          console.log("Custom event data:", data);
        } catch (error) {
          console.error("Error parsing response:", error);
        }
      },
      OpenURL: (response) => {
        console.log("OpenURL event received:", response);
        if (typeof response === "string") {
          window.open(response, "_blank", "noopener,noreferrer");
        } else {
          console.warn("OpenURL ignorado, URL inválida:", response);
        }
      },
    };

    const handleMessage = (e: MessageEvent) => {
      if (e.origin !== IFRAME_DOMAIN) return;

      const { name, event, data, descriptor, response } = e.data;
      console.log("Message received:", e.data);

      switch (name) {
        case "ArcanePlayerLoaded":
          setupEvents();
          // Enviar configuración de responsive al iframe
          postMessageToIframe("setResponsive", { 
            mobile: true, 
            viewport: { 
              width: window.innerWidth, 
              height: window.innerHeight 
            } 
          });
          break;

        case "onPlayerEvent":
          handlePlayerEvent(event, data);
          break;

        case "onReceiveEvent":
          if (eventListeners[descriptor]) {
            eventListeners[descriptor](response);
          }
          break;
      }
    };

    const handlePlayerEvent = (event: string, data: any) => {
      switch (event) {
        case "ready":
          console.log("Experience ready");
          play();
          break;

        case "fileReceived":
          handleFileDownload(data);
          break;

        case "fileProgress":
          console.log("File progress:", data);
          break;

        case "afkWarning":
          console.log("AFK Warning");
          setShowIframe(false);
          window.location.reload();
          break;

        case "afkTimedOut":
          console.log("AFK Timeout - reloading...");
          setShowIframe(false);
          window.location.reload();
          break;

        case "disconnected":
          console.log("Disconnected - reloading...");
          setShowIframe(false);
          window.location.reload();
          break;
      }
    };

    const setupEvents = () => {
      Object.keys(eventListeners).forEach((descriptor) => {
        postMessageToIframe("onReceiveEvent", { descriptor });
      });
    };

    const handleFileDownload = (data: { file: Blob; extension: string }) => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(data.file);
      a.download = `arcane_file_${Date.now()}.${data.extension}`;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(a.href);
      a.remove();
    };

    // Listener para cambios de tamaño de ventana
    const handleResize = () => {
      if (iframeRef.current) {
        postMessageToIframe("updateViewport", { 
          width: window.innerWidth, 
          height: window.innerHeight 
        });
      }
    };

    window.addEventListener("message", handleMessage);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("resize", handleResize);
    };
  }, [showIframe]);

  const postMessageToIframe = (cmd: string, params = {}) => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { cmd, ...params },
        IFRAME_DOMAIN
      );
    }
  };

  const play = () => {
    postMessageToIframe("play");
  };

  /* const toggleFullscreen = () => {
    postMessageToIframe('toggleFullscreen');
  };

  const emitUIEvent = (descriptor: string | object) => {
    postMessageToIframe('emitUIEvent', { descriptor });
  }; */

  const startExperience = () => {
    setShowIframe(true);
  };

  // Generar URL del iframe con parámetros responsive
  const getIframeUrl = () => {
    const baseUrl = `${IFRAME_DOMAIN}/82b5ceba-f450-4d7f-877a-bb9150dc201a`;
    const params = new URLSearchParams({
      origin: window.location.origin,
      key: "aWQ9NTA2NyZrZXk9ZTc4MmNmNmItMzJhMy00YjJiLWEyYmUtNDY4ZWM2MmU0YzM0JnRva2VuPXlSVzUyTDRGaVhicw==",
      responsive: "true",
      mobile: window.innerWidth <= 768 ? "true" : "false",
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      scale: "fit"
    });
    return `${baseUrl}?${params.toString()}`;
  };

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-black">
      {!showIframe ? (
        <div
          className="relative w-full h-full cursor-pointer bg-black flex items-center justify-center"
          onMouseEnter={() => setShowOverlay(true)}
          onMouseLeave={() => setShowOverlay(false)}
          onClick={startExperience}
        >
          <video
            className="w-full h-full object-contain max-w-full max-h-full"
            autoPlay
            loop
            muted
            playsInline
          >
            <source src="Narvaez_Logo.mp4" type="video/mp4" />
            Tu navegador no soporta el video HTML5.
          </video>

          <div
            className={`absolute inset-0 bg-black transition-opacity duration-300 ${
              showOverlay ? "opacity-0" : "opacity-0"
            }`}
          />
        </div>
      ) : (
        <div className="absolute inset-0 w-full h-full">
          <style jsx>{`
            #arcane-player-frame {
              transform-origin: top left;
              overflow: hidden;
            }
            
            /* CSS que puede afectar el contenido del iframe */
            #arcane-player-frame::after {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              pointer-events: none;
            }
          `}</style>
          
          <iframe
            ref={iframeRef}
            id="arcane-player-frame"
            src={getIframeUrl()}
            frameBorder="0"
            width="100%"
            height="100%"
            className="w-full h-full border-0"
            style={{
              minWidth: '100%',
              minHeight: '100%',
              objectFit: 'contain'
            }}
            allow="fullscreen; microphone; camera; display-capture; web-share; cross-origin-isolated; clipboard-write"
            allowFullScreen
            onLoad={() => {
              postMessageToIframe("init");
              // Configurar responsive después de cargar
              setTimeout(() => {
                postMessageToIframe("setResponsive", { 
                  enabled: true,
                  viewport: { 
                    width: window.innerWidth, 
                    height: window.innerHeight 
                  }
                });
              }, 1000);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default VideoToIframe;
