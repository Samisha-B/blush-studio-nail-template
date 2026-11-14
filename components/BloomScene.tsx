'use client';
import { Component, MutableRefObject, ReactNode, Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Lightformer, Sparkles, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { CROP_MODE, MARBLE_COLOR, MODEL_URL, PORTRAIT_URL, SKIN_COLOR, STAGES, USE_PORTRAIT } from '@/config/hero';

type Progress = MutableRefObject<number>;

const N = STAGES.length;
const CUT_Y = 0.35;
const TOP_Y = 1.9;
const GLOW = '#ffd8c4';
const ease = (t: number) => t * t * (3 - 2 * t);
const clamp = (n: number, a = 0, b = 1) => Math.min(b, Math.max(a, n));
const MARBLE = process.env.NEXT_PUBLIC_MODEL_STYLE === 'marble';

// Eye + hair tuning (fractions of the model's total height H, measured from the top of the head).
const EYE = { y: 0.277, dx: 0.072, width: 0.1, iris: '#5b3a22' };
const HAIR = { frontFrom: 0.15, frontTo: 0.075, backBelow: 0.4, iterations: 5 };
const EYES_ON = process.env.NEXT_PUBLIC_EYES !== 'off';
const HAIR_FIX_ON = process.env.NEXT_PUBLIC_HAIR_FIX !== 'off';

function mixAt(p: number) {
  const f = clamp(p) * (N - 1);
  const i = Math.min(N - 2, Math.floor(f));
  return { i, a: STAGES[i], b: STAGES[i + 1], t: ease(f - i), f };
}

class Boundary extends Component<{ children: ReactNode; fallback?: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(e: unknown) { console.warn('[BloomHero] asset failed to load, using fallback', e); }
  render() { return this.state.failed ? (this.props.fallback ?? null) : this.props.children; }
}

/* Full smoothing (marble mode only): welds vertices, drops UVs. */
function smoothGeometry(src: THREE.BufferGeometry, iterations = 6): THREE.BufferGeometry {
  let g = src.clone();
  for (const k of Object.keys(g.attributes)) if (k !== 'position') g.deleteAttribute(k);
  g.morphAttributes = {};
  g.computeBoundingBox();
  const diag = g.boundingBox ? g.boundingBox.getSize(new THREE.Vector3()).length() : 1;
  g = mergeVertices(g, diag * 1e-4);
  const pos = g.attributes.position as THREE.BufferAttribute;
  const idx = g.index;
  if (!idx) { g.computeVertexNormals(); return g; }
  const n = pos.count;
  const nb: number[][] = Array.from({ length: n }, () => []);
  const ia = idx.array;
  for (let i = 0; i < ia.length; i += 3) {
    const a = ia[i], b = ia[i + 1], c = ia[i + 2];
    nb[a].push(b, c); nb[b].push(a, c); nb[c].push(a, b);
  }
  const p = pos.array as Float32Array;
  const tmp = new Float32Array(p.length);
  const pass = (lam: number) => {
    for (let v = 0; v < n; v++) {
      const list = nb[v];
      const o = v * 3;
      if (!list.length) { tmp[o] = p[o]; tmp[o + 1] = p[o + 1]; tmp[o + 2] = p[o + 2]; continue; }
      let sx = 0, sy = 0, sz = 0;
      for (const j of list) { sx += p[j * 3]; sy += p[j * 3 + 1]; sz += p[j * 3 + 2]; }
      const k = 1 / list.length;
      tmp[o] = p[o] + lam * (sx * k - p[o]);
      tmp[o + 1] = p[o + 1] + lam * (sy * k - p[o + 1]);
      tmp[o + 2] = p[o + 2] + lam * (sz * k - p[o + 2]);
    }
    p.set(tmp);
  };
  for (let it = 0; it < iterations; it++) { pass(0.5); pass(-0.53); }
  pos.needsUpdate = true;
  g.computeVertexNormals();
  g.computeBoundingBox();
  g.computeBoundingSphere();
  return g;
}

/* Region smoothing that KEEPS UVs/textures and never opens seams:
   vertices sharing a position move together; only vertices where weight(x,y,z) > 0 are smoothed. */
function smoothRegion(src: THREE.BufferGeometry, weight: (x: number, y: number, z: number) => number, iterations: number): THREE.BufferGeometry {
  const g = src.clone();
  const pos = g.attributes.position as THREE.BufferAttribute;
  const n = pos.count;
  g.computeBoundingBox();
  const diag = g.boundingBox ? g.boundingBox.getSize(new THREE.Vector3()).length() : 1;
  const q = diag * 1e-6 || 1e-6;
  const keyMap = new Map<string, number>();
  const cid = new Int32Array(n);
  const cpos: number[] = [];
  for (let i = 0; i < n; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const key = `${Math.round(x / q)},${Math.round(y / q)},${Math.round(z / q)}`;
    let c = keyMap.get(key);
    if (c === undefined) { c = cpos.length / 3; keyMap.set(key, c); cpos.push(x, y, z); }
    cid[i] = c;
  }
  const C = cpos.length / 3;
  const P = Float32Array.from(cpos);
  const w = new Float32Array(C);
  for (let c = 0; c < C; c++) w[c] = weight(P[c * 3], P[c * 3 + 1], P[c * 3 + 2]);
  const idx = g.index;
  const triCount = (idx ? idx.count : n) / 3;
  const tri = (t: number, k: number) => cid[idx ? idx.getX(t * 3 + k) : t * 3 + k];
  const nb: number[][] = Array.from({ length: C }, () => []);
  for (let t = 0; t < triCount; t++) {
    const a = tri(t, 0), b = tri(t, 1), c = tri(t, 2);
    nb[a].push(b, c); nb[b].push(a, c); nb[c].push(a, b);
  }
  const T = new Float32Array(P.length);
  const pass = (lam: number) => {
    for (let c = 0; c < C; c++) {
      const o = c * 3, list = nb[c];
      if (!list.length || w[c] <= 0) { T[o] = P[o]; T[o + 1] = P[o + 1]; T[o + 2] = P[o + 2]; continue; }
      let sx = 0, sy = 0, sz = 0;
      for (const j of list) { sx += P[j * 3]; sy += P[j * 3 + 1]; sz += P[j * 3 + 2]; }
      const k = (lam * w[c]) / list.length;
      T[o] = P[o] + k * sx - lam * w[c] * P[o];
      T[o + 1] = P[o + 1] + k * sy - lam * w[c] * P[o + 1];
      T[o + 2] = P[o + 2] + k * sz - lam * w[c] * P[o + 2];
    }
    P.set(T);
  };
  for (let it = 0; it < iterations; it++) { pass(0.5); pass(-0.53); }
  for (let i = 0; i < n; i++) pos.setXYZ(i, P[cid[i] * 3], P[cid[i] * 3 + 1], P[cid[i] * 3 + 2]);
  pos.needsUpdate = true;
  // averaged normals per welded position (soft shading, no speckle)
  const cn = new Float32Array(C * 3);
  const va = new THREE.Vector3(), vb = new THREE.Vector3(), vc = new THREE.Vector3(), fn = new THREE.Vector3();
  for (let t = 0; t < triCount; t++) {
    const ia = idx ? idx.getX(t * 3) : t * 3, ib = idx ? idx.getX(t * 3 + 1) : t * 3 + 1, ic = idx ? idx.getX(t * 3 + 2) : t * 3 + 2;
    va.fromBufferAttribute(pos, ia); vb.fromBufferAttribute(pos, ib); vc.fromBufferAttribute(pos, ic);
    fn.crossVectors(vb.sub(va), vc.sub(va));
    for (const k of [0, 1, 2]) { const c = cid[[ia, ib, ic][k]]; cn[c * 3] += fn.x; cn[c * 3 + 1] += fn.y; cn[c * 3 + 2] += fn.z; }
  }
  let nrm = g.attributes.normal as THREE.BufferAttribute | undefined;
  if (!nrm) { nrm = new THREE.BufferAttribute(new Float32Array(n * 3), 3); g.setAttribute('normal', nrm); }
  for (let i = 0; i < n; i++) {
    const o = cid[i] * 3;
    const l = Math.hypot(cn[o], cn[o + 1], cn[o + 2]) || 1;
    nrm.setXYZ(i, cn[o] / l, cn[o + 1] / l, cn[o + 2] / l);
  }
  nrm.needsUpdate = true;
  g.computeBoundingBox();
  g.computeBoundingSphere();
  return g;
}

function eyeTexture(iris: string) {
  const W = 512, H = 256;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d')!;
  const almond = () => { g.beginPath(); g.moveTo(14, 138); g.quadraticCurveTo(256, -20, 498, 138); g.quadraticCurveTo(256, 252, 14, 138); g.closePath(); };
  g.save(); almond(); g.clip();
  const sc = g.createLinearGradient(0, 0, 0, H);
  sc.addColorStop(0, '#d9d0c8'); sc.addColorStop(0.35, '#f7f2ec'); sc.addColorStop(1, '#efe6df');
  g.fillStyle = sc; g.fillRect(0, 0, W, H);
  const ir = g.createRadialGradient(256, 128, 8, 256, 128, 92);
  ir.addColorStop(0, '#7a4b28'); ir.addColorStop(0.55, iris); ir.addColorStop(1, '#1f1008');
  g.fillStyle = ir; g.beginPath(); g.arc(256, 130, 92, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#0a0604'; g.beginPath(); g.arc(256, 130, 36, 0, Math.PI * 2); g.fill();
  g.fillStyle = 'rgba(255,255,255,0.95)'; g.beginPath(); g.arc(292, 94, 15, 0, Math.PI * 2); g.fill();
  g.fillStyle = 'rgba(255,255,255,0.45)'; g.beginPath(); g.arc(226, 168, 8, 0, Math.PI * 2); g.fill();
  const lid = g.createLinearGradient(0, 0, 0, 120);
  lid.addColorStop(0, 'rgba(30,15,8,0.55)'); lid.addColorStop(1, 'rgba(30,15,8,0)');
  g.fillStyle = lid; g.fillRect(0, 0, W, 120);
  g.restore();
  g.strokeStyle = '#1a0d07'; g.lineWidth = 11; g.lineCap = 'round';
  g.beginPath(); g.moveTo(14, 138); g.quadraticCurveTo(256, -20, 498, 138); g.stroke();
  g.strokeStyle = 'rgba(60,30,20,0.35)'; g.lineWidth = 5;
  g.beginPath(); g.moveTo(40, 150); g.quadraticCurveTo(256, 246, 470, 150); g.stroke();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/* ---------- Portrait fallback ---------- */
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
      const rx = Math.min(1, W / H / imgAspect);
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
      g.rotation.y += (swing + state.pointer.x * 0.18 - g.rotation.y) * 0.08;
      g.rotation.x += (-state.pointer.y * 0.08 + Math.sin(t * 0.5) * 0.015 - g.rotation.x) * 0.08;
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

/* ---------- GLB character ---------- */
type MatRec = { mat: THREE.MeshStandardMaterial; color: THREE.Color; rough: number };
type BlinkRec = { mesh: THREE.Mesh; idx: number[] };
const BLINK_KEYS = ['eyeBlinkLeft', 'eyeBlinkRight', 'eyesClosed', 'blink', 'Blink', 'eyeBlink_L', 'eyeBlink_R', 'Eye_Blink_L', 'Eye_Blink_R'];

function Woman({ progress }: { progress: Progress }) {
  const yaw = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const { scene } = useGLTF(MODEL_URL);
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), -CUT_Y), []);
  const blinkState = useRef({ next: 2.5, start: -1 });
  const tmp = useMemo(() => ({ c: new THREE.Color(), c2: new THREE.Color(), q: new THREE.Quaternion(), e: new THREE.Euler(), marble: new THREE.Color(MARBLE_COLOR), skin: new THREE.Color(SKIN_COLOR) }), []);

  const rig = useMemo(() => {
    scene.updateMatrixWorld(true);
    let box = new THREE.Box3().setFromObject(scene);
    let size = box.getSize(new THREE.Vector3());
    const H0 = size.y, top0 = box.max.y, cx0 = (box.min.x + box.max.x) / 2, cz0 = (box.min.z + box.max.z) / 2;

    if (MARBLE) {
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (!m.isMesh || (m as THREE.SkinnedMesh).isSkinnedMesh || m.userData.smoothed) return;
        m.geometry = smoothGeometry(m.geometry);
        m.userData.smoothed = true;
      });
    } else if (HAIR_FIX_ON) {
      const smoothstep = (a: number, b: number, x: number) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
      const weight = (x: number, y: number, z: number) => {
        const d = (top0 - y) / H0; // depth below top of head, as fraction of H
        const crown = 1 - smoothstep(HAIR.frontTo, HAIR.frontFrom, d); // top of head, fades out toward the forehead
        const back = z < cz0 - 0.02 * H0 ? 1 - smoothstep(HAIR.backBelow - 0.08, HAIR.backBelow, d) : 0; // bun / back of head
        return clamp(Math.max(crown, back));
      };
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (!m.isMesh || (m as THREE.SkinnedMesh).isSkinnedMesh || m.userData.hairFixed) return;
        m.geometry = smoothRegion(m.geometry, weight, HAIR.iterations);
        m.userData.hairFixed = true;
      });
    }

    scene.updateMatrixWorld(true);
    box = new THREE.Box3().setFromObject(scene);
    size = box.getSize(new THREE.Vector3());
    const H = size.y;
    const top = box.max.y;
    const ratio = size.y / Math.max(size.x, size.z, 0.0001);
    const full = CROP_MODE === 'always' || (CROP_MODE === 'auto' && ratio > 1.8);
    const bottom = full ? box.min.y + size.y * 0.68 : box.min.y;
    const s = (TOP_Y - CUT_Y) / Math.max(box.max.y - bottom, 0.0001);
    const cx = cx0, cz = (box.min.z + box.max.z) / 2;

    const mats: MatRec[] = [];
    const blink: BlinkRec[] = [];
    const meshes: THREE.Mesh[] = [];
    const bones: { head?: THREE.Object3D; neck?: THREE.Object3D; spine?: THREE.Object3D } = {};
    scene.traverse((o) => {
      const n = o.name.replace(/^mixamorig:?/i, '');
      if (/^head$/i.test(n)) bones.head = o;
      else if (/^neck$/i.test(n)) bones.neck = o;
      else if (/^spine2?$/i.test(n) && !bones.spine) bones.spine = o;
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      if (!m.userData.isEye) meshes.push(m);
      m.frustumCulled = false;
      const dict = m.morphTargetDictionary;
      if (dict && m.morphTargetInfluences) {
        const idx = BLINK_KEYS.map((k) => dict[k]).filter((v): v is number => v !== undefined);
        if (idx.length) blink.push({ mesh: m, idx });
      }
      const arr = Array.isArray(m.material) ? m.material : [m.material];
      const next = arr.map((mt) => {
        const old = mt as THREE.MeshStandardMaterial;
        let out: THREE.MeshStandardMaterial;
        if (MARBLE) {
          out = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color(MARBLE_COLOR), roughness: 0.5, metalness: 0,
            sheen: 0.5, sheenColor: new THREE.Color('#ffc9b0'), sheenRoughness: 0.5,
            clearcoat: 0.2, clearcoatRoughness: 0.4, side: THREE.DoubleSide,
          });
        } else if (old.isMeshStandardMaterial) {
          out = old;
          out.side = THREE.DoubleSide;
          if (old.map) { old.map.anisotropy = 8; out.emissiveMap = old.map; }
          out.emissive = new THREE.Color(GLOW);
          out.emissiveIntensity = 0;
          out.needsUpdate = true;
        } else return mt;
        if (full) { out.clippingPlanes = [plane]; out.clipShadows = true; }
        mats.push({ mat: out, color: out.color.clone(), rough: out.roughness });
        return out;
      });
      m.material = Array.isArray(m.material) ? next : next[0];
    });

    // Real eyes: the scan only has dark painted sockets, so place eye decals on the face surface.
    const eyes: THREE.Mesh[] = [];
    if (EYES_ON && !MARBLE) {
      const ray = new THREE.Raycaster();
      const tex = eyeTexture(EYE.iris);
      const ey = top - EYE.y * H;
      const D = size.z * 2 + 1;
      for (const sx of [-1, 1]) {
        const ex = cx + sx * EYE.dx * H;
        for (const dir of [1, -1]) {
          ray.set(new THREE.Vector3(ex, ey, cz + dir * D), new THREE.Vector3(0, 0, -dir));
          const hit = ray.intersectObjects(meshes, false)[0];
          if (!hit) continue;
          const nrm = hit.face ? hit.face.normal.clone().transformDirection(hit.object.matrixWorld) : new THREE.Vector3(0, 0, dir);
          const n = nrm.multiplyScalar(0.4).add(new THREE.Vector3(0, 0, dir * 0.6)).normalize();
          const w = EYE.width * H;
          const mat = new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.2, metalness: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4, side: THREE.DoubleSide });
          const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, w * 0.5), mat);
          mesh.userData.isEye = true;
          mesh.position.copy(hit.point).addScaledVector(n, 0.002 * H);
          mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n);
          mesh.rotateZ(sx * 0.05);
          mesh.frustumCulled = false;
          scene.add(mesh);
          eyes.push(mesh);
          break;
        }
      }
    }

    const base = { head: bones.head?.quaternion.clone(), neck: bones.neck?.quaternion.clone(), spine: bones.spine?.quaternion.clone() };
    return { s, ox: -cx * s, oy: CUT_Y - bottom * s, oz: -cz * s, mats, blink, bones, base, eyes };
  }, [scene, plane]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const p = progress.current;
    const { i, a, b, t: k } = mixAt(p);
    if (yaw.current) yaw.current.rotation.y = (i + k) * Math.PI * 2;
    if (body.current) {
      body.current.scale.setScalar(rig.s * (1 + Math.sin(t * 1.6) * 0.0035));
      if (!rig.bones.head) { body.current.rotation.z = Math.sin(t * 0.5) * 0.012; body.current.rotation.x = Math.sin(t * 0.4) * 0.01; }
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
    for (const e of rig.eyes) e.scale.y = 1 - w * 0.92;

    tmp.c.set(a.tint).lerp(tmp.c2.set(b.tint), k);
    const glow = a.glow + (b.glow - a.glow) * k;
    const rough = a.roughness + (b.roughness - a.roughness) * k;
    const warm = ease(clamp(p * 1.15));
    for (const r of rig.mats) {
      if (MARBLE) {
        r.mat.color.copy(tmp.marble).lerp(tmp.skin, warm * 0.9).lerp(tmp.c, 0.06);
        r.mat.roughness = 0.55 - warm * 0.22 + (rough - 0.5) * 0.1;
        r.mat.emissive.set('#8a3d24');
        r.mat.emissiveIntensity = glow * 0.35 * warm;
        (r.mat as THREE.MeshPhysicalMaterial).clearcoat = 0.2 + glow * 1.2;
      } else {
        r.mat.color.copy(r.color).lerp(tmp.c, 0.05);
        r.mat.roughness = Math.min(r.rough, 0.9) * (1 - glow * 0.6);
        r.mat.emissiveIntensity = glow * 0.22;
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
    const m = new THREE.MeshBasicMaterial({ map: makeTexture(st.product, st.aura), toneMapped: false });
    new THREE.TextureLoader().load(st.image, (tex) => { tex.colorSpace = THREE.SRGBColorSpace; m.map = tex; m.needsUpdate = true; }, undefined, () => {});
    return m;
  }, [st]);
  useFrame((state) => {
    if (!ref.current) return;
    const f = progress.current * (N - 1);
    const act = Math.max(0, 1 - Math.abs(f - index));
    ref.current.scale.setScalar(0.8 + 0.25 * act);
    ref.current.lookAt(state.camera.position.x * 0.5, ref.current.getWorldPosition(new THREE.Vector3()).y, state.camera.position.z);
  });
  return (
    <mesh ref={ref} material={mat} position={[Math.sin(ang) * R, 1.15, Math.cos(ang) * R]}>
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
      <ambientLight intensity={0.6} color='#fff1e6' />
      <directionalLight position={[2.5, 4, 4]} intensity={1.4} color='#fff4ea' />
      <directionalLight position={[-3, 2, -2]} intensity={0.7} color='#ffd9c2' />
      <Rig progress={progress} />
      <Suspense fallback={null}>
        <Environment resolution={256}>
          <Lightformer form='rect' intensity={2.2} color='#fff3e8' position={[0, 4, 3]} scale={[8, 4, 1]} />
          <Lightformer form='rect' intensity={1} color='#ffe0cc' position={[-4, 1, -2]} scale={[3, 6, 1]} />
        </Environment>
        {USE_PORTRAIT ? (
          <Portrait progress={progress} />
        ) : (
          <Boundary fallback={<Portrait progress={progress} />}><Woman progress={progress} /></Boundary>
        )}
        <Ring progress={progress} />
        <Sparkles count={50} scale={[5, 3, 5]} position={[0, 1.3, 0]} size={3} speed={0.4} color={auraColor} />
      </Suspense>
    </Canvas>
  );
}
