import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

interface AvatarProps {
  isTalking: boolean;
}

export function Avatar({ isTalking }: AvatarProps) {
  const { scene, animations } = useGLTF("/avatar.glb");
  const { actions } = useAnimations(animations, scene);
  const morphRef = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.morphTargetDictionary) {
        morphRef.current = obj;
      }
    });
    if (actions["Idle"]) actions["Idle"].play();
  }, [scene, actions]);

  useEffect(() => {
    if (isTalking) {
      actions["Talking"]?.reset().play();
    } else {
      actions["Talking"]?.stop();
      actions["Idle"]?.play();
    }
  }, [isTalking, actions]);

  useFrame((state) => {
    const mesh = morphRef.current;
    if (!mesh?.morphTargetInfluences || !mesh.morphTargetDictionary) return;

    if (isTalking) {
      const t = state.clock.elapsedTime;
      const cycle = Math.floor(t * 8) % 4;
      const vowels = ["viseme_aa", "viseme_E", "viseme_O", "viseme_U"];
      const dict = mesh.morphTargetDictionary;

      Object.values(dict).forEach((idx) => {
        if (mesh.morphTargetInfluences) mesh.morphTargetInfluences[idx] = 0;
      });

      const target = vowels[cycle] ?? "viseme_aa";
      if (dict[target] !== undefined && mesh.morphTargetInfluences) {
        mesh.morphTargetInfluences[dict[target]] =
          0.4 + Math.sin(t * 12) * 0.2;
      }
    } else {
      const dict = mesh.morphTargetDictionary;
      Object.values(dict).forEach((idx) => {
        if (mesh.morphTargetInfluences)
          mesh.morphTargetInfluences[idx] *= 0.85;
      });
    }
  });

  return (
    <group position={[0, -1.6, 0]}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload("/avatar.glb");
