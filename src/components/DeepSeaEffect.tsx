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
    const videoLoadedRef = useRef(false);

    const texture = useVideoTexture(videoSrc, {
        unsuspend: 'canplay',
        start: true,
        loop: true,
        muted: true,
        playsInline: true,
        crossOrigin: 'anonymous',
    });

    // Ensure texture is configured properly
    React.useEffect(() => {
        if (texture) {
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.format = THREE.RGBAFormat;
            texture.needsUpdate = true;

            // Check if video is loaded and playing
            if (texture.image && texture.image.readyState >= 2 && !videoLoadedRef.current) {
                videoLoadedRef.current = true;
                onVideoLoaded?.();
            }
        }
    }, [texture, onVideoLoaded]);

    useFrame(() => {
        if (materialRef.current) {
            materialRef.current.uResolution.set(size.width, size.height);

            if (texture.image && texture.image.videoWidth && texture.image.videoHeight) {
                materialRef.current.uVideoAspect = texture.image.videoWidth / texture.image.videoHeight;

                // Trigger fade when video is ready
                if (texture.image.readyState >= 2 && !videoLoadedRef.current) {
                    videoLoadedRef.current = true;
                    onVideoLoaded?.();
                }
            }
        }
    });

    return (
        <mesh scale={[viewport.width * zoom, viewport.height * zoom, 1]}>
            <planeGeometry args={[1, 1]} />
            {/* @ts-ignore */}
            <videoMaterial ref={materialRef} uTexture={texture} transparent />
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
