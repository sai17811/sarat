'use client';

import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import {
  AdditiveBlending, BufferAttribute, BufferGeometry, Color, DoubleSide, Float32BufferAttribute,
  Mesh, PlaneGeometry, ShaderMaterial, SpriteMaterial, Vector3,
} from 'three';
import { APEX, SH, SW, SY, SZ } from '@/lib/hall';
import { useStore } from '@/lib/store';
import { beamColor, frame } from './frameState';
import { getTextures } from './textures';

const additive = { transparent: true, blending: AdditiveBlending, depthWrite: false } as const;

/** Projector beam: a 4-sided light pyramid with soft edges and slow shimmer. */
export function Beam() {
  const { geometry, material } = useMemo(() => {
    const corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => new Vector3((a * SW) / 2, SY + (b * SH) / 2, SZ + 0.6));
    const pos: number[] = [], tt: number[] = [], uu: number[] = [];
    for (let f = 0; f < 4; f++) {
      const a = corners[f], b = corners[(f + 1) % 4];
      pos.push(...APEX.toArray(), ...a.toArray(), ...b.toArray());
      tt.push(0, 1, 1);
      uu.push(0.5, 0, 1);
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(pos, 3));
    geometry.setAttribute('t', new Float32BufferAttribute(tt, 1));
    geometry.setAttribute('u', new Float32BufferAttribute(uu, 1));
    const material = new ShaderMaterial({
      ...additive,
      side: DoubleSide,
      uniforms: { uTime: { value: 0 }, uColor: beamColor, uStr: { value: 1 } },
      vertexShader: /* glsl */ `attribute float t; attribute float u; varying float vT; varying float vU;
        void main(){ vT=t; vU=u; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
      fragmentShader: /* glsl */ `uniform float uTime; uniform vec3 uColor; uniform float uStr; varying float vT; varying float vU;
        void main(){ float e=pow(sin(3.14159*clamp(vU,0.,1.)),1.6); float f=mix(1.,.25,vT);
          float n=.8+.2*sin(vT*41.-uTime*2.4)*sin(vU*23.+uTime*.9);
          gl_FragColor=vec4(uColor*.13*e*f*n*uStr,1.); }`,
    });
    return { geometry, material };
  }, []);

  useFrame((s) => {
    material.uniforms.uTime.value = s.clock.elapsedTime;
    material.uniforms.uStr.value = frame.beam;
  });

  const tx = getTextures();
  const flareMat = useMemo(() => new SpriteMaterial({ map: tx.flare, color: new Color(1.6, 1.4, 1.1), ...additive }), [tx]);

  return (
    <>
      <mesh geometry={geometry} material={material} frustumCulled={false} />
      <sprite material={flareMat} position={[APEX.x, APEX.y, APEX.z - 0.4]} scale={2.6} />
    </>
  );
}

/** Dust drifting through the beam: one draw call, motion done on the GPU. */
export function Dust() {
  const tier = useStore((s) => s.tier);
  const dpr = useThree((s) => s.viewport.dpr);
  const count = tier === 'high' ? 1200 : 220;

  const { geometry, material } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const rnd = new Float32Array(count);
    const v = new Vector3();
    for (let i = 0; i < count; i++) {
      v.set((Math.random() * 2 - 1) * (SW / 2), SY + (Math.random() * 2 - 1) * (SH / 2), SZ + 0.6)
        .lerp(APEX, 1 - (Math.pow(Math.random(), 0.6) * 0.95 + 0.03));
      v.toArray(pos, i * 3);
      rnd[i] = Math.random();
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(pos, 3));
    geometry.setAttribute('aR', new BufferAttribute(rnd, 1));
    const material = new ShaderMaterial({
      ...additive,
      uniforms: { uTime: { value: 0 }, uPx: { value: 1 }, uColor: beamColor },
      vertexShader: /* glsl */ `uniform float uTime; uniform float uPx; attribute float aR; varying float vA;
        void main(){ vec3 p=position; p.x+=sin(uTime*.3+aR*30.)*.28; p.y+=sin(uTime*.2+aR*17.)*.32; p.z+=cos(uTime*.25+aR*11.)*.28;
          vec4 mv=modelViewMatrix*vec4(p,1.); gl_Position=projectionMatrix*mv;
          gl_PointSize=uPx*2.3*(.5+aR)*(30./-mv.z); vA=.3+.7*(.5+.5*sin(uTime*1.4+aR*50.)); }`,
      fragmentShader: /* glsl */ `uniform vec3 uColor; varying float vA;
        void main(){ float d=length(gl_PointCoord-.5); gl_FragColor=vec4(uColor*1.4*vA*smoothstep(.5,0.,d),1.); }`,
    });
    return { geometry, material };
  }, [count]);

  useFrame((s) => {
    material.uniforms.uTime.value = s.clock.elapsedTime;
    material.uniforms.uPx.value = dpr;
  });

  return <points geometry={geometry} material={material} frustumCulled={false} />;
}

/** Fibre-optic star ceiling ("a star in the sky"). */
export function Stars() {
  const dpr = useThree((s) => s.viewport.dpr);
  const tier = useStore((s) => s.tier);
  const n = tier === 'high' ? 900 : 250;
  const { geometry, material } = useMemo(() => {
    const pos = new Float32Array(n * 3);
    const rnd = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (Math.random() * 2 - 1) * 12.2;
      pos[i * 3 + 1] = 15.48;
      pos[i * 3 + 2] = -1.5 + Math.random() * 31;
      rnd[i] = Math.random();
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(pos, 3));
    geometry.setAttribute('aR', new BufferAttribute(rnd, 1));
    const material = new ShaderMaterial({
      ...additive,
      uniforms: { uTime: { value: 0 }, uPx: { value: 1 } },
      vertexShader: /* glsl */ `uniform float uTime; uniform float uPx; attribute float aR; varying float vA;
        void main(){ vec4 mv=modelViewMatrix*vec4(position,1.); gl_Position=projectionMatrix*mv;
          gl_PointSize=uPx*(1.2+aR*2.2)*(14./-mv.z); vA=.35+.65*(.5+.5*sin(uTime*(.6+aR*2.)+aR*40.)); }`,
      fragmentShader: /* glsl */ `varying float vA;
        void main(){ float d=length(gl_PointCoord-.5); gl_FragColor=vec4(vec3(1.6,1.45,1.2)*vA*smoothstep(.5,0.,d),1.); }`,
    });
    return { geometry, material };
  }, [n]);

  useFrame((s) => {
    material.uniforms.uTime.value = s.clock.elapsedTime;
    material.uniforms.uPx.value = dpr;
  });

  return <points geometry={geometry} material={material} />;
}

/** Dolby Atmos rings overhead, faded in only on the Experience reel. */
export function AtmosRings() {
  const { geometry, material } = useMemo(() => {
    const geometry = new PlaneGeometry(25, 33);
    const material = new ShaderMaterial({
      ...additive,
      side: DoubleSide,
      uniforms: { uTime: { value: 0 }, uStr: { value: 0 } },
      vertexShader: /* glsl */ `varying vec2 vP; void main(){ vP=position.xy; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
      fragmentShader: /* glsl */ `uniform float uTime; uniform float uStr; varying vec2 vP;
        void main(){ float d=length(vP); float r=fract(d*.2-uTime*.45);
          float ring=smoothstep(0.,.05,r)*smoothstep(.16,.05,r); float f=smoothstep(17.,1.5,d);
          gl_FragColor=vec4(vec3(.5,.75,1.2)*ring*f*.7*uStr,1.); }`,
    });
    return { geometry, material };
  }, []);

  const mesh = useRef<Mesh>(null);
  useFrame((s) => {
    material.uniforms.uTime.value = s.clock.elapsedTime;
    material.uniforms.uStr.value = frame.atmos;
    if (mesh.current) mesh.current.visible = frame.atmos > 0.01; // skip the draw call when faded out
  });

  return <mesh ref={mesh} geometry={geometry} material={material} rotation-x={-Math.PI / 2} position={[0, 13.4, 13.4]} />;
}
