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
        
        vec4 color = texture2D(uTexture, uv);
        gl_FragColor = color;
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
          gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
          return;
        }
        
        vec4 color = texture2D(uTexture, uv);
        gl_FragColor = color;
      }
    }
  `
);

extend({ VideoMaterial });

const VideoBackground = ({ videoSrc, zoom = 1.0, onVideoLoaded }: { videoSrc: string; zoom?: number; onVideoLoaded?: () => void }) => {
    const { size, viewport } = useThree();
    const materialRef = useRef<any>(null);
    const [videoTexture, setVideoTexture] = React.useState<THREE.VideoTexture | null>(null);

    React.useEffect(() => {
        // Manual video element creation for better iOS control
        const video = document.createElement('video');

        // Critical iOS settings
        video.crossOrigin = 'anonymous';
        video.playsInline = true;
        video.muted = true;
        video.loop = true;
        video.autoplay = true;
        video.src = videoSrc;

        // Create texture immediately
        const texture = new THREE.VideoTexture(video);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.format = THREE.RGBAFormat;

        setVideoTexture(texture);

        // Attempt to play
        const playVideo = async () => {
            try {
                await video.play();
            } catch (err) {
                console.warn("Video autoplay failed, retrying on interaction", err);
            }
        };

        // Event listeners
        const handleCanPlay = () => {
            playVideo();
            onVideoLoaded?.();
        };

        video.addEventListener('canplay', handleCanPlay);
        video.addEventListener('loadeddata', handleCanPlay);

        // Force load
        video.load();

        return () => {
            video.removeEventListener('canplay', handleCanPlay);
            video.removeEventListener('loadeddata', handleCanPlay);
            video.pause();
            video.src = '';
            texture.dispose();
        };
    }, [videoSrc, onVideoLoaded]);

    useFrame(() => {
        if (materialRef.current && videoTexture) {
            materialRef.current.uResolution.set(size.width, size.height);

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
}

export default function DeepSeaEffect({ videoSrc = '/assets/main.mp4', zoom = 1.0 }: DeepSeaEffectProps) {
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
                        <VideoBackground videoSrc={videoSrc} zoom={zoom} onVideoLoaded={handleVideoLoaded} />
                    </React.Suspense>
                </Canvas>
            </div>
        </div>
    );
}
