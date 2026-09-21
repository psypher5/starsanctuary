/**
 * Star Sanctuary — 3D Interactive Merkaba Star Hero
 * Real-time Three.js Stella Octangula with apex pointing straight UP,
 * free-spinning rotation, gentle tilt wobble, and shooting star particles.
 */

import * as THREE from 'https://unpkg.com/three@0.162.0/build/three.module.js';
import { sanctuaryAudio } from './audio.js';

export class StarHero {
  constructor(canvasContainerId) {
    this.container = document.getElementById(canvasContainerId);
    if (!this.container) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;

    // 3D Objects
    this.starGroup = null;
    this.merkabaMesh1 = null;
    this.merkabaMesh2 = null;
    this.innerCore = null;
    this.wireframe1 = null;
    this.wireframe2 = null;
    this.coreLight = null;
    this.helixGroup = null;
    this.helixTrails = [];
    this.boosterPulse = 0;
    this.shockwaveRing = null;
    this.lotusRingsGroup = null;

    // Motion State: Free-spinning with gentle tilt wobble & subtle mouse parallax
    this.targetTiltX = 0;
    this.targetTiltZ = 0;
    this.burstSpin = 0;
    this.clock = new THREE.Clock();

    this.init();
  }

  init() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    // 1. Scene setup
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.set(0, 0, 4.8);
    this.camera.lookAt(0, 0, 0);

    // 2. Renderer setup
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.35;
    this.container.appendChild(this.renderer.domElement);

    // 3. Lighting
    this.setupLighting();

    // 4. Construct the 3D Merkaba Star with apex pointing UP
    this.buildStar();
    this.buildHelixBoosterLines();
    this.buildLotusEnergyRings();
    this.buildShockwave();

    // 5. Event Listeners
    window.addEventListener('resize', () => this.onResize());
    window.addEventListener('pointermove', (e) => this.onPointerMove(e));
    this.container.addEventListener('click', () => this.pulse());

