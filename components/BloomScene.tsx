'use client';
import { Component, MutableRefObject, ReactNode, Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Lightformer, Sparkles, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { CROP_MODE, MODEL_URL, PORTRAIT_URL, STAGES } from '@/config/hero';

type Progress = MutableRefObject<number>;

const N = STAGES.length;
const CUT_Y = 0.35;
const TOP_Y = 1.9;
const WARM = new THREE.Color('#8a3d24');
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
  componentDidCatch(e: unknown) { console.warn('[BloomHero] asset failed to load', e); }
  render() { return this.state.failed ? null : this.props.children; }
}

/* ---------- Portrait (default) ---------- */
function archTexture() {
  const w = 512, h = 680;
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d')!;
  g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#fff';
  g.beginPath();
  g.moveTo(0, h); g.lineTo(0, w / 2);
  g.arc(w / 2, w / 2, w / 2, Math.PI, 0);
  g.lineTo(w, h); g.closePath(); g.fill();
  return new THREE.CanvasTexture(c);
}

function glowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d')!;
  const r = g.createRadialGradient(128, 128, 10, 128, 128, 128);
  r.addColorStop(0, 'rgba(255,255,255,0.9)'); r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r; g.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

function Portrait({ progress }: { progress: Progress }) {
  const group = useRef<THREE.Group>(null);
  const glow = useRef<THREE.MeshBasicMaterial>(null);
  const W = 1.55, H = 2.05;
  const alpha = useMemo(() => archTexture(), []);
  const halo = useMemo(() => glowTexture(), []);
  const mat = useMemo(() => {
    const m = new THREE.MeshBasicMaterial({ color: '#ffffff', alphaMap: alpha, transparent: true, toneMapped: false });
    new THREE.TextureLoader().load(PORTRAIT_URL, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      const imgAspect = tex.image.width / tex.image.height;
      const want = W / H;
      const rx = Math.min(1, want / imgAspect);
      tex.repeat.set(rx, 1);
      tex.offset.set((1 - rx) / 2, 0);
      m.map = tex; m.needsUpdate = true;
    }, undefined, () => console.warn('[BloomHero] Missing ' + PORTRAIT_URL));
    return m;
  }, [alpha]);
  const c1 = useMemo(() => new THREE.Color(), []);
  const c2 = useMemo(() => new THREE.Color(), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const { i, a, b, t: k } = mixAt(progress.current);
    const g = group.current;
    if (g) {
      const swing = Math.sin(Math.PI * k) * 0.55 * (i % 2 ? -1 : 1);
      const tx = state.pointer.x * 0.18, ty = -state.pointer.y * 0.08;
      g.rotation.y += (swing + tx - g.rotation.y) * 0.08;
      g.rotation.x += (ty + Math.sin(t * 0.5) * 0.015 - g.rotation.x) * 0.08;
      g.position.y = 1.15 + Math.sin(t * 0.9) * 0.025;
      g.scale.setScalar(1 + Math.sin(t * 1.6) * 0.005);
    }
    c1.set(a.tint).lerp(c2.set(b.tint), k);
    const gl = a.glow + (b.glow - a.glow) * k;
    mat.color.set('#ffffff').lerp(c1, 0.18).multiplyScalar(0.96 + gl * 0.35);
    if (glow.current) {
      glow.current.color.set(a.aura).lerp(c2.set(b.aura), k);
      glow.current.opacity = 0.35 + gl * 1.2;
    }
  });

  return (
    <group ref={group} position={[0, 1.15, 0]}>
      <mesh position={[0, 0, -0.08]} scale={[2.3, 2.3, 1]}>
        <planeGeometry args={[2, 2]} />
        <meshBasicMaterial ref={glow} map={halo} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      <mesh material={mat}>
        <planeGeometry args={[W, H]} />
      </mesh>
    </group>
  );
}

/* ---------- Optional GLB character ---------- */
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
            sheen: 0.6, sheenColor: new THREE.Color('#ff9f80'), sheenRoughness: 0.45, clearcoat: 0, clearcoatRoughness: 0.35,
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
    const base = { head: bones.head?.quaternion.clone(), neck: bones.neck?.quaternion.clone(), spine: bones.spine?.quaternion.clone() };
    return { s, ox: -cx * s, oy: CUT_Y - bottom * s, oz: -cz * s, mats, blink, bones, base };
  }, [scene, plane]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const { i, a, b, t: k } = mixAt(progress.current);
    if (yaw.current) yaw.current.rotation.y = (i + k) * Math.PI * 2;
    if (body.current) body.current.scale.setScalar(rig.s * (1 + Math.sin(t * 1.6) * 0.0035));
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

/* ---------- Orbit cards ---------- */
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
  const R = 2.7;
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
    ref.current.scale.setScalar(0.8 + 0.25 * act);
  });
  return (
    <mesh ref={ref} material={mat} position={[Math.sin(ang) * R, 1.15, Math.cos(ang) * R]} rotation={[0, ang, 0]}>
      <planeGeometry args={[0.6, 0.8]} />
    </mesh>
  );
}

function Ring({ progress }: { progress: Progress }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (ref.current) ref.current.rotation.y = -progress.current * (N - 1) * ((Math.PI * 2) / N) + 0.9;
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
    const z = aspect < 0.75 ? 7 : aspect < 1.1 ? 5.8 : 4.9;
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
      camera={{ position: [0, 1.2, 4.9], fov: 30 }}
      gl={{ alpha: true, antialias: true }}
      onCreated={({ gl }) => { gl.localClippingEnabled = true; gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.05; }}
    >
      <ambientLight intensity={0.5} color='#fff1e6' />
      <directionalLight position={[2.5, 4, 4]} intensity={1.5} color='#fff4ea' />
      <Rig progress={progress} />
      <Suspense fallback={null}>
        <Environment resolution={256}>
          <Lightformer form='rect' intensity={2.2} color='#fff3e8' position={[0, 4, 3]} scale={[8, 4, 1]} />
          <Lightformer form='rect' intensity={1} color='#ffe0cc' position={[-4, 1, -2]} scale={[3, 6, 1]} />
        </Environment>
        <Boundary>{MODEL_URL ? <Woman progress={progress} /> : <Portrait progress={progress} />}</Boundary>
        <Ring progress={progress} />
        <Sparkles count={50} scale={[5, 3, 5]} position={[0, 1.3, 0]} size={3} speed={0.4} color={auraColor} />
      </Suspense>
    </Canvas>
  );
}
