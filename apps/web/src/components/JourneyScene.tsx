"use client";

import * as THREE from "three";
import { Suspense, useRef, useState } from "react";
import {
  Canvas,
  useFrame,
  extend,
  type ThreeElements,
  type ThreeEvent,
} from "@react-three/fiber";
import {
  Image,
  Environment,
  ScrollControls,
  useScroll,
  Text,
  ContactShadows,
} from "@react-three/drei";
import { easing } from "maath";

import { BentPlaneGeometry, MeshSineMaterial } from "./JourneyUtils";

extend({ MeshSineMaterial, BentPlaneGeometry });

declare module "@react-three/fiber" {
  interface ThreeElements {
    bentPlaneGeometry: any;
    meshSineMaterial: any;
  }
}

function Rig(props: ThreeElements["group"]) {
  const ref = useRef<THREE.Group>(null!);
  const scroll = useScroll();
  
  useFrame((state, delta) => {
    // Rotate contents based on scroll
    ref.current.rotation.y = -scroll.offset * (Math.PI * 2); 
    state.events.update?.(); // Raycasts every frame rather than on pointer-move
    
    // Parallax on mouse move
    easing.damp3(
      state.camera.position,
      [-state.pointer.x * 2, state.pointer.y * 2, 10],
      0.3,
      delta
    ); 
    state.camera.lookAt(0, 0, 0); 
  });
  
  return <group ref={ref} {...props} />;
}

// A simple solid color data URI to prevent external request spam/CORS issues
const PLACEHOLDER_IMAGE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

function Carousel({
  radius = 2.4,
  count = 8,
}: {
  radius?: number;
  count?: number;
}) {
  return (
    <group>
      {Array.from({ length: count }, (_, i) => {
        return (
          <Card
            key={i}
            url={PLACEHOLDER_IMAGE}
            position={[
              Math.sin((i / count) * Math.PI * 2) * radius,
              0,
              Math.cos((i / count) * Math.PI * 2) * radius,
            ]}
            rotation={[0, Math.PI + (i / count) * Math.PI * 2, 0]}
          />
        );
      })}
    </group>
  );
}

function Card({
  url,
  ...props
}: { url: string } & Pick<ThreeElements["mesh"], "position" | "rotation">) {
  const ref = useRef<THREE.Mesh>(null!);
  const [hovered, hover] = useState(false);
  
  const pointerOver = (e: ThreeEvent<PointerEvent>) => (
    e.stopPropagation(), hover(true)
  );
  const pointerOut = () => hover(false);
  
  useFrame((state, delta) => {
    easing.damp3(ref.current.scale, hovered ? 1.15 : 1, 0.1, delta);
    easing.damp(
      (ref.current.material as any),
      "radius",
      hovered ? 0.25 : 0.1,
      0.2,
      delta
    );
    easing.damp((ref.current.material as any), "zoom", hovered ? 1 : 1.5, 0.2, delta);
  });
  
  return (
    <Image
      ref={ref}
      url={url}
      transparent
      side={THREE.DoubleSide}
      onPointerOver={pointerOver}
      onPointerOut={pointerOut}
      {...props}
    >
      <bentPlaneGeometry args={[0.1, 1, 1.4, 20, 20]} />
    </Image>
  );
}

// --- Main Canvas Component ---
export default function JourneyScene() {
  return (
    <div className="w-full h-screen" style={{ background: 'transparent' }}>
      <Canvas 
        camera={{ position: [0, 0, 10], fov: 25 }} 
        dpr={[1, 1.5]} 
        gl={{ antialias: true, powerPreference: "default" }}
      >
        <fog attach="fog" args={["#FEF8D4", 8.5, 12]} />
        
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 10, 10]} intensity={2} color="#ffffff" />

        <Suspense fallback={null}>
          <ScrollControls pages={4} infinite>
            <Rig rotation={[0, 0, 0]}>
              <Carousel count={8} radius={3.2} />
            </Rig>
            
            {/* Central Branding Text that stays fixed */}
            <Text
              position={[0, 0, 0]}
              fontSize={2.5}
              letterSpacing={0.02}
              color="#9F3E47" // Crimson accent
              font="/fonts/flaviotte/Flaviotte.ttf"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.02}
              outlineColor="#FEF8D4"
            >
              Jerni
              <meshStandardMaterial color="#9F3E47" roughness={0.2} metalness={0.1} />
            </Text>

            {/* Subtexts */}
            <Text
              position={[-2, 1.5, -2]}
              fontSize={0.8}
              color="#A8C686"
              font="/fonts/flaviotte/Flaviotte.ttf"
              fillOpacity={0.6}
              rotation={[0, 0.4, -0.1]}
            >
              discover
            </Text>
            <Text
              position={[2, -1.5, -2]}
              fontSize={0.9}
              color="#5F4A8B"
              font="/fonts/flaviotte/Flaviotte.ttf"
              fillOpacity={0.6}
              rotation={[0, -0.3, 0.2]}
            >
              grow
            </Text>
          </ScrollControls>
        </Suspense>

        <ContactShadows
          position={[0, -2.5, 0]}
          opacity={0.35}
          scale={20}
          blur={2.5}
          far={4}
          color="#5F4A8B"
          resolution={256}
          frames={1}
        />
        
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
