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
        // Handle various common mixamo naming conventions
        track.name = track.name.replace(/^mixamorig_?/, "");
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
  }, [animation, actions]);

  /* ── Audio-driven state ── */
  const [playAudio, setPlayAudio] = useState(false);
  useEffect(() => {
    if (currentMessage?.audio && !currentMessage.audio.ended) {
      setPlayAudio(true);
    } else {
      setPlayAudio(false);
    }
  }, [currentMessage]);

  /* ── Start audio & switch to Speech animation ── */
  useEffect(() => {
    const audio = currentMessage?.audio;
    if (audio) {
      audio.play();
      setAnimation("Speech");
    } else {
      setAnimation(isTalking ? "Speech" : "Idle");
    }
  }, [playAudio, isTalking]);

  /* ── Lip-Sync and Head Follow ── */
  useFrame((state) => {
    const audio = currentMessage?.audio;
    const lipsync = currentMessage?.lipSync;
    const head = nodes.Wolf3D_Head;
    const teeth = nodes.Wolf3D_Teeth;

    if (!head || !head.morphTargetDictionary) return;

    const t = state.clock.elapsedTime;
    
    // 1. Head Follow (Lerped for smoothness)
    if (group.current) {
      const headBone = group.current.getObjectByName("Head") || group.current.getObjectByName("mixamorigHead");
      if (headBone) {
        const targetRotation = new THREE.Quaternion();
        const currentRotation = headBone.quaternion.clone();
        headBone.lookAt(state.camera.position);
        targetRotation.copy(headBone.quaternion);
        headBone.quaternion.copy(currentRotation);
        headBone.quaternion.slerp(targetRotation, 0.1);
      }
    }

    // 2. Lip Sync
    // Reset visemes
    Object.values(corresponding).forEach((v) => {
      const hi = head.morphTargetDictionary[v];
      const ti = teeth?.morphTargetDictionary?.[v];
      if (hi !== undefined) head.morphTargetInfluences[hi] = THREE.MathUtils.lerp(head.morphTargetInfluences[hi], 0, 0.3);
      if (ti !== undefined) teeth.morphTargetInfluences[ti] = THREE.MathUtils.lerp(teeth.morphTargetInfluences[ti], 0, 0.3);
    });

    if (audio && lipsync && !audio.paused && !audio.ended) {
      // Precise Audio Lip Sync
      const currentAudioTime = audio.currentTime;
      for (let i = 0; i < lipsync.mouthCues.length; i++) {
        const cue = lipsync.mouthCues[i];
        if (currentAudioTime >= cue.start && currentAudioTime <= cue.end) {
          const viseme = corresponding[cue.value];
          const hi = head.morphTargetDictionary[viseme];
          const ti = teeth?.morphTargetDictionary?.[viseme];
          if (hi !== undefined) head.morphTargetInfluences[hi] = THREE.MathUtils.lerp(head.morphTargetInfluences[hi], 1, 0.8);
          if (ti !== undefined) teeth.morphTargetInfluences[ti] = THREE.MathUtils.lerp(teeth.morphTargetInfluences[ti], 1, 0.8);
          break;
        }
      }
    } else if (isTalking) {
      // Fallback Procedural Lip Sync
      const cycle = Math.floor(t * 10) % 8;
      const cueLetters = ["D", "E", "F", "C", "A", "G", "H", "B"];
      const activeViseme = corresponding[cueLetters[cycle]];
      const intensity = 0.5 + Math.sin(t * 15) * 0.4;
      const hi = head.morphTargetDictionary[activeViseme];
      const ti = teeth?.morphTargetDictionary?.[activeViseme];
      if (hi !== undefined) head.morphTargetInfluences[hi] = THREE.MathUtils.lerp(head.morphTargetInfluences[hi], intensity, 0.8);
      if (ti !== undefined) teeth.morphTargetInfluences[ti] = THREE.MathUtils.lerp(teeth.morphTargetInfluences[ti], intensity, 0.8);
    }
  });

  /* ── Idle blink ── */
  useFrame((state) => {
    const head = nodes.Wolf3D_Head;
    if (!head?.morphTargetDictionary) return;
    const t = state.clock.elapsedTime;
    const blink = Math.sin(t * 0.5) > 0.97 ? 1 : 0;
    const blL = head.morphTargetDictionary["eyeBlinkLeft"];
    const blR = head.morphTargetDictionary["eyeBlinkRight"];
    if (blL !== undefined) head.morphTargetInfluences[blL] = THREE.MathUtils.lerp(head.morphTargetInfluences[blL], blink, 0.5);
    if (blR !== undefined) head.morphTargetInfluences[blR] = THREE.MathUtils.lerp(head.morphTargetInfluences[blR], blink, 0.5);
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
