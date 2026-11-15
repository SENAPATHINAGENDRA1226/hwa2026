// Browser-only: loaded lazily behind <ClientOnly> from the hero.
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const CYAN = new THREE.Color("#3ee8ff");
const VIOLET = new THREE.Color("#9a5cff");
const MAGENTA = new THREE.Color("#ff4fd8");

// Feel constants
const RADIUS = 2.25;
const NEIGHBOURS = 3;
const BREATH = 0.05;
const SPIN = 0.11;
const TILT = 0.35;
const PULSE_SPEED = 0.55;

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildGraph(count: number) {
  const rand = mulberry32(2026);
  const base = new Float32Array(count * 3);
  const phase = new Float32Array(count);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const th = golden * i;
    const rad = RADIUS * (0.9 + rand() * 0.2);
    base[i * 3] = Math.cos(th) * r * rad;
    base[i * 3 + 1] = y * rad;
    base[i * 3 + 2] = Math.sin(th) * r * rad;
    phase[i] = rand() * Math.PI * 2;
  }
  const keys = new Set<string>();
  const edges: [number, number][] = [];
  const adj: number[][] = Array.from({ length: count }, () => []);
  for (let i = 0; i < count; i++) {
    const d: [number, number][] = [];
    for (let j = 0; j < count; j++) {
      if (i === j) continue;
      const dx = base[i * 3]! - base[j * 3]!;
      const dy = base[i * 3 + 1]! - base[j * 3 + 1]!;
      const dz = base[i * 3 + 2]! - base[j * 3 + 2]!;
      d.push([dx * dx + dy * dy + dz * dz, j]);
    }
    d.sort((a, b) => a[0] - b[0]);
    for (let n = 0; n < NEIGHBOURS; n++) {
      const j = d[n]![1];
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (keys.has(key)) continue;
      keys.add(key);
      edges.push([i, j]);
      adj[i]!.push(edges.length - 1);
      adj[j]!.push(edges.length - 1);
    }
  }
  return { base, phase, edges, adj, rand };
}

const glowVertex = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  attribute vec3 aColor;
  uniform float uTime;
  uniform float uPixelRatio;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    float tw = 0.6 + 0.4 * sin(uTime * 2.2 + aPhase);
    gl_PointSize = aSize * uPixelRatio * (7.0 / -mv.z) * (0.75 + 0.25 * tw);
    vColor = aColor;
    vAlpha = tw;
  }
`;
const glowFragment = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float halo = pow(smoothstep(0.5, 0.0, d), 1.8);
    float core = smoothstep(0.14, 0.0, d);
    gl_FragColor = vec4(vColor * halo + vec3(core), halo * vAlpha);
  }
`;

function makeGlowMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uPixelRatio: { value: 1 } },
    vertexShader: glowVertex,
    fragmentShader: glowFragment,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

type Pulse = { edge: number; t: number; dir: 1 | -1; speed: number };

