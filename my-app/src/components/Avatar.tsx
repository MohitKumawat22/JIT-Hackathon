// @ts-nocheck
import React, { useEffect, useRef, useState } from "react";
import { useAnimations, useFBX, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* ── Viseme mapping (Rhubarb cue letters → RPM morph targets) ── */
const corresponding = {
  A: "viseme_PP",
  B: "viseme_kk",
  C: "viseme_I",
  D: "viseme_AA",
  E: "viseme_O",
  F: "viseme_U",
  G: "viseme_FF",
  H: "viseme_TH",
  X: "viseme_PP",
};

export function Avatar({ currentMessage, isTalking }) {
  const { nodes, materials } = useGLTF("/assets/models/avatar2.glb");
  const { animations: idleAnim } = useFBX("/assets/animations/Idle.fbx");
  const { animations: greetingAnim } = useFBX("/assets/animations/greeting.fbx");
  const { animations: talkingAnim } = useFBX("/assets/animations/talking.fbx");

  // Remap FBX track names to match GLB bone names
  const cleanAnim = (anim) => {
    anim.tracks = anim.tracks
      .filter((track) => !track.name.startsWith("Armature."))
      .map((track) => {
        track.name = track.name.replace(/^mixamorig/, "");
        return track;
      });
    return anim;
  };

  cleanAnim(idleAnim[0]).name = "Idle";
  cleanAnim(talkingAnim[0]).name = "Speech";
  cleanAnim(greetingAnim[0]).name = "Greeting";

  const [animation, setAnimation] = useState("Idle");
  const group = useRef();

  const { actions } = useAnimations(
    [idleAnim[0], talkingAnim[0], greetingAnim[0]],
    group
  );

  /* ── Switch animations smoothly ── */
  useEffect(() => {
    if (!actions[animation]) return;
    actions[animation].reset().fadeIn(0.5).play();
    return () => actions[animation]?.fadeOut(0.5);
  }, [animation]);

  /* ── Audio-driven state ── */
  const [playAudio, setPlayAudio] = useState(false);
  useEffect(() => {
    if (currentMessage?.audio && !currentMessage.audio.ended) {
      setPlayAudio(true);
    } else {
      setPlayAudio(false);
    }
  }, [currentMessage]);

  /* ── Start audio & switch to Speech animation with Greeting intro ── */
  useEffect(() => {
    if (isTalking) {
      setAnimation("Greeting");
      const timer = setTimeout(() => setAnimation("Speech"), 2000);
      return () => clearTimeout(timer);
    } else {
      setAnimation("Idle");
    }
  }, [isTalking]);

  /* ── Audio-synced lip-sync (from reference repo) ── */
  useFrame(() => {
    const audio = currentMessage?.audio;
    const lipsync = currentMessage?.lipSync;

    if (!audio || !lipsync) return;

    const currentAudioTime = audio.currentTime;
    if (audio.paused || audio.ended) return;

    // Reset all visemes with smooth lerp
    Object.values(corresponding).forEach((value) => {
      if (nodes.Wolf3D_Head?.morphTargetDictionary?.[value] !== undefined) {
        nodes.Wolf3D_Head.morphTargetInfluences[
          nodes.Wolf3D_Head.morphTargetDictionary[value]
        ] = THREE.MathUtils.lerp(
          nodes.Wolf3D_Head.morphTargetInfluences[
            nodes.Wolf3D_Head.morphTargetDictionary[value]
          ],
          0,
          0.5
        );
      }
      if (nodes.Wolf3D_Teeth?.morphTargetDictionary?.[value] !== undefined) {
        nodes.Wolf3D_Teeth.morphTargetInfluences[
          nodes.Wolf3D_Teeth.morphTargetDictionary[value]
        ] = THREE.MathUtils.lerp(
          nodes.Wolf3D_Teeth.morphTargetInfluences[
            nodes.Wolf3D_Teeth.morphTargetDictionary[value]
          ],
          0,
          0.5
        );
      }
    });

    // Find current mouth cue and apply
    for (let i = 0; i < lipsync.mouthCues.length; i++) {
      const mouthCue = lipsync.mouthCues[i];
      if (currentAudioTime >= mouthCue.start && currentAudioTime <= mouthCue.end) {
        const viseme = corresponding[mouthCue.value];
        if (nodes.Wolf3D_Head?.morphTargetDictionary?.[viseme] !== undefined) {
          nodes.Wolf3D_Head.morphTargetInfluences[
            nodes.Wolf3D_Head.morphTargetDictionary[viseme]
          ] = THREE.MathUtils.lerp(
            nodes.Wolf3D_Head.morphTargetInfluences[
              nodes.Wolf3D_Head.morphTargetDictionary[viseme]
            ],
            1,
            0.5
          );
        }
        if (nodes.Wolf3D_Teeth?.morphTargetDictionary?.[viseme] !== undefined) {
          nodes.Wolf3D_Teeth.morphTargetInfluences[
            nodes.Wolf3D_Teeth.morphTargetDictionary[viseme]
          ] = THREE.MathUtils.lerp(
            nodes.Wolf3D_Teeth.morphTargetInfluences[
              nodes.Wolf3D_Teeth.morphTargetDictionary[viseme]
            ],
            1,
            0.5
          );
        }
        break;
      }
    }
  });

  /* ── Robust bone finder ── */
  const findBone = (name) => {
    if (!group.current) return null;
    let found = null;
    group.current.traverse((obj) => {
      if (obj.isBone && (obj.name === name || obj.name === `mixamorig${name}`)) {
        found = obj;
      }
    });
    return found;
  };

  /* ── Procedural Posture & Gestures (Natural speaking) ── */
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (!group.current) return;

    // Smooth head tracking
    const head = findBone("Head");
    if (head) {
      const target = new THREE.Vector3().copy(state.camera.position);
      target.y = THREE.MathUtils.lerp(target.y, head.getWorldPosition(new THREE.Vector3()).y, 0.5);
      const localTarget = head.parent.worldToLocal(target);
      head.lookAt(localTarget);
      head.rotation.x = Math.max(-0.2, Math.min(0.2, head.rotation.x));
      head.rotation.y = Math.max(-0.5, Math.min(0.5, head.rotation.y));
    }

    // Natural body sway (Breathing & Speaking posture)
    const spine = findBone("Spine2");
    if (spine) {
      spine.rotation.x = Math.sin(t * 1.2) * 0.02 + (isTalking ? Math.sin(t * 4) * 0.01 : 0);
      spine.rotation.y = Math.sin(t * 0.8) * 0.02;
    }

    // Conversational arm gestures
    const lArm = findBone("LeftArm");
    const rArm = findBone("RightArm");
    const lForearm = findBone("LeftForeArm");
    const rForearm = findBone("RightForeArm");
    const lShoulder = findBone("LeftShoulder");
    const rShoulder = findBone("RightShoulder");

    if (lArm && rArm) {
      // Eliminate the rigid A-pose by forcing arms down
      const baseLz = -1.4;
      const baseRz = 1.4;
      const baseLx = 0.2;
      const baseRx = 0.2;

      if (isTalking) {
        // Conversational hand talking
        lArm.rotation.z = THREE.MathUtils.lerp(lArm.rotation.z, baseLz + 0.3 + Math.sin(t * 2.5) * 0.15, 0.08);
        rArm.rotation.z = THREE.MathUtils.lerp(rArm.rotation.z, baseRz - 0.3 + Math.sin(t * 2.7) * 0.15, 0.08);
        
        lArm.rotation.x = THREE.MathUtils.lerp(lArm.rotation.x, baseLx + 0.4 + Math.sin(t * 2) * 0.1, 0.08);
        rArm.rotation.x = THREE.MathUtils.lerp(rArm.rotation.x, baseRx + 0.4 + Math.sin(t * 2.2) * 0.1, 0.08);

        if (lForearm) lForearm.rotation.y = THREE.MathUtils.lerp(lForearm.rotation.y, 0.8 + Math.sin(t * 3) * 0.4, 0.08);
        if (rForearm) rForearm.rotation.y = THREE.MathUtils.lerp(rForearm.rotation.y, -0.8 + Math.sin(t * 3.2) * 0.4, 0.08);
      } else {
        // Relaxed idle posture
        lArm.rotation.z = THREE.MathUtils.lerp(lArm.rotation.z, baseLz, 0.05);
        rArm.rotation.z = THREE.MathUtils.lerp(rArm.rotation.z, baseRz, 0.05);
        lArm.rotation.x = THREE.MathUtils.lerp(lArm.rotation.x, baseLx, 0.05);
        rArm.rotation.x = THREE.MathUtils.lerp(rArm.rotation.x, baseRx, 0.05);
        
        if (lForearm) lForearm.rotation.y = THREE.MathUtils.lerp(lForearm.rotation.y, 0.2, 0.05);
        if (rForearm) rForearm.rotation.y = THREE.MathUtils.lerp(rForearm.rotation.y, -0.2, 0.05);
      }
    }
  });

  /* ── Fallback procedural lip-sync (no audio, just isTalking flag) ── */
  useFrame((state) => {
    if (currentMessage?.audio && !currentMessage.audio.ended) return; // audio lip-sync is active
    if (!isTalking) return;

    const t = state.clock.elapsedTime;
    const head = nodes.Wolf3D_Head;
    const teeth = nodes.Wolf3D_Teeth;
    if (!head?.morphTargetDictionary) return;

    const visemes = Object.values(corresponding);
    visemes.forEach((v) => {
      const hi = head.morphTargetDictionary[v];
      const ti = teeth?.morphTargetDictionary?.[v];
      if (hi !== undefined)
        head.morphTargetInfluences[hi] = THREE.MathUtils.lerp(head.morphTargetInfluences[hi], 0, 0.4);
      if (ti !== undefined)
        teeth.morphTargetInfluences[ti] = THREE.MathUtils.lerp(teeth.morphTargetInfluences[ti], 0, 0.4);
    });

    const cycle = Math.floor(t * 6) % 8;
    const cueLetters = ["D", "E", "F", "C", "A", "G", "H", "B"];
    const activeViseme = corresponding[cueLetters[cycle]];
    const intensity = 0.6 + Math.sin(t * 10) * 0.3;

    const hi = head.morphTargetDictionary[activeViseme];
    const ti = teeth?.morphTargetDictionary?.[activeViseme];
    if (hi !== undefined)
      head.morphTargetInfluences[hi] = THREE.MathUtils.lerp(head.morphTargetInfluences[hi], intensity, 0.4);
    if (ti !== undefined)
      teeth.morphTargetInfluences[ti] = THREE.MathUtils.lerp(teeth.morphTargetInfluences[ti], intensity, 0.4);
  });

  /* ── Idle blink ── */
  useFrame((state) => {
    const head = nodes.Wolf3D_Head;
    if (!head?.morphTargetDictionary) return;
    const t = state.clock.elapsedTime;
    const blink = Math.sin(t * 0.5) > 0.97 ? 1 : 0;
    const blL = head.morphTargetDictionary["eyeBlinkLeft"];
    const blR = head.morphTargetDictionary["eyeBlinkRight"];
    if (blL !== undefined) head.morphTargetInfluences[blL] = blink;
    if (blR !== undefined) head.morphTargetInfluences[blR] = blink;
  });

  return (
    <group dispose={null} ref={group}>
      <primitive object={nodes.Hips} />
      <skinnedMesh
        name="EyeLeft"
        geometry={nodes.EyeLeft.geometry}
        material={materials.Wolf3D_Eye}
        skeleton={nodes.EyeLeft.skeleton}
        morphTargetDictionary={nodes.EyeLeft.morphTargetDictionary}
        morphTargetInfluences={nodes.EyeLeft.morphTargetInfluences}
      />
      <skinnedMesh
        name="EyeRight"
        geometry={nodes.EyeRight.geometry}
        material={materials.Wolf3D_Eye}
        skeleton={nodes.EyeRight.skeleton}
        morphTargetDictionary={nodes.EyeRight.morphTargetDictionary}
        morphTargetInfluences={nodes.EyeRight.morphTargetInfluences}
      />
      <skinnedMesh
        name="Wolf3D_Head"
        geometry={nodes.Wolf3D_Head.geometry}
        material={materials.Wolf3D_Skin}
        skeleton={nodes.Wolf3D_Head.skeleton}
        morphTargetDictionary={nodes.Wolf3D_Head.morphTargetDictionary}
        morphTargetInfluences={nodes.Wolf3D_Head.morphTargetInfluences}
      />
      <skinnedMesh
        name="Wolf3D_Teeth"
        geometry={nodes.Wolf3D_Teeth.geometry}
        material={materials.Wolf3D_Teeth}
        skeleton={nodes.Wolf3D_Teeth.skeleton}
        morphTargetDictionary={nodes.Wolf3D_Teeth.morphTargetDictionary}
        morphTargetInfluences={nodes.Wolf3D_Teeth.morphTargetInfluences}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Body.geometry}
        material={materials.Wolf3D_Body}
        skeleton={nodes.Wolf3D_Body.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Outfit_Bottom.geometry}
        material={materials.Wolf3D_Outfit_Bottom}
        skeleton={nodes.Wolf3D_Outfit_Bottom.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Outfit_Footwear.geometry}
        material={materials.Wolf3D_Outfit_Footwear}
        skeleton={nodes.Wolf3D_Outfit_Footwear.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Outfit_Top.geometry}
        material={materials.Wolf3D_Outfit_Top}
        skeleton={nodes.Wolf3D_Outfit_Top.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Hair.geometry}
        material={materials.Wolf3D_Hair}
        skeleton={nodes.Wolf3D_Hair.skeleton}
      />
    </group>
  );
}

useGLTF.preload("/assets/models/avatar2.glb");
