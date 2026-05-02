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

  /* ── Audio-synced lip-sync (from reference repo) ── */
  useFrame(() => {
    const audio = currentMessage?.audio;
    const lipsync = currentMessage?.lipSync;

    if (!audio || !lipsync) {
      if (!isTalking) setAnimation("Idle");
      return;
    }

    const currentAudioTime = audio.currentTime;
    if (audio.paused || audio.ended) {
      setAnimation("Idle");
      return;
    }

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

  /* ── Head follows camera ── */
  useFrame((state) => {
    if (group.current) {
      const headBone = group.current.getObjectByName("Head");
      if (headBone) headBone.lookAt(state.camera.position);
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
