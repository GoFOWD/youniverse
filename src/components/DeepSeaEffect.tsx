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

const VideoBackground = ({ videoSrc, zoom = 1.0 }: { videoSrc: string; zoom?: number }) => {
    const { size, viewport } = useThree();
    const materialRef = useRef<any>(null);

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
        }
    }, [texture]);

    useFrame(() => {
        if (materialRef.current) {
            materialRef.current.uResolution.set(size.width, size.height);

            if (texture.image && texture.image.videoWidth && texture.image.videoHeight) {
                materialRef.current.uVideoAspect = texture.image.videoWidth / texture.image.videoHeight;
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
    const [isLoading, setIsLoading] = React.useState(true);

    return (
        <div className="absolute inset-0 z-0 pointer-events-none">
            {/* Black background fallback while video loads */}
            <div className="absolute inset-0 bg-black" />

            <Canvas
                camera={{ position: [0, 0, 5], fov: 75 }}
                gl={{ antialias: false }}
                onCreated={() => {
                    // Small delay to ensure video starts loading
                    setTimeout(() => setIsLoading(false), 100);
                }}
            >
                <React.Suspense fallback={null}>
                    <VideoBackground videoSrc={videoSrc} zoom={zoom} />
                </React.Suspense>
            </Canvas>
        </div>
    );
}
