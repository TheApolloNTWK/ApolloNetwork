/**
 * Procedural "network core" — the hero centrepiece.
 *
 * A lattice of nodes on a sphere, linked to their nearest neighbours, around
 * a luminous core, with tilted orbits carrying satellites. Signals travel
 * along links. Rendered with Canvas 2D (no WebGL, no library) so it runs on
 * modest hardware; quality adapts if frames run slow.
 *
 * Behaviour:
 *  - pauses when off-screen or when the tab is hidden
 *  - draws a single still frame under prefers-reduced-motion
 *  - leaves the CSS fallback in place if Canvas 2D is unavailable
 */

interface Vec3 {
  x: number;
  y: number;
  z: number;
}

interface Orbit {
  tiltX: number;
  tiltZ: number;
  radius: number;
  speed: number;
  phase: number;
  satellites: number;
}

interface Signal {
  link: number;
  t: number;
  speed: number;
}

const TAU = Math.PI * 2;

// Palette mirrors src/styles/tokens.css.
const BLUE = '27, 77, 255';
const BLUE_BRIGHT = '120, 160, 255';
const CYAN = '0, 224, 255';
const WHITE = '234, 240, 250';

/** Small seeded PRNG so the network has the same shape on every visit. */
function seeded(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Points on a unit sphere: a Fibonacci distribution with jitter, so the
 * surface reads as an organic network rather than a regular wireframe.
 */
function jitteredSphere(count: number, rand: () => number): Vec3[] {
  const points: Vec3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2 + (rand() - 0.5) * 0.05;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i + (rand() - 0.5) * 0.5;
    const len = 1 + (rand() - 0.5) * 0.04;
    points.push({ x: Math.cos(theta) * r * len, y: y * len, z: Math.sin(theta) * r * len });
  }
  return points;
}

/** Faint particles inside the sphere, for depth. Not linked. */
function interiorDust(count: number, rand: () => number): Vec3[] {
  const points: Vec3[] = [];
  for (let i = 0; i < count; i++) {
    const u = rand() * 2 - 1;
    const theta = rand() * TAU;
    const r = 0.25 + rand() * 0.6;
    const s = Math.sqrt(1 - u * u);
    points.push({ x: Math.cos(theta) * s * r, y: u * r, z: Math.sin(theta) * s * r });
  }
  return points;
}

/**
 * Each node links to its k nearest neighbours (pairs de-duplicated), then a
 * share of links is dropped so the mesh reads as a network, not a grid.
 */
