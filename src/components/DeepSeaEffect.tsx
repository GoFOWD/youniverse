import React, { useRef } from 'react';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import { useVideoTexture, shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Simple video shader without effects
const VideoMaterial = shaderMaterial(
    {
        uTexture: new THREE.Texture(),
        uResolution: new THREE.Vector2(1, 1),
        uVideoAspect: 1.77,
        uMouse: new THREE.Vector2(0.5, 0.5), // Mouse position (0-1)
        uHasSpotlight: false, // Toggle spotlight
        uBackgroundColor: new THREE.Color(0x000000), // Background color for spotlight mode
    },
    // Vertex Shader
    `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    // Fragment Shader
    `
    uniform sampler2D uTexture;
    uniform vec2 uResolution;
    uniform float uVideoAspect;
    uniform vec2 uMouse;
    uniform bool uHasSpotlight;
    uniform vec3 uBackgroundColor;
    varying vec2 vUv;

    void main() {
      // Responsive mode: cover for mobile, contain for desktop
      float screenAspect = uResolution.x / uResolution.y;
      vec2 uv = vUv;
      
      // Detect mobile: width < 768px
      bool isMobile = uResolution.x < 768.0;
      
      if (isMobile) {
        // COVER MODE for mobile - fill screen
        if (screenAspect > uVideoAspect) {
          float scale = screenAspect / uVideoAspect;
          uv.y = (uv.y - 0.5) / scale + 0.5;
        } else {
          float scale = uVideoAspect / screenAspect;
          uv.x = (uv.x - 0.5) / scale + 0.5;
        }
      } else {
        // CONTAIN MODE for desktop - show full video
        if (screenAspect > uVideoAspect) {
          float scale = uVideoAspect / screenAspect;
          uv.x = (uv.x - 0.5) / scale + 0.5;
        } else {
          float scale = screenAspect / uVideoAspect;
          uv.y = (uv.y - 0.5) / scale + 0.5;
        }
        
        // Check bounds for letterbox/pillarbox
        if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
          gl_FragColor = vec4(uBackgroundColor, 1.0);
          return;
        }
      }
      
      vec4 videoColor = texture2D(uTexture, uv);
      
      // Spotlight Effect
      if (uHasSpotlight) {
        // Calculate distance from mouse to current pixel (corrected for aspect ratio)
        vec2 aspectCorrectedUV = vUv;
        aspectCorrectedUV.x *= screenAspect;
        
        vec2 aspectCorrectedMouse = uMouse;
        aspectCorrectedMouse.x *= screenAspect;
        
        float dist = distance(aspectCorrectedUV, aspectCorrectedMouse);
        
        // Spotlight radius and softness
        float radius = 0.25; // Size of the light
        float softness = 0.2; // Edge softness
        
        // Create smooth vignette (1.0 at center, 0.0 at edge)
        float vignette = smoothstep(radius, radius - softness, dist);
        
        // Mix between background color and video based on vignette
        // vignette = 1.0 (center) -> show video
        // vignette = 0.0 (outside) -> show background color
        vec3 finalColor = mix(uBackgroundColor, videoColor.rgb, vignette);
        gl_FragColor = vec4(finalColor, 1.0);
      } else {
        gl_FragColor = videoColor;
      }
    }
  `
);

extend({ VideoMaterial });

const VideoBackground = ({ videoSrc, zoom = 1.0, onVideoLoaded, spotlight = false, backgroundColor = '#000000' }: { videoSrc: string; zoom?: number; onVideoLoaded?: () => void; spotlight?: boolean; backgroundColor?: string }) => {
    const { size, viewport } = useThree();
    const materialRef = useRef<any>(null);
    const [videoTexture, setVideoTexture] = React.useState<THREE.VideoTexture | null>(null);
    const mouseRef = useRef(new THREE.Vector2(0.5, 0.5));

    React.useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            // Normalize mouse position to 0-1, flip Y
            mouseRef.current.x = event.clientX / window.innerWidth;
            mouseRef.current.y = 1.0 - (event.clientY / window.innerHeight);
        };

        const handleTouchMove = (event: TouchEvent) => {
            if (event.touches.length > 0) {
                mouseRef.current.x = event.touches[0].clientX / window.innerWidth;
                mouseRef.current.y = 1.0 - (event.touches[0].clientY / window.innerHeight);
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('touchmove', handleTouchMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchmove', handleTouchMove);
        };
    }, []);

    React.useEffect(() => {
        // Manual video element creation for better iOS control
        const video = document.createElement('video');

        // Critical iOS settings
        // 'defaultMuted' is crucial for iOS autoplay without interaction
        video.defaultMuted = true;
        video.muted = true;
        video.preload = 'auto'; // Force preload

        video.setAttribute('playsinline', '');
        video.setAttribute('webkit-playsinline', '');
        video.setAttribute('crossorigin', 'anonymous');
        video.setAttribute('muted', '');
        video.setAttribute('autoplay', '');
        video.setAttribute('loop', '');

        video.crossOrigin = 'anonymous';
        video.playsInline = true;
        video.loop = true;
        video.autoplay = true;

        video.src = videoSrc;

        // Attach to DOM but hide it (helps with iOS autoplay policies sometimes)
        // Must be "visible" (size > 0) for some browsers to allow playback
        video.style.position = 'absolute';
        video.style.width = '1px';
        video.style.height = '1px';
        video.style.opacity = '0.01'; // Not fully 0
        video.style.pointerEvents = 'none';
        video.style.zIndex = '-1';
        document.body.appendChild(video);

        // Create texture immediately
        const texture = new THREE.VideoTexture(video);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.format = THREE.RGBAFormat;

        setVideoTexture(texture);

        // Attempt to play
        const playVideo = async () => {
            try {
                video.muted = true; // Ensure muted again before play
                await video.play();
            } catch (err) {
                console.warn("Video autoplay failed, waiting for interaction", err);
            }
        };

        // Global interaction fallback & Unmute logic
        const handleInteraction = () => {
            // 1. If video is paused, try to play
            if (video.paused) {
                // Try playing with sound first
                video.muted = false;
                video.play().catch((err) => {
                    console.log("Unmuted play failed, falling back to muted", err);
                    // Fallback: Play muted if unmuted fails
                    video.muted = true;
                    video.play().catch(() => { });
                });
            }
            // 2. If video is already playing but muted, try to unmute
            else if (video.muted) {
                video.muted = false;
            }
        };

        // Event listeners
        const handleCanPlay = () => {
            playVideo();
            onVideoLoaded?.();
        };

        video.addEventListener('canplay', handleCanPlay);
        video.addEventListener('loadeddata', handleCanPlay);

        // Add global listeners for interaction (persist until unmuted)
        window.addEventListener('touchstart', handleInteraction);
        window.addEventListener('click', handleInteraction);

        // Force load
        video.load();

        return () => {
            video.removeEventListener('canplay', handleCanPlay);
            video.removeEventListener('loadeddata', handleCanPlay);
            window.removeEventListener('touchstart', handleInteraction);
            window.removeEventListener('click', handleInteraction);

            video.pause();
            video.src = '';
            if (document.body.contains(video)) {
                document.body.removeChild(video);
            }
            texture.dispose();
        };
    }, [videoSrc, onVideoLoaded]);

    useFrame(() => {
        if (materialRef.current && videoTexture) {
            materialRef.current.uResolution.set(size.width, size.height);
            materialRef.current.uMouse.lerp(mouseRef.current, 0.1); // Smooth mouse movement
            materialRef.current.uHasSpotlight = spotlight;
            materialRef.current.uBackgroundColor.set(backgroundColor);

            if (videoTexture.image && videoTexture.image.videoWidth && videoTexture.image.videoHeight) {
                materialRef.current.uVideoAspect = videoTexture.image.videoWidth / videoTexture.image.videoHeight;
                videoTexture.needsUpdate = true;
            }
        }
    });

    if (!videoTexture) return null;

    return (
        <mesh scale={[viewport.width * zoom, viewport.height * zoom, 1]}>
            <planeGeometry args={[1, 1]} />
            {/* @ts-ignore */}
            <videoMaterial ref={materialRef} uTexture={videoTexture} transparent />
        </mesh>
    );
};

interface DeepSeaEffectProps {
    videoSrc?: string;
    zoom?: number;
    spotlight?: boolean;
    backgroundColor?: string;
}

export default function DeepSeaEffect({ videoSrc = '/assets/main.mp4', zoom = 1.0, spotlight = false, backgroundColor = '#000000' }: DeepSeaEffectProps) {
    const [opacity, setOpacity] = React.useState(0);

    const handleVideoLoaded = React.useCallback(() => {
        // Fade in immediately when video is loaded
        setOpacity(1);
    }, []);

    // Reset opacity when video source changes
    React.useEffect(() => {
        setOpacity(0);
    }, [videoSrc]);

    return (
        <div className="absolute inset-0 z-0 pointer-events-none">
            {/* Black background fallback */}
            <div className="absolute inset-0 bg-black" />

            {/* Video with fade-in */}
            <div
                className="absolute inset-0 transition-opacity duration-700 ease-out"
                style={{ opacity }}
            >
                <Canvas
                    camera={{ position: [0, 0, 5], fov: 75 }}
                    gl={{ antialias: false }}
                >
                    <React.Suspense fallback={null}>
                        <VideoBackground videoSrc={videoSrc} zoom={zoom} onVideoLoaded={handleVideoLoaded} spotlight={spotlight} backgroundColor={backgroundColor} />
                    </React.Suspense>
                </Canvas>
            </div>
        </div>
    );
}
