import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Eye, ShieldCheck, CreditCard, Cloud, Cpu, Globe, RefreshCw, Zap, Maximize2, Layers } from 'lucide-react';

interface ThreeSceneProps {
  activeVendorId?: string;
  isSimulatingSpike?: boolean;
  onSelectNode?: (nodeId: string) => void;
}

// Pre-allocated scratch objects for Zero-GC in render loop
const _vec3 = new THREE.Vector3();
const _targetPos = new THREE.Vector3();

export const ThreeScene: React.FC<ThreeSceneProps> = ({
  activeVendorId = 'auth0',
  isSimulatingSpike = false,
  onSelectNode,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [cameraView, setCameraView] = useState<'orbit' | 'gateway' | 'auth0' | 'stripe'>('orbit');
  const [explodedFactor, setExplodedFactor] = useState(0);
  const [activeNodeName, setActiveNodeName] = useState<string>('Auth0 Identity Node (Degraded)');
  const [particleSpeed, setParticleSpeed] = useState(1);

  // Mutable refs to pass props safely into animation loop without re-instantiating WebGL
  const stateRef = useRef({
    activeVendorId,
    isSimulatingSpike,
    cameraView,
    explodedFactor,
    particleSpeed,
    targetCamPos: new THREE.Vector3(0, 18, 32),
    targetLookAt: new THREE.Vector3(0, 2, 0),
  });

  useEffect(() => {
    stateRef.current.activeVendorId = activeVendorId;
    stateRef.current.isSimulatingSpike = isSimulatingSpike;
    stateRef.current.cameraView = cameraView;
    stateRef.current.explodedFactor = explodedFactor;
    stateRef.current.particleSpeed = particleSpeed;

    // Camera preset coordinates
    if (cameraView === 'orbit') {
      stateRef.current.targetCamPos.set(0, 18, 32);
      stateRef.current.targetLookAt.set(0, 2, 0);
    } else if (cameraView === 'gateway') {
      stateRef.current.targetCamPos.set(0, 7, 14);
      stateRef.current.targetLookAt.set(0, 2, 0);
    } else if (cameraView === 'auth0') {
      stateRef.current.targetCamPos.set(-11, 8, 12);
      stateRef.current.targetLookAt.set(-10, 2, -2);
    } else if (cameraView === 'stripe') {
      stateRef.current.targetCamPos.set(11, 8, 12);
      stateRef.current.targetLookAt.set(10, 2, -2);
    }
  }, [activeVendorId, isSimulatingSpike, cameraView, explodedFactor, particleSpeed]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Software WebGL Guard as required by threejs skill
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Setup Renderer
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 3. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f7f1);
    scene.fog = new THREE.Fog(0xf5f7f1, 35, 75);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 18, 32);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.minDistance = 8;
    controls.maxDistance = 60;
    controls.target.set(0, 2, 0);

    // 4. Studio Environment Map (PMREM + RoomEnvironment)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 5. Lighting: Warm Directional Key + Cool Hemisphere Fill
    const keyLight = new THREE.DirectionalLight(0xfffaed, 2.4);
    keyLight.position.set(15, 25, 15);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 60;
    const d = 20;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const hemiLight = new THREE.HemisphereLight(0xdbe6cf, 0x6e7b56, 1.2);
    hemiLight.position.set(0, 30, 0);
    scene.add(hemiLight);

    // 6. Ground Grid & Contact Shadow Plane (Procedural Canvas)
    const floorSize = 80;
    const floorGeo = new THREE.PlaneGeometry(floorSize, floorSize);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xebf0e3,
      roughness: 0.85,
      metalness: 0.05,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = 0;
    floorMesh.receiveShadow = !isSoftwareGl;
    scene.add(floorMesh);

    // Procedural Contact Shadow Disc generator
    const makeShadowTexture = () => {
      const cv = document.createElement('canvas');
      cv.width = 256;
      cv.height = 256;
      const ctx = cv.getContext('2d')!;
      const grad = ctx.createRadialGradient(128, 128, 20, 128, 128, 120);
      grad.addColorStop(0, 'rgba(40, 55, 20, 0.5)');
      grad.addColorStop(0.5, 'rgba(40, 55, 20, 0.2)');
      grad.addColorStop(1, 'rgba(40, 55, 20, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 256, 256);
      const tex = new THREE.CanvasTexture(cv);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    };
    const shadowTex = makeShadowTexture();
    const shadowGeo = new THREE.PlaneGeometry(7, 7);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.5,
    });

    // 7. Composite Procedural 3-12 Part Models for Cloud Services (THREE.Group)
    // Shared PBR Materials
    const oliveGlossMat = new THREE.MeshStandardMaterial({
      color: 0x556b2f,
      roughness: 0.2,
      metalness: 0.8,
    });
    const oliveDrabMat = new THREE.MeshStandardMaterial({
      color: 0x6b8e23,
      roughness: 0.45,
      metalness: 0.4,
    });
    const whiteClayMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.35,
      metalness: 0.1,
    });
    const brushedSilverMat = new THREE.MeshStandardMaterial({
      color: 0xd8dfd2,
      roughness: 0.15,
      metalness: 0.9,
    });
    const amberAlertMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.2,
      metalness: 0.7,
      emissive: 0x92400e,
      emissiveIntensity: 0.6,
    });
    const redDegradedMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      roughness: 0.2,
      metalness: 0.6,
      emissive: 0x991b1b,
      emissiveIntensity: 0.8,
    });

    // Store node groups for animation and exploded view
    interface ServiceNodeInfo {
      id: string;
      name: string;
      group: THREE.Group;
      basePos: THREE.Vector3;
      explodedDir: THREE.Vector3;
      primaryMesh: THREE.Mesh;
      accentRing: THREE.Mesh;
      isDegraded: boolean;
    }
    const nodes: ServiceNodeInfo[] = [];

    // Helper: Build Central App Gateway Node (6 parts: Beveled Plinth, Core Cylinder, Data Rings, Antennae, Glass Dome, Core Emitter)
    const buildGatewayNode = (): ServiceNodeInfo => {
      const group = new THREE.Group();

      // 1. Base Plinth
      const baseGeo = new THREE.CylinderGeometry(2.4, 2.7, 0.6, 32);
      const baseMesh = new THREE.Mesh(baseGeo, whiteClayMat);
      baseMesh.position.y = 0.3;
      baseMesh.castShadow = true;
      group.add(baseMesh);

      // 2. Main Server Column
      const colGeo = new THREE.CylinderGeometry(1.9, 1.9, 2.2, 32);
      const colMesh = new THREE.Mesh(colGeo, oliveGlossMat);
      colMesh.position.y = 1.7;
      colMesh.castShadow = true;
      group.add(colMesh);

      // 3. Floating Telemetry Ring
      const ringGeo = new THREE.TorusGeometry(2.3, 0.12, 16, 64);
      const ringMesh = new THREE.Mesh(ringGeo, brushedSilverMat);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.y = 2.0;
      group.add(ringMesh);

      // 4. Indicator Crown
      const crownGeo = new THREE.CylinderGeometry(1.4, 1.8, 0.4, 24);
      const crownMesh = new THREE.Mesh(crownGeo, oliveDrabMat);
      crownMesh.position.y = 3.0;
      group.add(crownMesh);

      // 5. Glass Sensor Cap
      const domeGeo = new THREE.SphereGeometry(1.0, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2);
      const domeMesh = new THREE.Mesh(domeGeo, whiteClayMat);
      domeMesh.position.y = 3.2;
      group.add(domeMesh);

      // 6. Contact Shadow
      const shadow = new THREE.Mesh(shadowGeo, shadowMat);
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.y = 0.02;
      shadow.scale.set(1.2, 1.2, 1.2);
      group.add(shadow);

      group.position.set(0, 0, 0);
      scene.add(group);

      return {
        id: 'gateway',
        name: 'App Core Gateway (Your Backend)',
        group,
        basePos: new THREE.Vector3(0, 0, 0),
        explodedDir: new THREE.Vector3(0, 1, 0),
        primaryMesh: colMesh,
        accentRing: ringMesh,
        isDegraded: false,
      };
    };

    // Helper: Build Vendor Satellite Node (5 parts)
    const buildVendorNode = (
      id: string,
      name: string,
      pos: THREE.Vector3,
      isDegraded: boolean
    ): ServiceNodeInfo => {
      const group = new THREE.Group();

      // 1. Tiered Stepped Pedestal
      const baseGeo = new THREE.CylinderGeometry(1.4, 1.7, 0.4, 24);
      const baseMesh = new THREE.Mesh(baseGeo, whiteClayMat);
      baseMesh.position.y = 0.2;
      baseMesh.castShadow = true;
      group.add(baseMesh);

      // 2. Primary Cylinder Housing
      const bodyGeo = new THREE.CylinderGeometry(1.1, 1.1, 1.6, 24);
      const bodyMat = isDegraded ? redDegradedMat : oliveDrabMat;
      const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
      bodyMesh.position.y = 1.2;
      bodyMesh.castShadow = true;
      group.add(bodyMesh);

      // 3. Orbiting Status Gyro Ring
      const ringGeo = new THREE.TorusGeometry(1.5, 0.08, 16, 48);
      const ringMat = isDegraded ? amberAlertMat : brushedSilverMat;
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.y = 1.3;
      group.add(ringMesh);

      // 4. Accent Bevel / Dome
      const topGeo = new THREE.ConeGeometry(0.8, 0.7, 16);
      const topMesh = new THREE.Mesh(topGeo, whiteClayMat);
      topMesh.position.y = 2.3;
      group.add(topMesh);

      // 5. Contact Shadow
      const shadow = new THREE.Mesh(shadowGeo, shadowMat);
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.y = 0.02;
      group.add(shadow);

      group.position.copy(pos);
      scene.add(group);

      return {
        id,
        name,
        group,
        basePos: pos.clone(),
        explodedDir: pos.clone().normalize().add(new THREE.Vector3(0, 0.5, 0)),
        primaryMesh: bodyMesh,
        accentRing: ringMesh,
        isDegraded,
      };
    };

    // Create Service Nodes Topology
    const gatewayNode = buildGatewayNode();
    nodes.push(gatewayNode);

    const auth0Node = buildVendorNode('auth0', 'Auth0 Identity Cloud', new THREE.Vector3(-10, 0, -2), true);
    const stripeNode = buildVendorNode('stripe', 'Stripe Payment Gateway', new THREE.Vector3(10, 0, -2), true);
    const awsNode = buildVendorNode('aws', 'AWS S3 / RDS Cluster', new THREE.Vector3(-6, 0, 9), false);
    const openaiNode = buildVendorNode('openai', 'OpenAI Inference Engine', new THREE.Vector3(6, 0, 9), false);
    const cdnNode = buildVendorNode('cloudflare', 'Cloudflare Edge CDN', new THREE.Vector3(0, 0, -11), false);

    nodes.push(auth0Node, stripeNode, awsNode, openaiNode, cdnNode);

    // 8. Connective Bezier Tubes & Photon Signal Particles
    interface ConnectionLine {
      curve: THREE.QuadraticBezierCurve3;
      tubeMesh: THREE.Mesh;
      particles: THREE.Points;
      source: ServiceNodeInfo;
      target: ServiceNodeInfo;
      isDegraded: boolean;
    }
    const connections: ConnectionLine[] = [];

    const createConnection = (source: ServiceNodeInfo, target: ServiceNodeInfo, isDegraded: boolean) => {
      const p1 = source.basePos.clone().add(new THREE.Vector3(0, 1.8, 0));
      const p2 = target.basePos.clone().add(new THREE.Vector3(0, 1.8, 0));
      const mid = p1.clone().add(p2).multiplyScalar(0.5).add(new THREE.Vector3(0, 2.5, 0));

      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
      const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.06, 8, false);
      const tubeMat = new THREE.MeshStandardMaterial({
        color: isDegraded ? 0xd97706 : 0x87a93a,
        roughness: 0.3,
        metalness: 0.5,
        transparent: true,
        opacity: 0.7,
      });
      const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
      scene.add(tubeMesh);

      // Signal photon particles
      const particleCount = 18;
      const positions = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount; i++) {
        const pt = curve.getPoint(i / particleCount);
        positions[i * 3] = pt.x;
        positions[i * 3 + 1] = pt.y;
        positions[i * 3 + 2] = pt.z;
      }
      const pGeo = new THREE.BufferGeometry();
      pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const pMat = new THREE.PointsMaterial({
        color: isDegraded ? 0xef4444 : 0xa7c957,
        size: 0.35,
        transparent: true,
        opacity: 0.9,
      });
      const particles = new THREE.Points(pGeo, pMat);
      scene.add(particles);

      connections.push({ curve, tubeMesh, particles, source, target, isDegraded });
    };

    // Link Gateway to each satellite node
    createConnection(gatewayNode, auth0Node, true);
    createConnection(gatewayNode, stripeNode, true);
    createConnection(gatewayNode, awsNode, false);
    createConnection(gatewayNode, openaiNode, false);
    createConnection(gatewayNode, cdnNode, false);

    // 9. Resize Listener
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 10. Animation Loop with Exponential Damping & Zero GC
    let frameId = 0;
    const clock = new THREE.Clock();

    function tick() {
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();
      const speed = stateRef.current.particleSpeed;

      // Smooth camera position damping towards targetCamPos
      camera.position.x = THREE.MathUtils.damp(camera.position.x, stateRef.current.targetCamPos.x, 3.5, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, stateRef.current.targetCamPos.y, 3.5, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, stateRef.current.targetCamPos.z, 3.5, delta);

      controls.target.x = THREE.MathUtils.damp(controls.target.x, stateRef.current.targetLookAt.x, 3.5, delta);
      controls.target.y = THREE.MathUtils.damp(controls.target.y, stateRef.current.targetLookAt.y, 3.5, delta);
      controls.target.z = THREE.MathUtils.damp(controls.target.z, stateRef.current.targetLookAt.z, 3.5, delta);
      controls.update();

      // Rotate gyro rings & animate exploded view
      const explode = stateRef.current.explodedFactor;
      nodes.forEach((n) => {
        n.accentRing.rotation.z += 0.8 * delta;
        n.accentRing.rotation.y += 0.4 * delta;

        // Apply smooth exploded offset
        _targetPos.copy(n.basePos).addScaledVector(n.explodedDir, explode * 4);
        n.group.position.lerp(_targetPos, 0.1);
      });

      // Animate photon signal pulses along curves
      connections.forEach((conn, index) => {
        const positions = conn.particles.geometry.attributes.position.array as Float32Array;
        const count = positions.length / 3;
        for (let i = 0; i < count; i++) {
          const t = (elapsed * 0.4 * speed + i / count + index * 0.2) % 1;
          const pt = conn.curve.getPoint(t);
          positions[i * 3] = pt.x;
          positions[i * 3 + 1] = pt.y;
          positions[i * 3 + 2] = pt.z;
        }
        conn.particles.geometry.attributes.position.needsUpdate = true;
      });

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(tick);
    }

    tick();

    // 11. Cleanup
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      pmremGenerator.dispose();
      controls.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-[520px] rounded-3xl overflow-hidden clay-card border border-white/80 select-none">
      {/* 3D Canvas Mount Point */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Left Spec Badge */}
      <div className="absolute top-4 left-5 flex items-center gap-3 pointer-events-none">
        <div className="bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-sm border border-[#556B2F]/20 flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#6B8E23]" />
          <span className="text-xs font-bold text-[#3B4D14] tracking-wide">3D CLOUD TOPOLOGY MESH</span>
        </div>
        <div className="hidden sm:flex bg-white/80 px-3 py-1.5 rounded-full text-xs text-[#556B2F] border border-white shadow-sm font-medium">
          6 Nodes &bull; Realtime Latency Paths
        </div>
      </div>

      {/* Top Right Quick Presets */}
      <div className="absolute top-4 right-5 flex items-center gap-2">
        <button
          onClick={() => {
            setCameraView('orbit');
            setActiveNodeName('Global View');
          }}
          className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${
            cameraView === 'orbit' ? 'bg-[#556B2F] text-white shadow-md' : 'bg-white/90 text-[#3B4D14] hover:bg-white'
          }`}
        >
          Reset Orbit
        </button>
      </div>

      {/* Collapsible Bottom Control Dock (<=15% viewport footprint as mandated by Three.js skill) */}
      <div
        className={`absolute bottom-3 left-1/2 -translate-x-1/2 w-[94%] max-w-3xl transition-transform duration-300 z-10 ${
          isCollapsed ? 'translate-y-[82%]' : 'translate-y-0'
        }`}
      >
        <div className="flex justify-center -mb-2">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="bg-white/95 text-[#3B4D14] hover:text-[#556B2F] px-4 py-1 text-xs font-bold rounded-t-xl shadow-md border border-b-0 border-[#556B2F]/20 transition-all cursor-pointer flex items-center gap-1.5"
          >
            {isCollapsed ? '▴ Expand 3D Dock' : '▾ Collapse 3D Dock'}
          </button>
        </div>

        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-4 shadow-xl border border-white flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Camera View Buttons */}
          <div className="flex items-center gap-1.5">
            <span className="text-[#6B8E23] font-bold text-[11px] uppercase tracking-wider mr-1">Camera:</span>
            <button
              onClick={() => {
                setCameraView('gateway');
                setActiveNodeName('App Core Gateway');
                onSelectNode?.('gateway');
              }}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                cameraView === 'gateway' ? 'bg-[#556B2F] text-white' : 'bg-[#EDF0E6] text-[#3B4D14] hover:bg-white'
              }`}
            >
              Gateway
            </button>
            <button
              onClick={() => {
                setCameraView('auth0');
                setActiveNodeName('Auth0 Identity Node (Degraded)');
                onSelectNode?.('auth0');
              }}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                cameraView === 'auth0' ? 'bg-[#DC2626] text-white' : 'bg-[#FEE2E2] text-[#991B1B] hover:bg-white'
              }`}
            >
              Auth0 (Degraded)
            </button>
            <button
              onClick={() => {
                setCameraView('stripe');
                setActiveNodeName('Stripe Payment Gateway (Degraded)');
                onSelectNode?.('stripe');
              }}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                cameraView === 'stripe' ? 'bg-[#D97706] text-white' : 'bg-[#FEF3C7] text-[#92400E] hover:bg-white'
              }`}
            >
              Stripe (Latency)
            </button>
          </div>

          {/* Exploded View Slider */}
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-[#556B2F]" />
            <span className="text-[#4A5D29] font-medium">Explode Mesh:</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={explodedFactor}
              onChange={(e) => setExplodedFactor(parseFloat(e.target.value))}
              className="w-20 accent-[#556B2F] cursor-pointer"
            />
            <span className="text-[11px] font-mono text-[#556B2F] w-6">{Math.round(explodedFactor * 100)}%</span>
          </div>

          {/* Active Node Info */}
          <div className="hidden md:flex items-center gap-1.5 text-[11px] text-[#4A5D29] bg-[#F4F6F0] px-2.5 py-1 rounded-lg font-mono">
            <span className="w-2 h-2 rounded-full bg-[#556B2F]" />
            <span>Focused: {activeNodeName}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
