"use client"
import React, { useState, useRef, useEffect } from "react";
import Arrow from "./Arrow";

const VideoToIframe = () => {
  const [showVideo, setShowVideo] = useState(true);
  const [showOverlay, setShowOverlay] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTouchTimeRef = useRef<number>(Date.now());

  const handleStartExperience = () => {
    setShowVideo(false);
    lastTouchTimeRef.current = Date.now();
    startInactivityTimer();
  };

  const handleInteraction = () => {
    setShowOverlay(true);
  };

  const handleMouseLeave = () => {
    if (window.matchMedia("(hover: hover)").matches) {
      setShowOverlay(false);
    }
  };

  const startInactivityTimer = () => {
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }
    
    inactivityTimeoutRef.current = setTimeout(() => {
      // Solo verifica inactividad en dispositivos táctiles
      if (!window.matchMedia("(hover: hover)").matches) {
        const timeSinceLastTouch = Date.now() - lastTouchTimeRef.current;
        if (timeSinceLastTouch >= 25000) {
          setShowVideo(true);
        }
      }
    }, 25000);
  };

  const handleIframeTouch = () => {
    if (!window.matchMedia("(hover: hover)").matches) {
      lastTouchTimeRef.current = Date.now();
      startInactivityTimer();
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video && showVideo) {
      video.play().catch(error => console.log("Auto-play was prevented:", error));
    }
  }, [showVideo]);

  useEffect(() => {
    if (!showVideo) {
      const iframe = iframeRef.current;
      
      if (iframe) {
        iframe.addEventListener('touchstart', handleIframeTouch);
      }

      startInactivityTimer();

      return () => {
        if (inactivityTimeoutRef.current) {
          clearTimeout(inactivityTimeoutRef.current);
        }
        if (iframe) {
          iframe.removeEventListener('touchstart', handleIframeTouch);
        }
      };
    }
  }, [showVideo]);

  return (
    <div className="relative w-full h-screen">
      {showVideo ? (
        <div 
          className="relative w-full h-full"
          onMouseEnter={handleInteraction}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleInteraction}
        >
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            loop 
            muted
            playsInline
          >
            <source src="https://res.cloudinary.com/drsrva2kp/video/upload/v1737997149/CasaLoft2024_1_1_gegyh5.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div 
            className={`absolute inset-0 bg-black transition-opacity duration-300 ${
              showOverlay ? 'opacity-50' : 'opacity-0'
            }`} 
          />
          <button
            className={`px-2 py-1 rounded-full text-center border bg-white text-black flex items-start justify-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300 ${
              showOverlay ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={handleStartExperience}
          >
            <p className="text-xl uppercase tracking-wide translate-y-0.5 translate-x-4 font-medium">Comenzar</p>
            <div className="translate-y-4 translate-x-4">
              <Arrow/>
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
        />
      )}
    </div>
  );
};

export default VideoToIframe;