    // 6. Start Render Loop
    this.animate();
  }

  setupLighting() {
    // Ambient cosmic light
    const ambientLight = new THREE.AmbientLight(0x0a1024, 2.0);
    this.scene.add(ambientLight);

    // Key starlight from top-left
    const dirLight = new THREE.DirectionalLight(0xe0f2fe, 3.8);
    dirLight.position.set(4, 6, 5);
    this.scene.add(dirLight);

    // Deep cobalt back-rim
    const rimLight = new THREE.DirectionalLight(0x0284c7, 4.2);
    rimLight.position.set(-3, -3, -4);
    this.scene.add(rimLight);

    // Warm gold rim
    const goldRim = new THREE.DirectionalLight(0xf59e0b, 2.0);
    goldRim.position.set(0, 5, -2);
    this.scene.add(goldRim);

    // Crystalline core point light
    this.coreLight = new THREE.PointLight(0x38bdf8, 5.5, 8);
    this.coreLight.position.set(0, 0, 0);
    this.scene.add(this.coreLight);
  }

  /**
   * Mathematically construct regular tetrahedron with vertex pointing straight UP (0, R, 0)
   */
  createUpwardTetrahedron(r) {
    const yTop = r;
    const yBase = -r / 3;
    const rBase = (2 * Math.sqrt(2) / 3) * r;

    const v0 = [0, yTop, 0];
    const v1 = [rBase, yBase, 0];
    const v2 = [rBase * Math.cos(2 * Math.PI / 3), yBase, rBase * Math.sin(2 * Math.PI / 3)];
    const v3 = [rBase * Math.cos(4 * Math.PI / 3), yBase, rBase * Math.sin(4 * Math.PI / 3)];

    const vertices = new Float32Array([
      // Face 1
      ...v0, ...v1, ...v2,
      // Face 2
      ...v0, ...v2, ...v3,
      // Face 3
      ...v0, ...v3, ...v1,
      // Base Face
      ...v1, ...v3, ...v2
    ]);

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geom.computeVertexNormals();
    return geom;
  }

  /**
   * Mathematically construct dual inverted tetrahedron with vertex pointing straight DOWN (0, -R, 0)
   */
  createDownwardTetrahedron(r) {
    const yBottom = -r;
    const yBase = r / 3;
    const rBase = (2 * Math.sqrt(2) / 3) * r;
    const rot = Math.PI / 3; // Rotated by 60 degrees for Kepler symmetry

    const v0 = [0, yBottom, 0];
    const v1 = [rBase * Math.cos(rot), yBase, rBase * Math.sin(rot)];
    const v2 = [rBase * Math.cos(rot + 2 * Math.PI / 3), yBase, rBase * Math.sin(rot + 2 * Math.PI / 3)];
    const v3 = [rBase * Math.cos(rot + 4 * Math.PI / 3), yBase, rBase * Math.sin(rot + 4 * Math.PI / 3)];

    const vertices = new Float32Array([
      // Face 1
      ...v0, ...v2, ...v1,
      // Face 2
      ...v0, ...v3, ...v2,
      // Face 3
      ...v0, ...v1, ...v3,
      // Base Face
      ...v1, ...v2, ...v3
    ]);

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geom.computeVertexNormals();
    return geom;
  }

  buildStar() {
    this.starGroup = new THREE.Group();
    this.starGroup.position.set(0, -0.28, 0); // Positioned gracefully below top wordmark

    // Physical marble / platinum facet material
    const facetMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xf8fafc,
      metalness: 0.16,
      roughness: 0.15,
      clearcoat: 0.95,
      clearcoatRoughness: 0.08,
      reflectivity: 0.85,
      flatShading: true,
      side: THREE.DoubleSide
    });

    // Gold Beveled Edge Wireframe
    const goldEdgeMat = new THREE.LineBasicMaterial({
      color: 0xfbbf24,
      linewidth: 2,
      transparent: true,
      opacity: 0.88
    });

    const starRadius = 1.05;

    // 1. Upward-pointing Tetrahedron (Apex straight UP)
    const geom1 = this.createUpwardTetrahedron(starRadius);
    this.merkabaMesh1 = new THREE.Mesh(geom1, facetMaterial);
    const edges1 = new THREE.EdgesGeometry(geom1);
    this.wireframe1 = new THREE.LineSegments(edges1, goldEdgeMat);
    this.merkabaMesh1.add(this.wireframe1);
    this.starGroup.add(this.merkabaMesh1);

    // 2. Downward-pointing Tetrahedron (Apex straight DOWN)
    const geom2 = this.createDownwardTetrahedron(starRadius);
    this.merkabaMesh2 = new THREE.Mesh(geom2, facetMaterial);
    const edges2 = new THREE.EdgesGeometry(geom2);
    this.wireframe2 = new THREE.LineSegments(edges2, goldEdgeMat);
    this.merkabaMesh2.add(this.wireframe2);
    this.starGroup.add(this.merkabaMesh2);

    // 3. Central Glowing Cyan Octahedron Core (Apexes straight UP & DOWN)
    const coreGeom = new THREE.OctahedronGeometry(0.42, 0);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: false,
      transparent: true,
      opacity: 0.92
    });
    this.innerCore = new THREE.Mesh(coreGeom, coreMat);
    this.starGroup.add(this.innerCore);

    // Inner wireframe for core
    const coreWireGeom = new THREE.WireframeGeometry(coreGeom);
    const coreWireMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
    const coreWire = new THREE.LineSegments(coreWireGeom, coreWireMat);
    this.innerCore.add(coreWire);

    this.scene.add(this.starGroup);
  }

  /**
   * Construct elegant glowing helical line trails swarming around the star
   * with rocket booster / shooting star propulsion dynamics.
   */
  buildHelixBoosterLines() {
    this.helixGroup = new THREE.Group();
    this.helixGroup.position.set(0, -0.28, 0);

    const trailCount = 8; // Sculptural set of 8 clean helical streamlines
    this.helixTrails = [];

    // Distinct starlight palettes: ice cyan, solar gold, and pure white starlight
    const palettes = [
      { r: 0.22, g: 0.74, b: 0.97, dir: 1, freq: 2.3 },   // Cyan Helix (Clockwise)
      { r: 0.96, g: 0.68, b: 0.12, dir: -1, freq: 2.5 },  // Gold Helix (Counter-clockwise)
      { r: 0.22, g: 0.74, b: 0.97, dir: 1, freq: 2.1 },   // Cyan Helix (Clockwise)
      { r: 0.92, g: 0.96, b: 1.00, dir: -1, freq: 2.4 },  // White Starlight (Counter-clockwise)
      { r: 0.96, g: 0.68, b: 0.12, dir: 1, freq: 2.6 },   // Gold Helix (Clockwise)
      { r: 0.22, g: 0.74, b: 0.97, dir: -1, freq: 2.2 },  // Cyan Helix (Counter-clockwise)
      { r: 0.92, g: 0.96, b: 1.00, dir: 1, freq: 2.5 },   // White Starlight (Clockwise)
      { r: 0.22, g: 0.74, b: 0.97, dir: -1, freq: 2.3 }   // Cyan Helix (Counter-clockwise)
    ];

    const pointsPerTrail = 44;

    for (let t = 0; t < trailCount; t++) {
      const cfg = palettes[t % palettes.length];
      const positions = new Float32Array(pointsPerTrail * 3);
      const colors = new Float32Array(pointsPerTrail * 3);

      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const mat = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.92,
        blending: THREE.AdditiveBlending,
        linewidth: 2,
        depthWrite: false
      });

      const lineMesh = new THREE.Line(geom, mat);
      this.helixGroup.add(lineMesh);

      // Leading shooting star spark
      const sparkGeom = new THREE.BufferGeometry();
      sparkGeom.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0, 0]), 3));
      const sparkMat = new THREE.PointsMaterial({
        size: 0.09,
        color: new THREE.Color(cfg.r, cfg.g, cfg.b),
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending
      });
      const spark = new THREE.Points(sparkGeom, sparkMat);
      this.helixGroup.add(spark);

      // Staggered initial vertical progression
      const yHead = -2.6 + (t / trailCount) * 5.2;

      this.helixTrails.push({
        line: lineMesh,
        spark: spark,
        yHead: yHead,
        length: 1.5 + (t % 3) * 0.25,
        speed: 0.026 + (t % 4) * 0.007,
        baseAngle: (t * Math.PI * 2) / trailCount + (t * 0.35),
        rotSpeed: 0.005 + (t % 3) * 0.003,
        dir: cfg.dir,
        freq: cfg.freq,
        rBase: 1.16 + (t % 3) * 0.08,
        color: cfg,
        pointsCount: pointsPerTrail
      });
    }

    this.scene.add(this.helixGroup);
  }

  buildLotusEnergyRings() {
    this.lotusRingsGroup = new THREE.Group();
    this.lotusRingsGroup.position.set(0, -0.05, 0);

    const ringConfigs = [
      { r: 1.4, y: -1.2, color: 0x0284c7, opacity: 0.18, tilt: 0.35 },
      { r: 1.1, y: -0.8, color: 0x38bdf8, opacity: 0.24, tilt: 0.4 },
      { r: 0.8, y: -0.4, color: 0xf59e0b, opacity: 0.28, tilt: 0.45 }
    ];

    ringConfigs.forEach((cfg, idx) => {
      const ringGeom = new THREE.RingGeometry(cfg.r, cfg.r + 0.015, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: cfg.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: cfg.opacity,
        blending: THREE.AdditiveBlending
      });
      const mesh = new THREE.Mesh(ringGeom, ringMat);
      mesh.position.y = cfg.y;
      mesh.rotation.x = Math.PI / 2 + cfg.tilt;
      mesh.userData = { rotSpeed: (idx % 2 === 0 ? 1 : -1) * (0.003 + idx * 0.001) };
      this.lotusRingsGroup.add(mesh);
    });

    this.scene.add(this.lotusRingsGroup);
  }

  buildShockwave() {
    const geom = new THREE.RingGeometry(0.1, 0.15, 48);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending
    });
    this.shockwaveRing = new THREE.Mesh(geom, mat);
    this.shockwaveRing.position.set(0, -0.28, 0);
    this.scene.add(this.shockwaveRing);
    this.shockwaveActive = false;
    this.shockwaveScale = 1;
  }

  pulse() {
    this.shockwaveActive = true;
    this.shockwaveScale = 1;
    if (this.shockwaveRing) {
      this.shockwaveRing.scale.set(1, 1, 1);
      this.shockwaveRing.material.opacity = 0.95;
    }

    if (this.coreLight) {
      this.coreLight.intensity = 9.0;
    }

    this.burstSpin = 0.07;
    this.boosterPulse = 0.08; // Rocket booster burst surge
    sanctuaryAudio.playResonanceChord();
  }

  onPointerMove(e) {
    // Subtle, gentle parallax tilt (not wild spinning)
    const normX = (e.clientX / window.innerWidth) * 2 - 1;
    const normY = -(e.clientY / window.innerHeight) * 2 + 1;

    this.targetTiltZ = -normX * 0.14;
    this.targetTiltX = -normY * 0.14;
  }

  onResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight || window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    // 1. Star: Free Spin Left-to-Right + Gentle Tilt Wobble
    if (this.starGroup) {
      // Free continuous spin
      this.starGroup.rotation.y += 0.007 + (this.burstSpin || 0);

      // Hypnotic tilt wobble
      const wobbleX = Math.sin(elapsedTime * 0.75) * 0.08;
      const wobbleZ = Math.cos(elapsedTime * 0.55) * 0.06;

      // Smoothly blend wobble + subtle mouse parallax
      this.starGroup.rotation.x = THREE.MathUtils.lerp(this.starGroup.rotation.x, wobbleX + this.targetTiltX, 0.035);
      this.starGroup.rotation.z = THREE.MathUtils.lerp(this.starGroup.rotation.z, wobbleZ + this.targetTiltZ, 0.035);

      if (this.burstSpin > 0) {
        this.burstSpin = Math.max(0, this.burstSpin - 0.002);
      }

      // Gentle floating hover
      this.starGroup.position.y = -0.28 + Math.sin(elapsedTime * 1.5) * 0.04;
    }

    // 2. Pulse central cyan core
    if (this.innerCore) {
      const coreScale = 1.0 + Math.sin(elapsedTime * 3.0) * 0.08;
      this.innerCore.scale.set(coreScale, coreScale, coreScale);
      this.innerCore.rotation.y -= 0.012;
    }

    // 3. Core light relaxation
    if (this.coreLight && this.coreLight.intensity > 5.5) {
      this.coreLight.intensity = THREE.MathUtils.lerp(this.coreLight.intensity, 5.5, 0.05);
    }

    // 4. Animate Shooting Star Helix Trails (Rocket Booster Plume)
    if (this.helixTrails && this.helixTrails.length > 0) {
      const boost = this.boosterPulse || 0;
      if (this.boosterPulse > 0) {
        this.boosterPulse = Math.max(0, this.boosterPulse - 0.002);
      }

      for (let t = 0; t < this.helixTrails.length; t++) {
        const trail = this.helixTrails[t];
        trail.yHead += trail.speed + boost;

        // Wrap around when past upper threshold
        if (trail.yHead - trail.length > 2.8) {
          trail.yHead = -2.8 - Math.random() * 0.4;
          trail.baseAngle = Math.random() * Math.PI * 2;
        }

        const posArr = trail.line.geometry.attributes.position.array;
        const colArr = trail.line.geometry.attributes.color.array;
        const n = trail.pointsCount;

        for (let i = 0; i < n; i++) {
          const u = i / (n - 1); // 0 = tail, 1 = head
          const y = trail.yHead - (1 - u) * trail.length;

          // Smooth harmonic radius: envelopes the star gracefully without sharp pinching or corners
          const radius = trail.rBase * (0.92 + 0.22 * Math.cos(y * 1.25));

          const angle = trail.baseAngle + (trail.dir * (y * trail.freq)) + (elapsedTime * trail.rotSpeed);

          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;

          posArr[i * 3] = x;
          posArr[i * 3 + 1] = y;
          posArr[i * 3 + 2] = z;

          // Natural exponential fade from zero-opacity tail to luminous head
          const intensity = Math.pow(u, 2.4);
          const headGlow = u > 0.84 ? Math.pow((u - 0.84) / 0.16, 1.4) : 0;

          colArr[i * 3] = THREE.MathUtils.lerp(trail.color.r * intensity, 1.0, headGlow);
          colArr[i * 3 + 1] = THREE.MathUtils.lerp(trail.color.g * intensity, 1.0, headGlow);
          colArr[i * 3 + 2] = THREE.MathUtils.lerp(trail.color.b * intensity, 1.0, headGlow);

          // Position leading spark at the head of the trail
          if (i === n - 1 && trail.spark) {
            const sparkPos = trail.spark.geometry.attributes.position.array;
            sparkPos[0] = x;
            sparkPos[1] = y;
            sparkPos[2] = z;
            trail.spark.geometry.attributes.position.needsUpdate = true;
          }
        }

        trail.line.geometry.attributes.position.needsUpdate = true;
        trail.line.geometry.attributes.color.needsUpdate = true;
      }
    }

    // 5. Staggered Energy Rings
    if (this.lotusRingsGroup) {
      this.lotusRingsGroup.children.forEach(child => {
        if (child.userData && child.userData.rotSpeed) {
          child.rotation.z += child.userData.rotSpeed;
        }
      });
    }

    // 6. Pulse Shockwave
    if (this.shockwaveActive && this.shockwaveRing) {
      this.shockwaveScale += delta * 7.5;
      this.shockwaveRing.scale.set(this.shockwaveScale, this.shockwaveScale, 1);
      this.shockwaveRing.material.opacity = Math.max(0, 0.95 - (this.shockwaveScale * 0.22));

      if (this.shockwaveRing.material.opacity <= 0) {
        this.shockwaveActive = false;
      }
    }

    this.renderer.render(this.scene, this.camera);
  }
}
