'use client';
import { Component, MutableRefObject, ReactNode, Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Lightformer, Sparkles, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { CROP_MODE, MODEL_URL, STAGES } from '@/config/hero';

type Progress = MutableRefObject<number>;

const N = STAGES.length;
const CUT_Y = 0.35; // world height of the mid-chest cut
const TOP_Y = 1.9; // world height of the top of the head
const WARM = new THREE.Color('#8a3d24'); // inner skin glow
const ease = (t: number) => t * t * (3 - 2 * t);
const clamp = (n: number, a = 0, b = 1) => Math.min(b, Math.max(a, n));

function mixAt(p: number) {
  const f = clamp(p) * (N - 1);
  const i = Math.min(N - 2, Math.floor(f));
  return { i, a: STAGES[i], b: STAGES[i + 1], t: ease(f - i), f };
}

class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(e: unknown) { console.warn(`[BloomHero] Could not load model at ${MODEL_URL}. Add a GLB at public/models/woman.glb.`, e); }
  render() { return this.state.failed ? null : this.props.children; }
}

type MatRec = { mat: THREE.MeshStandardMaterial; color: THREE.Color; rough: number; skin: boolean };
type BlinkRec = { mesh: THREE.Mesh; idx: number[] };

const BLINK_KEYS = ['eyeBlinkLeft', 'eyeBlinkRight', 'eyesClosed', 'blink', 'Blink', 'eyeBlink_L', 'eyeBlink_R', 'Eye_Blink_L', 'Eye_Blink_R'];

