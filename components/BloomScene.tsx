'use client';
import { MutableRefObject, Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer, Sparkles, useAnimations, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { MODEL_URL, STAGES } from '@/config/hero';

type Progress = MutableRefObject<number>;
type Orig = { mat: THREE.MeshStandardMaterial; color: THREE.Color; rough: number };

const N = STAGES.length;
const ease = (t: number) => t * t * (3 - 2 * t);

function mixAt(p: number) {
  const f = Math.min(1, Math.max(0, p)) * (N - 1);
  const i = Math.min(N - 2, Math.floor(f));
  return { a: STAGES[i], b: STAGES[i + 1], t: ease(f - i), f };
}

function Woman({ progress }: { progress: Progress }) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(MODEL_URL);
  const { actions, names } = useAnimations(animations, group);

  const { scale, offsetY, origs } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const h = box.max.y - box.min.y || 1;
    const s = 1.85 / h;
    const list: Orig[] = [];
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      const mats = Array.isArray(m.material) ? m.material : [m.material];
      mats.forEach((mt) => {
        const sm = mt as THREE.MeshStandardMaterial;
        if (sm.color) list.push({ mat: sm, color: sm.color.clone(), rough: sm.roughness ?? 0.6 });
      });
    });
    return { scale: s, offsetY: -box.min.y * s, origs: list };
  }, [scene]);

  useEffect(() => {
    const a = names.length ? actions[names[0]] : null;
    if (a) { a.reset().fadeIn(0.6).play(); a.timeScale = 0.55; }
    return () => { a?.fadeOut(0.2); };
  }, [actions, names]);

  const tmp = useMemo(() => ({ c: new THREE.Color(), c2: new THREE.Color(), e: new THREE.Color(), e2: new THREE.Color() }), []);

  useFrame(() => {
    const p = progress.current;
    if (group.current) group.current.rotation.y = p * Math.PI * 4;
    const { a, b, t } = mixAt(p);
    tmp.c.set(a.tint).lerp(tmp.c2.set(b.tint), t);
    tmp.e.set(a.emissive).lerp(tmp.e2.set(b.emissive), t);
    const glow = a.glow + (b.glow - a.glow) * t;
    const rough = a.roughness + (b.roughness - a.roughness) * t;
    for (const o of origs) {
      o.mat.color.copy(o.color).lerp(tmp.c, 0.42);
      o.mat.emissive?.copy(tmp.e);
      o.mat.emissiveIntensity = glow;
      o.mat.roughness = Math.max(0.15, o.rough * 0.5 + rough * 0.5);
    }
  });

  return (
    <group position={[0, offsetY, 0]}>
      <group ref={group} scale={scale}>
        <primitive object={scene} />
      </group>
    </group>
  );
}

function makeTexture(label: string, color: string) {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 340;
  const g = c.getContext('2d')!;
  const grd = g.createLinearGradient(0, 0, 256, 340);
  grd.addColorStop(0, '#ffffff'); grd.addColorStop(1, color);
  g.fillStyle = grd; g.fillRect(0, 0, 256, 340);
  g.fillStyle = 'rgba(47,58,47,0.85)';
  g.font = '600 22px serif'; g.textAlign = 'center';
  g.fillText(label, 128, 310);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function Card({ index, progress }: { index: number; progress: Progress }) {
  const st = STAGES[index];
  const ref = useRef<THREE.Mesh>(null);
  const R = 2.15;
  const ang = (index * Math.PI * 2) / N;
  const mat = useMemo(() => {
    const m = new THREE.MeshBasicMaterial({ map: makeTexture(st.product, st.aura), side: THREE.DoubleSide, toneMapped: false });
    new THREE.TextureLoader().load(st.image, (tex) => { tex.colorSpace = THREE.SRGBColorSpace; m.map = tex; m.needsUpdate = true; }, undefined, () => {});
    return m;
  }, [st]);
  useFrame(() => {
    if (!ref.current) return;
    const f = progress.current * (N - 1);
    const act = Math.max(0, 1 - Math.abs(f - index));
    ref.current.scale.setScalar(0.85 + 0.3 * act);
  });
  return (
    <mesh ref={ref} material={mat} position={[Math.sin(ang) * R, 1.05, Math.cos(ang) * R]} rotation={[0, ang, 0]}>
      <planeGeometry args={[0.72, 0.96]} />
    </mesh>
  );
}

function Ring({ progress }: { progress: Progress }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (ref.current) ref.current.rotation.y = -progress.current * (N - 1) * ((Math.PI * 2) / N) + 0.85;
  });
  return (
    <group ref={ref}>
      {STAGES.map((_, i) => <Card key={i} index={i} progress={progress} />)}
    </group>
  );
}

function Rig({ progress }: { progress: Progress }) {
  const light = useRef<THREE.PointLight>(null);
  const c = useMemo(() => new THREE.Color(), []);
  const c2 = useMemo(() => new THREE.Color(), []);
  useFrame(() => {
    const { a, b, t } = mixAt(progress.current);
    c.set(a.aura).lerp(c2.set(b.aura), t);
    light.current?.color.copy(c);
  });
  return <pointLight ref={light} position={[-2, 2.2, 2]} intensity={28} distance={9} />;
}

export default function BloomScene({ progress, auraColor }: { progress: Progress; auraColor: string }) {
  return (
    <Canvas dpr={[1, 1.75]} camera={{ position: [0, 1.15, 5], fov: 30 }} gl={{ alpha: true, antialias: true }} onCreated={({ camera }) => camera.lookAt(0, 0.95, 0)}>
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 5, 4]} intensity={1.6} />
      <Rig progress={progress} />
      <Suspense fallback={null}>
        <Environment resolution={256}>
          <Lightformer form='rect' intensity={2} position={[0, 4, 3]} scale={[8, 4, 1]} />
          <Lightformer form='rect' intensity={1} position={[-4, 1, -2]} scale={[3, 6, 1]} />
        </Environment>
        <Woman progress={progress} />
        <Ring progress={progress} />
        <Sparkles count={50} scale={[5, 3, 5]} position={[0, 1.2, 0]} size={3} speed={0.4} color={auraColor} />
        <ContactShadows position={[0, 0, 0]} opacity={0.35} scale={6} blur={2.4} far={3} />
      </Suspense>
    </Canvas>
  );
}
