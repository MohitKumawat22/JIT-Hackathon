"use client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { Suspense } from "react";
import { Avatar } from "./Avatar";

interface AvatarMessage {
  audio: HTMLAudioElement;
  lipSync: { mouthCues: { start: number; end: number; value: string }[] };
}

export function AvatarScene({
  isTalking,
  currentMessage,
}: {
  isTalking: boolean;
  currentMessage?: AvatarMessage | null;
}) {
  return (
    <div style={{ width: "100%", height: "500px" }}>
      <Canvas camera={{ position: [0, 1.4, 2.0], fov: 30 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
        <pointLight position={[-5, 5, -5]} intensity={0.4} color="#4fc3f7" />
        <Suspense fallback={null}>
          <group position={[0, -0.5, 0]} scale={1.15}>
            <Avatar isTalking={isTalking} currentMessage={currentMessage} />
          </group>
          <Environment preset="city" />
        </Suspense>
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.8}
          target={[0, 1.2, 0]}
        />
      </Canvas>
    </div>
  );
}
