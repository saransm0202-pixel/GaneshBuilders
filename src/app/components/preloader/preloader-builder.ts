import * as THREE from 'three';

export interface Preloader3DOptions {
  floorCount: number;
  getPct: () => number;
}

interface FloorRig {
  mesh: THREE.Mesh;
  front: THREE.MeshStandardMaterial;
  base: number;
  on: boolean;
}

const GOLD = 0xe3c787;
const GOLD_DEEP = 0xc4a265;
const NIGHT = 0x0d1712;

function makeRadialTexture(inner: string, outer = 'rgba(0,0,0,0)') {
  const cv = document.createElement('canvas');
  cv.width = 256;
  cv.height = 256;
  const ctx = cv.getContext('2d')!;
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, inner);
  g.addColorStop(1, outer);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeSkyTexture() {
  const cv = document.createElement('canvas');
  cv.width = 8;
  cv.height = 256;
  const ctx = cv.getContext('2d')!;
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, '#081008');
  g.addColorStop(0.45, '#0c1710');
  g.addColorStop(0.75, '#122119');
  g.addColorStop(1, '#17311f');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 8, 256);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeFacadeTextures(isGround: boolean) {
  const map = document.createElement('canvas');
  map.width = 128;
  map.height = 256;
  const emit = document.createElement('canvas');
  emit.width = 128;
  emit.height = 256;
  const m = map.getContext('2d')!;
  const e = emit.getContext('2d')!;

  const rand = (min: number, max: number) => min + Math.random() * (max - min);

  m.fillStyle = '#26332b';
  m.fillRect(0, 0, 128, 256);

  for (let i = 0; i < 40; i++) {
    m.fillStyle = `rgba(255,255,255,${rand(0.015, 0.045)})`;
    m.fillRect(rand(0, 128), rand(0, 256), 3, 18);
  }
  for (let i = 0; i < 12; i++) {
    m.fillStyle = `rgba(0,0,0,${rand(0.1, 0.22)})`;
    m.fillRect(rand(0, 128), rand(0, 256), 16, 4);
  }

  m.strokeStyle = 'rgba(246,242,234,0.16)';
  m.lineWidth = 1.5;
  m.beginPath();
  m.moveTo(0, 8);
  m.lineTo(128, 8);
  m.stroke();

  const ribbon = (y1: number, y2: number) => {
    m.fillStyle = '#0c1411';
    m.fillRect(0, y1, 128, y2 - y1);
    m.fillStyle = 'rgba(246,242,234,0.09)';
    for (let x = 4; x < 128; x += 18) {
      m.fillRect(x, 0, 1.5, 256);
    }
    for (let x = 28; x < 128; x += 34) {
      m.fillStyle = 'rgba(196,162,101,0.28)';
      m.fillRect(x, y1, 1.5, y2 - y1);
    }
    e.fillStyle = '#ffffff';
    e.fillRect(0, y1, 128, y2 - y1);
  };

  if (isGround) {
    m.fillStyle = 'rgba(0,0,0,0.28)';
    m.fillRect(0, 0, 128, 256);

    ribbon(46, 108);
    ribbon(160, 222);

    m.fillStyle = '#0b100d';
    m.fillRect(49, 108, 30, 148);
    m.fillStyle = 'rgba(196,162,101,0.85)';
    m.fillRect(49, 108, 30, 3);
    m.strokeStyle = 'rgba(196,162,101,0.7)';
    m.lineWidth = 2;
    m.beginPath();
    m.rect(49, 108, 30, 148);
    m.stroke();
    m.fillStyle = 'rgba(246,242,234,0.7)';
    m.fillRect(60, 150, 4, 46);
    m.strokeStyle = 'rgba(246,242,234,0.5)';
    m.beginPath();
    m.moveTo(64, 132);
    m.quadraticCurveTo(64, 158, 60, 178);
    m.stroke();
  } else {
    ribbon(52, 100);
    ribbon(120, 168);
    ribbon(188, 236);
  }

  const mapTex = new THREE.CanvasTexture(map);
  mapTex.colorSpace = THREE.SRGBColorSpace;
  const emitTex = new THREE.CanvasTexture(emit);
  emitTex.colorSpace = THREE.SRGBColorSpace;

  return { map: mapTex, emit: emitTex };
}