function Network({ count, pulses, onReady }: { count: number; pulses: number; onReady: () => void }) {
  const graph = useMemo(() => buildGraph(count), [count]);
  const group = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const shell = useRef<THREE.LineSegments>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const ready = useRef(false);
  const dpr = useThree((s) => s.viewport.dpr);

  const { nodeGeo, lineGeo, pulseGeo, nodeMat, pulseMat, lineMat, pos, pulseState } = useMemo(() => {
    const { base, phase, edges, rand } = graph;
    const pos = new Float32Array(base);
    const nodeGeo = new THREE.BufferGeometry();
    nodeGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const t = (base[i * 3 + 1]! / RADIUS + 1) / 2;
      c.copy(VIOLET).lerp(CYAN, t);
      if (rand() > 0.9) c.copy(MAGENTA);
      colors.set([c.r, c.g, c.b], i * 3);
      sizes[i] = 7 + rand() * 9;
    }
    nodeGeo.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
    nodeGeo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    nodeGeo.setAttribute("aPhase", new THREE.BufferAttribute(phase, 1));

    const linePos = new Float32Array(edges.length * 6);
    const lineCol = new Float32Array(edges.length * 6);
    edges.forEach(([a, b], e) => {
      lineCol.set(colors.subarray(a * 3, a * 3 + 3), e * 6);
      lineCol.set(colors.subarray(b * 3, b * 3 + 3), e * 6 + 3);
    });
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute("position", new THREE.BufferAttribute(linePos, 3));
    lineGeo.setAttribute("color", new THREE.BufferAttribute(lineCol, 3));
    const lineMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.38,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const pulseState: Pulse[] = Array.from({ length: pulses }, () => ({
      edge: Math.floor(rand() * edges.length),
      t: rand(),
      dir: rand() > 0.5 ? 1 : -1,
      speed: PULSE_SPEED * (0.6 + rand() * 0.9),
    }));
    const pulsePos = new Float32Array(pulses * 3);
    const pulseCol = new Float32Array(pulses * 3);
    const pulseSize = new Float32Array(pulses);
    const pulsePhase = new Float32Array(pulses);
    for (let p = 0; p < pulses; p++) {
      c.copy(CYAN).lerp(new THREE.Color("#ffffff"), 0.35 + rand() * 0.3);
      pulseCol.set([c.r, c.g, c.b], p * 3);
      pulseSize[p] = 10 + rand() * 6;
      pulsePhase[p] = rand() * 6.28;
    }
    const pulseGeo = new THREE.BufferGeometry();
    pulseGeo.setAttribute("position", new THREE.BufferAttribute(pulsePos, 3));
    pulseGeo.setAttribute("aColor", new THREE.BufferAttribute(pulseCol, 3));
    pulseGeo.setAttribute("aSize", new THREE.BufferAttribute(pulseSize, 1));
    pulseGeo.setAttribute("aPhase", new THREE.BufferAttribute(pulsePhase, 1));

    return {
      nodeGeo, lineGeo, pulseGeo, lineMat, pos, pulseState,
      nodeMat: makeGlowMaterial(),
      pulseMat: makeGlowMaterial(),
    };
  }, [graph, count, pulses]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      [nodeGeo, lineGeo, pulseGeo].forEach((g) => g.dispose());
      [nodeMat, pulseMat, lineMat].forEach((m) => m.dispose());
    };
  }, [nodeGeo, lineGeo, pulseGeo, nodeMat, pulseMat, lineMat]);

  useFrame((state, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    const t = state.clock.elapsedTime;
    const { base, phase, edges, adj, rand } = graph;

    // Breathing nodes
    for (let i = 0; i < count; i++) {
      const s = 1 + BREATH * Math.sin(t * 0.9 + phase[i]!);
      pos[i * 3] = base[i * 3]! * s;
      pos[i * 3 + 1] = base[i * 3 + 1]! * s;
      pos[i * 3 + 2] = base[i * 3 + 2]! * s;
    }
    nodeGeo.attributes["position"]!.needsUpdate = true;

    // Connections follow the nodes
    const lineAttr = lineGeo.attributes["position"]!;
    const lp = lineAttr.array as Float32Array;
    for (let e = 0; e < edges.length; e++) {
      const [a, b] = edges[e]!;
      for (let k = 0; k < 3; k++) {
        lp[e * 6 + k] = pos[a * 3 + k]!;
        lp[e * 6 + 3 + k] = pos[b * 3 + k]!;
      }
    }
    lineAttr.needsUpdate = true;
    lineMat.opacity = 0.32 + 0.08 * Math.sin(t * 1.3);

    // Signals travelling along synapses
    const pulseAttr = pulseGeo.attributes["position"]!;
    const pp = pulseAttr.array as Float32Array;
    for (let p = 0; p < pulseState.length; p++) {
      const ps = pulseState[p]!;
      ps.t += ps.speed * dt;
      if (ps.t >= 1) {
        const [a, b] = edges[ps.edge]!;
        const end = ps.dir === 1 ? b : a;
        const options = adj[end]!;
        ps.edge = options[Math.floor(rand() * options.length)]!;
        ps.dir = edges[ps.edge]![0] === end ? 1 : -1;
        ps.t = 0;
      }
      const [a, b] = edges[ps.edge]!;
      const from = ps.dir === 1 ? a : b;
      const to = ps.dir === 1 ? b : a;
      for (let k = 0; k < 3; k++) {
        const f = pos[from * 3 + k]!;
        pp[p * 3 + k] = f + (pos[to * 3 + k]! - f) * ps.t;
      }
    }
    pulseAttr.needsUpdate = true;

    nodeMat.uniforms["uTime"]!.value = t;
    pulseMat.uniforms["uTime"]!.value = t * 1.6;
    nodeMat.uniforms["uPixelRatio"]!.value = dpr;
    pulseMat.uniforms["uPixelRatio"]!.value = dpr;

    if (group.current) {
      group.current.rotation.y += SPIN * dt;
      const tx = pointer.current.y * TILT;
      const tz = -pointer.current.x * TILT * 0.6;
      group.current.rotation.x += (tx - group.current.rotation.x) * (1 - Math.exp(-3 * dt));
      group.current.rotation.z += (tz - group.current.rotation.z) * (1 - Math.exp(-3 * dt));
    }
    if (core.current) {
      core.current.rotation.x += dt * 0.3;
      core.current.rotation.y -= dt * 0.45;
      const s = 1 + 0.06 * Math.sin(t * 2);
      core.current.scale.setScalar(s);
    }
    if (shell.current) shell.current.rotation.y -= dt * 0.05;

    if (!ready.current) {
      ready.current = true;
      onReady();
    }
  });

  return (
    <group ref={group}>
      <lineSegments geometry={lineGeo} material={lineMat} />
      <points geometry={nodeGeo} material={nodeMat} />
      <points geometry={pulseGeo} material={pulseMat} />
      <mesh ref={core}>
        <icosahedronGeometry args={[0.7, 1]} />
        <meshBasicMaterial color={VIOLET} wireframe transparent opacity={0.55} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.38, 24, 24]} />
        <meshBasicMaterial color={CYAN} transparent opacity={0.35} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <lineSegments ref={shell}>
        <edgesGeometry args={[new THREE.IcosahedronGeometry(RADIUS * 1.35, 2)]} />
        <lineBasicMaterial color={CYAN} transparent opacity={0.06} blending={THREE.AdditiveBlending} depthWrite={false} />
      </lineSegments>
      <mesh rotation={[Math.PI / 2.3, 0, 0]}>
        <torusGeometry args={[RADIUS * 1.25, 0.006, 8, 160]} />
        <meshBasicMaterial color={CYAN} transparent opacity={0.45} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh rotation={[Math.PI / 1.8, 0.5, 0]}>
        <torusGeometry args={[RADIUS * 1.42, 0.005, 8, 160]} />
        <meshBasicMaterial color={VIOLET} transparent opacity={0.4} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}

export default function NeuralSphere() {
  const wrapper = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [mobile] = useState(() => window.matchMedia("(max-width: 767px)").matches);

  useEffect(() => {
    const el = wrapper.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry?.isIntersecting ?? true), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrapper} className="absolute inset-0" aria-hidden>
      <Canvas
        frameloop={visible ? "always" : "never"}
        dpr={[1, mobile ? 1.5 : 1.75]}
        camera={{ position: [0, 0, 9.2], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <Network
          count={mobile ? 120 : 190}
          pulses={mobile ? 36 : 70}
          onReady={() => wrapper.current?.setAttribute("data-scene-ready", "true")}
        />
      </Canvas>
    </div>
  );
}
