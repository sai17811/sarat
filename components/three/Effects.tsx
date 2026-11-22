'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Bloom, ChromaticAberration, EffectComposer, Noise, Sepia, ToneMapping, Vignette } from '@react-three/postprocessing';
import { BlendFunction, ToneMappingMode, type SepiaEffect } from 'postprocessing';
import { Vector2 } from 'three';
import { useStore } from '@/lib/store';
import { frame } from './frameState';

/**
 * Film look. postprocessing merges these effects into ONE fullscreen pass.
 * High tier: 4x MSAA + full stack. Low tier: no MSAA, bloom + vignette only.
 */
export function Effects() {
  const tier = useStore((s) => s.tier);
  const sepia = useRef<SepiaEffect>(null);
  const caOffset = useMemo(() => new Vector2(0.0007, 0.0007), []);

  useFrame(() => {
    const s = sepia.current as unknown as { intensity?: number } | null;
    if (s) s.intensity = frame.sepia;
  });

  // Skip fullscreen post-processing on budget GPUs; the 3D scene stays usable.
  if (tier === 'low') return null;

  return (
    <EffectComposer multisampling={4} enableNormalPass={false}>
      <Bloom mipmapBlur intensity={0.6} luminanceThreshold={0.9} luminanceSmoothing={0.2} />
      <ChromaticAberration offset={caOffset} radialModulation modulationOffset={0.35} />
      <Sepia ref={sepia} intensity={0} />
      <Vignette offset={0.25} darkness={0.75} />
      <Noise blendFunction={BlendFunction.OVERLAY} opacity={0.08} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  );
}