function makeSideTexture() {
  const cv = document.createElement('canvas');
  cv.width = 64;
  cv.height = 256;
  const ctx = cv.getContext('2d')!;
  ctx.fillStyle = '#18231d';
  ctx.fillRect(0, 0, 64, 256);
  ctx.fillStyle = 'rgba(196,162,101,0.3)';
  for (let y = 0; y < 256; y += 26) {
    ctx.fillRect(0, y, 64, 1.5);
  }
  ctx.fillStyle = 'rgba(246,242,234,0.08)';
  for (let x = 0; x < 64; x += 22) {
    ctx.fillRect(x, 0, 2, 256);
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeRoofTexture() {
  const cv = document.createElement('canvas');
  cv.width = 64;
  cv.height = 256;
  const ctx = cv.getContext('2d')!;
  ctx.fillStyle = '#1c2721';
  ctx.fillRect(0, 0, 64, 256);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export class Preloader3D {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera: THREE.PerspectiveCamera;
  private readonly floors: FloorRig[] = [];
  private groundFloor!: THREE.Mesh;
  private groundFront!: THREE.MeshStandardMaterial;
  private readonly trimMats: THREE.MeshStandardMaterial[] = [];
  private readonly building = new THREE.Group();

  private readonly crateLine: THREE.Mesh;
  private readonly lineBase: number;
  private readonly crate: THREE.Group;
  private readonly crateLow: number;
  private readonly crateHigh: number;
  private readonly beaconMat: THREE.MeshStandardMaterial;
  private readonly roofLightMat: THREE.MeshStandardMaterial;
  private readonly sunMat: THREE.SpriteMaterial;

  private readonly particlePos: Float32Array;
  private readonly particleSpeed: Float32Array;
  private readonly particleSeed: Float32Array;
  private readonly particleGeo: THREE.BufferGeometry;
  private readonly particleCount: number;

  private readonly pointer = new THREE.Vector2();
  private readonly clock = new THREE.Clock();
  private raf = 0;
  private time = 0;
  private paused = false;
  private disposed = false;
  private readonly resizeObs: ResizeObserver;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly opts: Preloader3DOptions,
  ) {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(w, h, false);
    this.renderer.setClearColor(NIGHT, 1);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.12;

    this.camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 80);
    this.camera.position.set(5.4, 3.4, 7.4);

    this.scene.fog = new THREE.Fog(NIGHT, 10, 26);

    this.buildBackdrop();
    this.buildGround();
    this.sunMat = this.buildSun();
    this.buildSkyline();
    this.buildLights();
    this.buildBuilding();
    this.buildCrane();

    const particleSetup = this.buildParticles();
    this.particleGeo = particleSetup.geo;
    this.particlePos = particleSetup.pos;
    this.particleSpeed = particleSetup.speed;
    this.particleSeed = particleSetup.seed;
    this.particleCount = particleSetup.count;

    this.crateLine = this.crateMats.line;
    this.lineBase = this.crateMats.lineBase;
    this.crate = this.crateMats.crate;
    this.crateLow = this.crateMats.low;
    this.crateHigh = this.crateMats.high;
    this.beaconMat = this.crateMats.beacon;
    this.roofLightMat = this.crateMats.roofLight;

    window.addEventListener('resize', this.onResize);
    window.addEventListener('pointermove', this.onPointer, { passive: true });
    document.addEventListener('visibilitychange', this.onVisibility);
    this.resizeObs = new ResizeObserver(() => this.onResize());
    this.resizeObs.observe(canvas.parentElement ?? canvas);

    void this.frame();
  }

  /* ── scene construction ─────────────────────────── */

  private buildBackdrop() {
    const td = makeSkyTexture();
    const mat = new THREE.MeshBasicMaterial({ map: td, fog: false });
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(90, 44), mat);
    plane.position.set(0, 5.6, -11);
    this.scene.add(plane);
  }

  private buildGround() {
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(64, 64),
      new THREE.MeshStandardMaterial({
        color: 0x0a120d,
        roughness: 0.92,
        metalness: 0.05,
      }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    const grid = new THREE.GridHelper(
      28,
      28,
      new THREE.Color(GOLD_DEEP),
      new THREE.Color(0x24352b),
    );
    const gm = grid.material as THREE.Material;
    gm.transparent = true;
    gm.opacity = 0.5;
    grid.position.y = 0.015;
    this.scene.add(grid);

    const glow = new THREE.Mesh(
      new THREE.CircleGeometry(8, 48),
      new THREE.MeshBasicMaterial({
        map: makeRadialTexture('rgba(196,162,101,0.55)', 'rgba(0,0,0,0)'),
        transparent: true,
        depthWrite: false,
      }),
    );
    glow.rotation.x = -Math.PI / 2;
    glow.position.y = 0.02;
    this.scene.add(glow);
  }

  private buildSun(): THREE.SpriteMaterial {
    const mat = new THREE.SpriteMaterial({
      map: makeRadialTexture('rgba(255,214,150,0.9)', 'rgba(0,0,0,0)'),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const sun = new THREE.Sprite(mat);
    sun.position.set(-5.8, 4.4, -8);
    sun.scale.set(9, 9, 1);
    this.scene.add(sun);
    return mat;
  }

  private buildSkyline() {
    const heights = [3.2, 5.4, 2.4, 4.6, 3.0, 6.2, 3.8];
    const xs = [-11, -7.4, -4.2, -1.2, 1.6, 4.6, 8.2];
    xs.forEach((x, i) => {
      const h = heights[i];
      const mat = new THREE.MeshStandardMaterial({
        color: 0x070c09,
        metalness: 0.2,
        roughness: 0.9,
      });
      const b = new THREE.Mesh(new THREE.BoxGeometry(2.1, h, 0.9), mat);
      b.position.set(x, h / 2, -6.6 - (i % 3) * 0.55);
      this.scene.add(b);
    });
  }

  private buildLights() {
    this.scene.add(new THREE.HemisphereLight(0xc9d8cc, 0x101712, 0.6));

    const sun = new THREE.DirectionalLight(0xffd9a0, 2.4);
    sun.position.set(-5, 7.5, -4);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -7;
    sun.shadow.camera.right = 7;
    sun.shadow.camera.top = 10;
    sun.shadow.camera.bottom = -1;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 22;
    sun.shadow.bias = -0.0006;
    this.scene.add(sun);

    const warm = new THREE.PointLight(GOLD, 42, 9, 2);
    warm.position.set(0.4, 2.4, 3.6);
    this.scene.add(warm);

    const rim = new THREE.PointLight(0x8fd6ff, 18, 12, 2);
    rim.position.set(6, 3, -3);
    this.scene.add(rim);
  }

  private buildBuilding() {
    const N = this.opts.floorCount;
    const halfW = 0.95;
    const halfD = 0.55;
    const floorH = 0.92;
    const groundH = 1.18;
    const gap = 0.012;
    const sideMat = new THREE.MeshStandardMaterial({
      map: makeSideTexture(),
      roughness: 0.55,
      metalness: 0.35,
    });
    const roofMat = new THREE.MeshStandardMaterial({
      map: makeRoofTexture(),
      roughness: 0.85,
      metalness: 0.15,
    });

    const trimMat = new THREE.MeshStandardMaterial({
      color: 0xc9a55f,
      metalness: 0.85,
      roughness: 0.32,
      emissive: GOLD,
      emissiveIntensity: 0.22,
    });
    this.trimMats.push(trimMat);

    for (let i = 0; i < N; i++) {
      const texs = makeFacadeTextures(false);
      const front = new THREE.MeshStandardMaterial({
        map: texs.map,
        emissiveMap: texs.emit,
        emissive: GOLD,
        emissiveIntensity: 0,
        roughness: 0.5,
        metalness: 0.3,
      });
      const base = groundH + i * (floorH + gap);
      const geo = new THREE.BoxGeometry(halfW * 2, floorH, halfD * 2).translate(
        0,
        floorH / 2,
        0,
      );
      const mesh = new THREE.Mesh(geo, [sideMat, sideMat, roofMat, roofMat, front, front]);
      mesh.position.set(0, base, 0);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.building.add(mesh);
      this.floors.push({ mesh, front, base, on: false });
    }

    const gTexs = makeFacadeTextures(true);
    this.groundFront = new THREE.MeshStandardMaterial({
      map: gTexs.map,
      emissiveMap: gTexs.emit,
      emissive: GOLD,
      emissiveIntensity: 1.25,
      roughness: 0.5,
      metalness: 0.3,
    });
    const gGeo = new THREE.BoxGeometry(halfW * 2, groundH, halfD * 2).translate(
      0,
      groundH / 2,
      0,
    );
    this.groundFloor = new THREE.Mesh(gGeo, [sideMat, sideMat, roofMat, roofMat, this.groundFront, this.groundFront]);
    this.groundFloor.position.set(0, 0, 0);
    this.groundFloor.castShadow = true;
    this.groundFloor.receiveShadow = true;
    this.building.add(this.groundFloor);

    const top = groundH + N * (floorH + gap);
    const parapet = new THREE.Mesh(
      new THREE.BoxGeometry(halfW * 2 + 0.14, 0.16, halfD * 2 + 0.14),
      trimMat,
    );
    parapet.position.set(0, top + 0.08, 0);
    parapet.castShadow = true;
    this.building.add(parapet);

    const unitMat = new THREE.MeshStandardMaterial({
      color: 0x1a241e,
      roughness: 0.8,
      metalness: 0.3,
    });
    [-0.44, 0, 0.5].forEach((x, i) => {
      const u = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.16, 0.3), unitMat);
      u.position.set(x, top + 0.24, -0.05 + i * 0.02);
      this.building.add(u);
    });

    const antenna = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.014, 1.0, 6),
      new THREE.MeshStandardMaterial({ color: 0xd9cdb0, metalness: 0.7, roughness: 0.4 }),
    );
    antenna.position.set(-0.3, top + 0.72, 0);
    this.building.add(antenna);

    const beacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 12, 12),
      new THREE.MeshStandardMaterial({
        color: 0xff4d40,
        emissive: 0xff4d40,
        emissiveIntensity: 1.4,
      }),
    );
    beacon.position.set(0.74, top + 0.12, halfD * 2 - 0.15);
    this.building.add(beacon);

    const colGeo = new THREE.BoxGeometry(0.07, top * 0.98, 0.07);
    const cols: Array<[number, number]> = [
      [-halfW, halfD * 2],
      [halfW, halfD * 2],
      [-halfW, 0],
      [halfW, 0],
    ];
    for (const [x, z] of cols) {
      const c = new THREE.Mesh(colGeo, trimMat);
      c.position.set(x, (top * 0.98) / 2, z * 0.76);
      c.castShadow = true;
      this.building.add(c);
      this.trimMats.push(trimMat);
    }

    this.scene.add(this.building);
  }

  private buildCrane() {
    const mastX = 3.05;
    const mastH = 9.6;
    const dark = new THREE.MeshStandardMaterial({
      color: 0x121a15,
      metalness: 0.6,
      roughness: 0.5,
    });
    const frame = new THREE.MeshStandardMaterial({
      color: 0x2a3a31,
      metalness: 0.55,
      roughness: 0.5,
    });
    const gold = new THREE.MeshStandardMaterial({
      color: 0xd9b06a,
      metalness: 0.8,
      roughness: 0.35,
      emissive: 0x8a6a2f,
      emissiveIntensity: 0.3,
    });

    const mast = new THREE.Mesh(new THREE.BoxGeometry(0.18, mastH, 0.18), dark);
    mast.position.set(mastX, mastH / 2, 0.15);
    mast.castShadow = true;
    this.scene.add(mast);

    const jibTop = mastH - 0.35;
    const jib = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.1, 0.24), frame);
    jib.position.set(mastX - 2.7, jibTop, 0.15);
    jib.castShadow = true;
    this.scene.add(jib);

    const counter = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.12, 0.24), frame);
    counter.position.set(mastX + 0.9, jibTop, 0.15);
    counter.castShadow = true;
    this.scene.add(counter);

    const ballast = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.42, 0.4), dark);
    ballast.position.set(mastX + 1.38, jibTop - 0.36, 0.15);
    ballast.castShadow = true;
    this.scene.add(ballast);

    const cab = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, 0.26), gold);
    cab.position.set(mastX - 0.05, mastH - 0.75, 0.38);
    this.scene.add(cab);

    const cabGlass = new THREE.Mesh(
      new THREE.BoxGeometry(0.36, 0.24, 0.02),
      new THREE.MeshStandardMaterial({ color: 0x0b0f0c, roughness: 0.1, metalness: 0.6 }),
    );
    cabGlass.position.set(mastX - 0.05, mastH - 0.75, 0.52);
    this.scene.add(cabGlass);

    const roofLight = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 10, 10),
      new THREE.MeshStandardMaterial({
        color: 0xffb23d,
        emissive: 0xff9d1f,
        emissiveIntensity: 1.2,
      }),
    );
    const roofLightMat = roofLight.material as THREE.MeshStandardMaterial;
    roofLight.position.set(mastX, mastH + 0.08, 0.15);
    this.scene.add(roofLight);

    const beacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 10, 10),
      new THREE.MeshStandardMaterial({
        color: 0xff4d40,
        emissive: 0xff4d40,
        emissiveIntensity: 1.4,
      }),
    );
    beacon.position.set(mastX - 5.65, jibTop + 0.09, 0.15);
    this.scene.add(beacon);
    const beaconMat = beacon.material as THREE.MeshStandardMaterial;

    const low = 1.15;
    const high = 8.7;
    const lineBase = high - low;
    const line = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, lineBase, 0.02).translate(0, lineBase / 2, 0),
      new THREE.MeshStandardMaterial({ color: 0xd9b06a, metalness: 0.8, roughness: 0.3 }),
    );
    const crate = new THREE.Group();
    const crateBox = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.34, 0.38), gold);
    crateBox.position.y = 0.17;
    crateBox.castShadow = true;
    const brace1 = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.03, 0.03), dark);
    brace1.rotation.z = Math.PI / 4;
    brace1.position.y = 0.17;
    const brace2 = brace1.clone();
    brace2.rotation.z = -Math.PI / 4;
    crate.add(crateBox, brace1, brace2);
    crate.position.set(mastX - 2.6, low, 0.15);
    line.position.set(mastX - 2.6, (low + high) / 2, 0.15);
    line.scale.y = (high - low) / lineBase;
    this.scene.add(crate, line);

    const these = {
      line,
      lineBase,
      crate,
      low,
      high,
      beacon: beaconMat,
      roofLight: roofLightMat,
    };
    this.crateMats = these;
  }
  private crateMats!: {
    line: THREE.Mesh;
    lineBase: number;
    crate: THREE.Group;
    low: number;
    high: number;
    beacon: THREE.MeshStandardMaterial;
    roofLight: THREE.MeshStandardMaterial;
  };

  private buildParticles() {
    const count = 340;
    const pos = new Float32Array(count * 3);
    const speed = new Float32Array(count);
    const seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 9;
      pos[i * 3 + 1] = Math.random() * 9.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 7;
      speed[i] = 0.5 + Math.random() * 1.1;
      seed[i] = Math.random() * Math.PI * 2;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: GOLD,
      size: 0.045,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });
    const points = new THREE.Points(geo, mat);
    this.scene.add(points);
    return { geo, pos, speed, seed, count };
  }

  /* ── events ──────────────────────────────────────── */

  private readonly onResize = () => {
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
  };

  private readonly onPointer = (ev: PointerEvent) => {
    this.pointer.x = (ev.clientX / window.innerWidth) * 2 - 1;
    this.pointer.y = (ev.clientY / window.innerHeight) * 2 - 1;
  };

  private readonly onVisibility = () => {
    this.paused = document.hidden;
  };

  /* ── loop ────────────────────────────────────────── */

  private frame() {
    if (this.disposed) {
      return;
    }
    this.raf = requestAnimationFrame(() => this.frame());
    if (this.paused) {
      this.clock.getDelta();
      return;
    }

    const dt = Math.min(this.clock.getDelta(), 0.05);
    this.time += dt;
    const t = this.time;
    const pct = Math.min(100, Math.max(0, this.opts.getPct()));

    const N = this.opts.floorCount;
    for (let i = 0; i < N; i++) {
      const f = this.floors[i];
      const threshold = ((i + 1) / N) * 100;
      const target = pct >= threshold ? 1 : 0;
      const cur = f.mesh.scale.y;
      const next = cur + (target - cur) * Math.min(1, dt * 7);
      f.mesh.scale.y = next;
      if (target === 1 && !f.on) {
        f.on = true;
      }
      const lit = target * (1.08 + 0.14 * Math.sin(t * 2.7 + i * 1.7));
      f.front.emissiveIntensity += (lit - f.front.emissiveIntensity) * Math.min(1, dt * 6);
    }
    this.groundFront.emissiveIntensity = 1.25 + 0.18 * Math.sin(t * 1.8);

    const lift = (pct / 100) * (this.crateHigh - this.crateLow);
    const crateY = this.crateLow + lift;
    this.crate.position.y = crateY;
    this.crate.rotation.z = Math.sin(t * 0.9) * 0.08;
    const lineLen = this.crateHigh - crateY;
    this.crateLine.scale.y = lineLen / this.lineBase;
    this.crateLine.position.y = (this.crateHigh + crateY) / 2;

    const blink = Math.sin(t * 9) > 0 ? 1.5 : 0.05;
    this.beaconMat.emissiveIntensity = blink;
    this.roofLightMat.emissiveIntensity = 0.4 + Math.sin(t * 6) * 0.3;

    const ps = this.particlePos;
    const cnt = this.particleCount;
    for (let i = 0; i < cnt; i++) {
      let y = ps[i * 3 + 1] + this.particleSpeed[i] * dt;
      if (y > 9.6) {
        y = 0;
        ps[i * 3] = (Math.random() - 0.5) * 9;
        ps[i * 3 + 2] = (Math.random() - 0.5) * 7;
      }
      ps[i * 3 + 1] = y;
      ps[i * 3] += Math.sin(t * 0.6 + this.particleSeed[i]) * dt * 0.35;
      ps[i * 3 + 2] += Math.cos(t * 0.5 + this.particleSeed[i]) * dt * 0.3;
    }
    this.particleGeo.getAttribute('position').needsUpdate = true;

    this.building.rotation.y = Math.sin(t * 0.1) * 0.05;
    this.sunMat.opacity = 0.75 + Math.sin(t * 0.5) * 0.18;
    this.sunMat.rotation++;

    this.camera.position.x = 5.4 + Math.sin(t * 0.12) * 0.55 + this.pointer.x * 1.2;
    this.camera.position.y = 3.4 + Math.sin(t * 0.08 + 1) * 0.3 + this.pointer.y * 0.8;
    this.camera.position.z = 7.4 + Math.cos(t * 0.1) * 0.2;
    const lookY = 2.4 + pct * 0.022;
    this.camera.lookAt(0, lookY, 0);

    this.renderer.render(this.scene, this.camera);
  }

  dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('pointermove', this.onPointer);
    document.removeEventListener('visibilitychange', this.onVisibility);
    this.resizeObs.disconnect();

    const disposed = new Set<THREE.Object3D>();
    this.scene.traverse((obj) => {
      if (disposed.has(obj)) {
        return;
      }
      disposed.add(obj);
      const mesh = obj as THREE.Mesh;
      const g = mesh.geometry as THREE.BufferGeometry | undefined;
      if (g) {
        g.dispose();
      }
      const mats = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
      for (const m of mats) {
        const mm = m as THREE.MeshStandardMaterial;
        if (mm.map) {
          mm.map.dispose();
        }
        if (mm.emissiveMap) {
          mm.emissiveMap.dispose();
        }
        m.dispose();
      }
    });
    this.renderer.dispose();
  }
}