function Woman({ progress }: { progress: Progress }) {
  const yaw = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const { scene } = useGLTF(MODEL_URL);
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), -CUT_Y), []);
  const blinkState = useRef({ next: 2.5, start: -1 });
  const tmp = useMemo(() => ({ c: new THREE.Color(), c2: new THREE.Color(), q: new THREE.Quaternion(), e: new THREE.Euler() }), []);

  const rig = useMemo(() => {
    scene.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const ratio = size.y / Math.max(size.x, size.z, 0.0001);
    const full = CROP_MODE === 'always' || (CROP_MODE === 'auto' && ratio > 1.8);
    const bottom = full ? box.min.y + size.y * 0.68 : box.min.y;
    const s = (TOP_Y - CUT_Y) / Math.max(box.max.y - bottom, 0.0001);
    const cx = (box.min.x + box.max.x) / 2;
    const cz = (box.min.z + box.max.z) / 2;

    const mats: MatRec[] = [];
    const blink: BlinkRec[] = [];
    const bones: { head?: THREE.Object3D; neck?: THREE.Object3D; spine?: THREE.Object3D } = {};

    scene.traverse((o) => {
      const n = o.name.replace(/^mixamorig:?/i, '');
      if (/^head$/i.test(n)) bones.head = o;
      else if (/^neck$/i.test(n)) bones.neck = o;
      else if (/^spine2?$/i.test(n) && !bones.spine) bones.spine = o;

      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      m.frustumCulled = false;
      const dict = m.morphTargetDictionary;
      if (dict && m.morphTargetInfluences) {
        const idx = BLINK_KEYS.map((k) => dict[k]).filter((v): v is number => v !== undefined);
        if (idx.length) blink.push({ mesh: m, idx });
      }
      const arr = Array.isArray(m.material) ? m.material : [m.material];
      const next = arr.map((mt) => {
        const old = mt as THREE.MeshStandardMaterial;
        if (!old.isMeshStandardMaterial) return mt;
        const skin = /skin|body|head|face|arm|neck|torso|hand/i.test(`${old.name} ${m.name}`);
        let out: THREE.MeshStandardMaterial = old;
        if (skin) {
          const p = new THREE.MeshPhysicalMaterial({
            map: old.map, normalMap: old.normalMap, roughnessMap: old.roughnessMap, aoMap: old.aoMap,
            color: old.color.clone(), roughness: Math.min(old.roughness, 0.62), metalness: 0,
            sheen: 0.6, sheenColor: new THREE.Color('#ff9f80'), sheenRoughness: 0.45,
            clearcoat: 0, clearcoatRoughness: 0.35,
          });
          p.normalScale.copy(old.normalScale);
          out = p;
        }
        if (full) { out.clippingPlanes = [plane]; out.clipShadows = true; }
        mats.push({ mat: out, color: out.color.clone(), rough: out.roughness, skin });
        return out;
      });
      m.material = Array.isArray(m.material) ? next : next[0];
    });

    const base = {
      head: bones.head?.quaternion.clone(), neck: bones.neck?.quaternion.clone(), spine: bones.spine?.quaternion.clone(),
    };
    return { s, ox: -cx * s, oy: CUT_Y - bottom * s, oz: -cz * s, mats, blink, bones, base };
  }, [scene, plane]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const { i, a, b, t: k } = mixAt(progress.current);

    if (yaw.current) yaw.current.rotation.y = (i + k) * Math.PI * 2;
    if (body.current) {
      body.current.scale.setScalar(rig.s * (1 + Math.sin(t * 1.6) * 0.0035));
      if (!rig.bones.head) body.current.rotation.z = Math.sin(t * 0.5) * 0.012;
    }

    const sway = (bone: THREE.Object3D | undefined, base: THREE.Quaternion | undefined, x: number, y: number, z: number) => {
      if (!bone || !base) return;
      bone.quaternion.copy(base).multiply(tmp.q.setFromEuler(tmp.e.set(x, y, z)));
    };
    sway(rig.bones.head, rig.base.head, Math.sin(t * 0.55) * 0.03, Math.sin(t * 0.37) * 0.06, Math.sin(t * 0.29) * 0.018);
    sway(rig.bones.neck, rig.base.neck, Math.sin(t * 0.5 + 1) * 0.012, Math.sin(t * 0.33) * 0.02, 0);
    sway(rig.bones.spine, rig.base.spine, Math.sin(t * 1.6) * 0.008, 0, 0);

    const bs = blinkState.current;
    if (bs.start < 0 && t > bs.next) bs.start = t;
    let w = 0;
    if (bs.start >= 0) {
      const u = (t - bs.start) / 0.2;
      if (u >= 1) { bs.start = -1; bs.next = t + 2.5 + Math.random() * 3.5; } else w = Math.sin(Math.PI * u);
    }
    for (const r of rig.blink) for (const ix of r.idx) if (r.mesh.morphTargetInfluences) r.mesh.morphTargetInfluences[ix] = w;

    tmp.c.set(a.tint).lerp(tmp.c2.set(b.tint), k);
    const glow = a.glow + (b.glow - a.glow) * k;
    const rough = a.roughness + (b.roughness - a.roughness) * k;
    for (const r of rig.mats) {
      r.mat.color.copy(r.color).lerp(tmp.c, r.skin ? 0.06 : 0.05);
      if (r.skin) {
        r.mat.roughness = 0.25 + rough * 0.4;
        r.mat.emissive.copy(WARM);
        r.mat.emissiveIntensity = glow * 0.45;
        const phys = r.mat as THREE.MeshPhysicalMaterial;
        if (phys.isMeshPhysicalMaterial) phys.clearcoat = glow * 1.4;
      }
    }
  });

  return (
    <group ref={yaw}>
      <group ref={body} position={[rig.ox, rig.oy, rig.oz]} scale={rig.s}>
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
    <mesh ref={ref} material={mat} position={[Math.sin(ang) * R, 1.15, Math.cos(ang) * R]} rotation={[0, ang, 0]}>
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
  useFrame(({ camera, size }) => {
    const { a, b, t } = mixAt(progress.current);
    c.set(a.aura).lerp(c2.set(b.aura), t);
    light.current?.color.copy(c);
    const aspect = size.width / size.height;
    const z = aspect < 0.75 ? 6.4 : aspect < 1.1 ? 5.3 : 4.4;
    camera.position.z += (z - camera.position.z) * 0.1;
    camera.position.y = 1.2;
    camera.lookAt(0, 1.15, 0);
  });
  return <pointLight ref={light} position={[-2, 2.4, 2.2]} intensity={24} distance={9} />;
}

export default function BloomScene({ progress, auraColor }: { progress: Progress; auraColor: string }) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 1.2, 4.4], fov: 30 }}
      gl={{ alpha: true, antialias: true }}
      onCreated={({ gl }) => { gl.localClippingEnabled = true; gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.05; }}
    >
      <ambientLight intensity={0.5} color='#fff1e6' />
      <directionalLight position={[2.5, 4, 4]} intensity={1.5} color='#fff4ea' />
      <directionalLight position={[-3, 2, -2]} intensity={0.8} color='#ffd9c2' />
      <Rig progress={progress} />
      <Suspense fallback={null}>
        <Environment resolution={256}>
          <Lightformer form='rect' intensity={2.2} color='#fff3e8' position={[0, 4, 3]} scale={[8, 4, 1]} />
          <Lightformer form='rect' intensity={1} color='#ffe0cc' position={[-4, 1, -2]} scale={[3, 6, 1]} />
        </Environment>
        <Boundary><Woman progress={progress} /></Boundary>
        <Ring progress={progress} />
        <Sparkles count={50} scale={[5, 3, 5]} position={[0, 1.3, 0]} size={3} speed={0.4} color={auraColor} />
      </Suspense>
    </Canvas>
  );
}
