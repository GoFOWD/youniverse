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
      // Cover mode - fill screen completely
      float screenAspect = uResolution.x / uResolution.y;
      vec2 uv = vUv;
      
      if (screenAspect > uVideoAspect) {
        // Screen is wider -> crop top/bottom
        float scale = screenAspect / uVideoAspect;
        uv.y = (uv.y - 0.5) / scale + 0.5;
      } else {
        // Screen is taller -> crop sides
        float scale = uVideoAspect / screenAspect;
        uv.x = (uv.x - 0.5) / scale + 0.5;
      }
      
      vec4 color = texture2D(uTexture, uv);
      gl_FragColor = color;
    }
  `
);

extend({ VideoMaterial });

const VideoBackground = ({ videoSrc }: { videoSrc: string }) => {
    const { size, viewport } = useThree();
    const materialRef = useRef<any>(null);

    const texture = useVideoTexture(videoSrc);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.format = THREE.RGBAFormat;

    useFrame(() => {
        if (materialRef.current) {
            materialRef.current.uResolution.set(size.width, size.height);

            if (texture.image && texture.image.videoWidth && texture.image.videoHeight) {
                materialRef.current.uVideoAspect = texture.image.videoWidth / texture.image.videoHeight;
            }
        }
    });

    return (
        <mesh scale={[viewport.width, viewport.height, 1]}>
            <planeGeometry args={[1, 1]} />
            {/* @ts-ignore */}
            <videoMaterial ref={materialRef} uTexture={texture} transparent />
        </mesh>
    );
};

interface DeepSeaEffectProps {
    videoSrc?: string;
}

export default function DeepSeaEffect({ videoSrc = '/assets/main.mp4' }: DeepSeaEffectProps) {
    return (
        <div className="absolute inset-0 z-0 pointer-events-none">
            <Canvas camera={{ position: [0, 0, 5], fov: 75 }} gl={{ antialias: false }}>
                <React.Suspense fallback={null}>
                    <VideoBackground videoSrc={videoSrc} />
                </React.Suspense>
            </Canvas>
        </div>
    );
}