function buildLinks(points: Vec3[], k: number, keep: number, rand: () => number): Uint16Array {
  const seen = new Set<number>();
  const pairs: number[] = [];
  for (let i = 0; i < points.length; i++) {
    const a = points[i]!;
    // Insertion into a tiny fixed-size list: O(n·k) rather than sorting.
    const nearest: { j: number; d: number }[] = [];
    for (let j = 0; j < points.length; j++) {
      if (i === j) continue;
      const b = points[j]!;
      const d = (a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2;
      if (nearest.length === k && d >= nearest[k - 1]!.d) continue;
      let pos = nearest.length < k ? nearest.length : k - 1;
      while (pos > 0 && nearest[pos - 1]!.d > d) pos--;
      nearest.splice(pos, 0, { j, d });
      if (nearest.length > k) nearest.pop();
    }
    for (const { j } of nearest) {
      const key = i < j ? i * 65536 + j : j * 65536 + i;
      if (seen.has(key)) continue;
      seen.add(key);
      if (rand() > keep) continue;
      pairs.push(i, j);
    }
  }
  return Uint16Array.from(pairs);
}

export function initNetworkCore(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  const host = canvas.parentElement ?? canvas;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(pointer: fine)');

  let width = 0;
  let height = 0;
  let dpr = 1;
  let quality = 1; // 1 = full, 0.6 = reduced after sustained slow frames

  let points: Vec3[] = [];
  let dust: Vec3[] = [];
  let links: Uint16Array = new Uint16Array();
  const projected = { x: new Float32Array(0), y: new Float32Array(0), z: new Float32Array(0) };

  const orbits: Orbit[] = [
    { tiltX: 1.18, tiltZ: -0.42, radius: 1.3, speed: 0.11, phase: 0, satellites: 3 },
    { tiltX: 1.32, tiltZ: 0.62, radius: 1.46, speed: -0.07, phase: 1.7, satellites: 2 },
    { tiltX: 0.5, tiltZ: 0.2, radius: 1.62, speed: 0.045, phase: 3.1, satellites: 1 },
  ];

  const signals: Signal[] = [];
  let rotation = 0.6;
  let time = 0;
  // Arrival: 0 → 1 over the first seconds. The core lights first, then the
  // network gathers around it. Skipped entirely under reduced motion.
  let intro = reducedMotion.matches ? 1 : 0;
  let pointerX = 0;
  let pointerY = 0;
  let tiltX = 0;
  let tiltY = 0;

  let running = false;
  let visible = true;
  let rafId = 0;
  let lastFrame = 0;
  let slowFrames = 0;

  let geometryCount = 0;
  let frameInterval = 0; // ms between drawn frames; 0 = every display frame
  let lastDraw = 0;

  /** Size the backing store; rebuild the network only when its size changes. */
  function configure(): void {
    const rect = host.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    const small = width < 640;
    dpr = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    // Small screens and reduced quality run at ~30fps: the motion is slow
    // enough that nobody can tell, and it halves the work.
    frameInterval = small || quality < 1 ? 32 : 0;

    const count = Math.round((small ? 150 : 240) * quality);
    if (count === geometryCount) return;
    geometryCount = count;
    const rand = seeded(0x41504f4c);
    points = jitteredSphere(count, rand);
    dust = interiorDust(Math.round(count * 0.35), rand);
    links = buildLinks(points, 3, 0.72, rand);
    projected.x = new Float32Array(count);
    projected.y = new Float32Array(count);
    projected.z = new Float32Array(count);
    signals.length = 0;
  }

  function spawnSignal(): void {
    const linkCount = links.length / 2;
    if (!linkCount) return;
    signals.push({
      link: Math.floor(Math.random() * linkCount),
      t: 0,
      speed: 0.5 + Math.random() * 0.7,
    });
  }

  function draw(dt: number): void {
    const c = ctx!;
    c.clearRect(0, 0, width, height);

    const cx = width * 0.5;
    const cy = height * 0.5;
    const arrive = 1 - (1 - intro) ** 3;
    const radius = Math.min(width, height) * 0.28 * (0.82 + 0.18 * arrive);
    const focal = 3.2;

    // Ease pointer parallax toward its target.
    tiltX += (pointerY * 0.18 - tiltX) * Math.min(1, dt * 3);
    tiltY += (pointerX * 0.28 - tiltY) * Math.min(1, dt * 3);

    const rotY = rotation + tiltY;
    const rotX = -0.32 + tiltX;
    const sinY = Math.sin(rotY);
    const cosY = Math.cos(rotY);
    const sinX = Math.sin(rotX);
    const cosX = Math.cos(rotX);

    // ── Core glow ──────────────────────────────────────────────
    const pulse = 0.85 + Math.sin(time * 1.3) * 0.08;
    const glow = c.createRadialGradient(cx, cy, 0, cx, cy, radius * 1.25);
    glow.addColorStop(0, `rgba(${CYAN}, ${0.3 * pulse})`);
    glow.addColorStop(0.18, `rgba(${BLUE}, ${0.22 * pulse})`);
    glow.addColorStop(0.55, `rgba(${BLUE}, 0.05)`);
    glow.addColorStop(1, `rgba(${BLUE}, 0)`);
    c.fillStyle = glow;
    c.fillRect(cx - radius * 1.3, cy - radius * 1.3, radius * 2.6, radius * 2.6);

    // Everything except the core fades in with the arrival.
    c.globalAlpha = arrive;

    // ── Project the lattice ────────────────────────────────────
    for (let i = 0; i < points.length; i++) {
      const p = points[i]!;
      const x1 = p.x * cosY - p.z * sinY;
      const z1 = p.x * sinY + p.z * cosY;
      const y2 = p.y * cosX - z1 * sinX;
      const z2 = p.y * sinX + z1 * cosX;
      const scale = focal / (focal + z2);
      projected.x[i] = cx + x1 * radius * scale;
      projected.y[i] = cy + y2 * radius * scale;
      projected.z[i] = z2;
    }

    // ── Interior dust ──────────────────────────────────────────
    c.fillStyle = `rgba(${BLUE_BRIGHT}, 0.35)`;
    for (const p of dust) {
      const x1 = p.x * cosY - p.z * sinY;
      const z1 = p.x * sinY + p.z * cosY;
      const y2 = p.y * cosX - z1 * sinX;
      const scale = focal / (focal + (p.y * sinX + z1 * cosX));
      c.fillRect(cx + x1 * radius * scale, cy + y2 * radius * scale, 1, 1);
    }

    // ── Links, batched into depth buckets to limit state changes ──
    const buckets = 4;
    for (let b = 0; b < buckets; b++) {
      c.beginPath();
      for (let l = 0; l < links.length; l += 2) {
        const i = links[l]!;
        const j = links[l + 1]!;
        const depth = (projected.z[i]! + projected.z[j]!) * 0.5; // -1 front … 1 back
        const bucket = Math.min(buckets - 1, Math.floor(((1 - depth) / 2) * buckets));
        if (bucket !== b) continue;
        c.moveTo(projected.x[i]!, projected.y[i]!);
        c.lineTo(projected.x[j]!, projected.y[j]!);
      }
      const alpha = 0.04 + (b / (buckets - 1)) ** 1.6 * 0.3;
      c.strokeStyle = `rgba(${BLUE_BRIGHT}, ${alpha})`;
      c.lineWidth = 0.6 + b * 0.15;
      c.stroke();
    }

    // ── Nodes ──────────────────────────────────────────────────
    for (let i = 0; i < points.length; i++) {
      const front = (1 - projected.z[i]!) / 2; // 0 back … 1 front
      const size = 0.6 + front * 1.5;
      c.fillStyle =
        front > 0.82 && i % 7 === 0
          ? `rgba(${CYAN}, ${0.55 + front * 0.4})`
          : `rgba(${WHITE}, ${0.12 + front * 0.6})`;
      c.fillRect(projected.x[i]! - size / 2, projected.y[i]! - size / 2, size, size);
    }

    // ── Signals travelling along links ─────────────────────────
    if (quality >= 1 && signals.length < 9 && Math.random() < dt * 2.2) spawnSignal();
    for (let s = signals.length - 1; s >= 0; s--) {
      const sig = signals[s]!;
      sig.t += dt * sig.speed;
      if (sig.t >= 1) {
        signals.splice(s, 1);
        continue;
      }
      const i = links[sig.link * 2]!;
      const j = links[sig.link * 2 + 1]!;
      const front = (1 - (projected.z[i]! + projected.z[j]!) / 2) / 2;
      if (front < 0.45) continue;
      const x = projected.x[i]! + (projected.x[j]! - projected.x[i]!) * sig.t;
      const y = projected.y[i]! + (projected.y[j]! - projected.y[i]!) * sig.t;
      const fade = Math.sin(sig.t * Math.PI);
      const r = 5 + front * 5;
      const g = c.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(${CYAN}, ${0.9 * fade * front})`);
      g.addColorStop(1, `rgba(${CYAN}, 0)`);
      c.fillStyle = g;
      c.fillRect(x - r, y - r, r * 2, r * 2);
    }

    // ── Orbits and satellites ──────────────────────────────────
    for (const orbit of orbits) {
      const sinA = Math.sin(orbit.tiltX);
      const cosA = Math.cos(orbit.tiltX);
      const sinB = Math.sin(orbit.tiltZ + tiltY * 0.4);
      const cosB = Math.cos(orbit.tiltZ + tiltY * 0.4);
      const project = (angle: number) => {
        // Circle in XZ plane → tilt about X → tilt about Z.
        const x0 = Math.cos(angle) * orbit.radius;
        const z0 = Math.sin(angle) * orbit.radius;
        const y1 = -z0 * sinA;
        const z1 = z0 * cosA;
        const x2 = x0 * cosB - y1 * sinB;
        const y2 = x0 * sinB + y1 * cosB;
        const scale = focal / (focal + z1 * 0.6);
        return { x: cx + x2 * radius * scale, y: cy + y2 * radius * scale, z: z1 };
      };

      const segments = 96;
      for (let pass = 0; pass < 2; pass++) {
        // pass 0: far half (dim), pass 1: near half (bright)
        c.beginPath();
        let drawing = false;
        for (let s = 0; s <= segments; s++) {
          const q = project((s / segments) * TAU);
          const near = q.z < 0;
          if (near === (pass === 1)) {
            if (drawing) c.lineTo(q.x, q.y);
            else c.moveTo(q.x, q.y);
            drawing = true;
          } else {
            drawing = false;
          }
        }
        c.strokeStyle = pass ? `rgba(${BLUE_BRIGHT}, 0.34)` : `rgba(${BLUE_BRIGHT}, 0.1)`;
        c.lineWidth = pass ? 1 : 0.8;
        c.stroke();
      }

      for (let n = 0; n < orbit.satellites; n++) {
        const angle = orbit.phase + time * orbit.speed * TAU + (n / orbit.satellites) * TAU;
        const q = project(angle);
        const near = q.z < 0;
        const r = near ? 2.4 : 1.6;
        c.fillStyle = near ? `rgba(${CYAN}, 0.95)` : `rgba(${BLUE_BRIGHT}, 0.45)`;
        c.beginPath();
        c.arc(q.x, q.y, r, 0, TAU);
        c.fill();
        if (near) {
          const halo = c.createRadialGradient(q.x, q.y, 0, q.x, q.y, 14);
          halo.addColorStop(0, `rgba(${CYAN}, 0.35)`);
          halo.addColorStop(1, `rgba(${CYAN}, 0)`);
          c.fillStyle = halo;
          c.fillRect(q.x - 14, q.y - 14, 28, 28);
        }
      }
    }

    // ── Core ───────────────────────────────────────────────────
    c.globalAlpha = 1;
    const coreR = Math.max(3, radius * 0.035);
    const core = c.createRadialGradient(cx, cy, 0, cx, cy, coreR * 5);
    core.addColorStop(0, `rgba(255, 255, 255, 0.95)`);
    core.addColorStop(0.2, `rgba(${CYAN}, 0.75)`);
    core.addColorStop(1, `rgba(${BLUE}, 0)`);
    c.fillStyle = core;
    c.beginPath();
    c.arc(cx, cy, coreR * 5, 0, TAU);
    c.fill();
  }

  function frame(now: number): void {
    if (!running) return;
    rafId = requestAnimationFrame(frame);
    if (frameInterval && now - lastDraw < frameInterval) return;
    lastDraw = now;
    const elapsed = lastFrame ? (now - lastFrame) / 1000 : 0.016;
    // Motion steps are capped so a stalled tab does not lurch forward…
    const dt = Math.min(0.05, elapsed);
    lastFrame = now;

    // Adaptive quality: after ~60 frames slower than ~25fps, simplify once.
    if (dt > 0.04 && quality === 1) {
      slowFrames += 1;
      if (slowFrames > 60) {
        quality = 0.6;
        configure();
      }
    } else {
      slowFrames = Math.max(0, slowFrames - 1);
    }

    time += dt;
    // …but the arrival follows real time, so slow devices are not left
    // watching a half-assembled network.
    if (intro < 1) intro = Math.min(1, intro + Math.min(elapsed, 0.25) / 2.4);
    // Spins into place during arrival, then settles to a slow drift.
    rotation += dt * (0.07 + (1 - intro) ** 2 * 0.9);
    draw(dt);
  }

  function start(): void {
    if (running || reducedMotion.matches || !visible || document.hidden) return;
    running = true;
    lastFrame = 0;
    rafId = requestAnimationFrame(frame);
  }

  function stop(): void {
    running = false;
    cancelAnimationFrame(rafId);
  }

  function renderStill(): void {
    draw(0.016);
  }

  configure();
  renderStill();
  canvas.dataset.ready = '';

  // The first callback fires immediately on observe; skip it, the canvas was
  // just configured.
  let observedOnce = false;
  new ResizeObserver(() => {
    if (!observedOnce) {
      observedOnce = true;
      return;
    }
    configure();
    if (!running) renderStill();
  }).observe(host);

  new IntersectionObserver(([entry]) => {
    visible = Boolean(entry?.isIntersecting);
    if (visible) start();
    else stop();
  }).observe(host);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else start();
  });

  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) {
      stop();
      intro = 1;
      renderStill();
    } else {
      start();
    }
  });

  // Gentle pointer parallax on devices with a precise pointer only.
  window.addEventListener(
    'pointermove',
    (event) => {
      if (!finePointer.matches || reducedMotion.matches) return;
      pointerX = (event.clientX / window.innerWidth) * 2 - 1;
      pointerY = (event.clientY / window.innerHeight) * 2 - 1;
    },
    { passive: true },
  );

  start();
}
