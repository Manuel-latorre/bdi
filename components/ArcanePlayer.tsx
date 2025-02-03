"use client"

import { useEffect } from 'react';

interface ArcanePlayer {
    play: () => void;

    emitUIEvent: (descriptor: string | object) => boolean;
    onReceiveEvent: (
        name: string,
        listener: (response: string) => void
    ) => void;
    onPlayerEvent: (name: string, listener: (data?: any) => void) => void;
    toggleFullscreen: () => boolean;
}

declare global {
    interface Window {
        ArcanePlayer: ArcanePlayer;
        initArcanePlayer?: () => void;
    }
}


interface ProjectProps {
    project: {
        key: string;
        id: number;
    };
}

const ArcanePlayer: React.FC<ProjectProps> = ({ project }) => {
    useEffect(() => {
        const script = document.createElement('script');
        script.src = `https://embed.arcanemirage.com/e782cf6b-32a3-4b2b-a2be-468ec62e4c34/e`;
        script.onload = () => {
            window.initArcanePlayer?.();
        };
        
        const container = document.getElementById('am-container');
        if (container) {
            container.append(script);
        }

        const handlePlayerLoaded = () => {
            const player = window.ArcanePlayer;

            // Setup event listeners
            player.onReceiveEvent('CustomUIEventResponse', (response) => {
                console.log({ ArcaneResponse: response });
            });

            ['loading', 'ready', 'afkWarning', 'afkWarningDeactivate', 'afkTimedOut'].forEach((event) => {
                player.onPlayerEvent(event, () => {
                    console.log(event);
                });
            });

            // File events
            player.onPlayerEvent('fileProgress', (progress: number) => {
                console.log('File download progress:', progress);
            });

            player.onPlayerEvent('fileReceived', (data: { file: Blob; extension: string }) => {
                const a = document.createElement('a');
                a.href = URL.createObjectURL(data.file);
                a.style.display = 'none';
                a.download = `received_file.${data.extension}`;
                document.body.appendChild(a);
                a.click();
                a.remove();
            });


            player.onReceiveEvent('CustomUIEventResponse', (response) => {
                console.log({ ArcaneResponse: response });
            });

            player.onPlayerEvent('loading', () => {
                console.log('loading');
            });

            player.onPlayerEvent('ready', () => {
                console.log('ready');
            });

            player.onPlayerEvent('afkWarning', () => {
                console.log('afkWarning');
            });

            player.onPlayerEvent('afkWarningDeactivate', () => {
                console.log('afkWarningDeactivate');
            });

            player.onPlayerEvent('afkTimedOut', () => {
                console.log('afkTimedOut');
            });
        };

        window.addEventListener('ArcanePlayerLoaded', handlePlayerLoaded);

        // Cleanup
        return () => {
            window.removeEventListener('ArcanePlayerLoaded', handlePlayerLoaded);
        };
    }, [project.key]); // Add dependency on project.key

    if (!project) return null;

    return (
        <>
            <div
                id="arcane-player"
                data-project-id={project.id}
                data-project-key={project.key}
                data-idle-timeout="200"
                data-capture-mouse="false"
                data-enable-events-passthrough="true"
                data-hide-ui-controls="true"
                data-autoplay="false"
            />
            <button
                onClick={() => {
                    window.ArcanePlayer?.emitUIEvent({
                        event: 'MyCustomEventWithData',
                        data: {
                            foo: 'bar',
                        },
                    });
                }}
            >
                fire event
            </button>
        </>
    );
};

export default ArcanePlayer; 