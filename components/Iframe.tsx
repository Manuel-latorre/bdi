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
    };

    const handleMessage = (e: MessageEvent) => {
      if (e.origin !== IFRAME_DOMAIN) return;

      const { name, event, data, descriptor, response } = e.data;
      console.log("Message received:", e.data);

      switch (name) {
        case "ArcanePlayerLoaded":
          setupEvents();
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

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
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

  return (
    <div className="relative w-full h-screen">
      {!showIframe ? (
        <div
          className="relative w-full h-full cursor-pointer"
          onMouseEnter={() => setShowOverlay(true)}
          onMouseLeave={() => setShowOverlay(false)}
          onClick={startExperience}
        >
          <div className="relative w-full aspect-video">
            <video
              className="absolute top-0 left-0 w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
            >
              <source src="Narvaez_Logo.mp4" type="video/mp4" />
              Tu navegador no soporta el video HTML5.
            </video>
          </div>
          {/* <div className="relative w-full aspect-video">
          <iframe
            ref={iframeRef}
            src="https://player.vimeo.com/video/1056627685?h=ab2b52b1a6&autoplay=1&loop=1&muted=1&background=1&controls=0"
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
            className="absolute top-0 left-0 w-full h-full"
            title="Video_Narvaez_BDI_01"
          />
        </div> */}

          <div
            className={`absolute inset-0 bg-black transition-opacity duration-300 ${
              showOverlay ? "opacity-0" : "opacity-0"
            }`}
          />
        </div>
      ) : (
        <iframe
          ref={iframeRef}
          id="arcane-player-frame"
          /* src={`${IFRAME_DOMAIN}/e782cf6b-32a3-4b2b-a2be-468ec62e4c34?origin=${encodeURIComponent(
            window.location.origin
          )}&key=aWQ9NTA2NyZrZXk9ZTc4MmNmNmItMzJhMy00YjJiLWEyYmUtNDY4ZWM2MmU0YzM0JnRva2VuPXlSVzUyTDRGaVhicw==`} */
          src={`${IFRAME_DOMAIN}/82b5ceba-f450-4d7f-877a-bb9150dc201a?origin=${encodeURIComponent(
            window.location.origin
          )}&key=aWQ9NDc2MiZrZXk9ODJiNWNlYmEtZjQ1MC00ZDdmLTg3N2EtYmI5MTUwZGMyMDFhJnRva2VuPU55WHpqS190YmhicQ==`}
          frameBorder="0"
          width="100%"
          height="100%"
          className="w-full h-full"
          allow="fullscreen; microphone; camera; display-capture; web-share; cross-origin-isolated; clipboard-write"
          allowFullScreen
          onLoad={() => postMessageToIframe("init")}
        />
      )}
    </div>
  );
};

export default VideoToIframe;
