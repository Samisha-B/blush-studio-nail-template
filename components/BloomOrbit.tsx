'use client';
import { MutableRefObject, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { STAGES } from '@/config/hero';

type Progress = MutableRefObject<number>;
const N = STAGES.length;

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
  const R = 2.9;
  const ang = (index * Math.PI * 2) / N;
  const mat = useMemo(() => {
    const m = new THREE.MeshBasicMaterial({ map: makeTexture(st.product, st.aura), toneMapped: false });
    new THREE.TextureLoader().load(st.image, (tex) => { tex.colorSpace = THREE.SRGBColorSpace; m.map = tex; m.needsUpdate = true; }, undefined, () => {});
    return m;
  }, [st]);
  useFrame((state) => {
    if (!ref.current) return;
    const f = progress.current * (N - 1);
    const act = Math.max(0, 1 - Math.abs(f - index));
    ref.current.scale.setScalar(0.8 + 0.3 * act);
    ref.current.lookAt(state.camera.position.x * 0.5, ref.current.getWorldPosition(new THREE.Vector3()).y, state.camera.position.z);
  });
  return (
    <mesh ref={ref} material={mat} position={[Math.sin(ang) * R, 1.2, Math.cos(ang) * R]}>
      <planeGeometry args={[0.7, 0.93]} />
    </mesh>
  );
}

function Ring({ progress }: { progress: Progress }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (ref.current) ref.current.rotation.y = -Math.min(1, Math.max(0, progress.current)) * (N - 1) * ((Math.PI * 2) / N) + 0.95;
  });
  return (
    <group ref={ref}>
      {STAGES.map((_, i) => <Card key={i} index={i} progress={progress} />)}
    </group>
  );
}

function Cam() {
  useFrame(({ camera, size }) => {
    const aspect = size.width / size.height;
    const z = aspect < 0.75 ? 7.5 : aspect < 1.1 ? 6.2 : 5.2;
    camera.position.z += (z - camera.position.z) * 0.1;
    camera.position.y = 1.2;
    camera.lookAt(0, 1.15, 0);
  });
  return null;
}

export default function BloomOrbit({ progress, auraColor }: { progress: Progress; auraColor: string }) {
  return (
    <Canvas dpr={[1, 1.75]} camera={{ position: [0, 1.2, 5.2], fov: 30 }} gl={{ alpha: true, antialias: true }}>
      <Cam />
      <Ring progress={progress} />
      <Sparkles count={60} scale={[6, 3.5, 4]} position={[0, 1.4, 0]} size={3} speed={0.4} color={auraColor} />
    </Canvas>
  );
}
