import { Injectable, NgZone, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { HDRLoader } from 'three/examples/jsm/loaders/HDRLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export type ConfigPart = 'body' | 'backplate' | 'camera_ring' | 'buttons' | 'antenna';
export type MetalFinish = 'gold' | 'platinum' | 'rose-gold' | 'color';
export type BackplateMaterial = 'matte-glass' | 'leather' | 'carbon';

const FINISH_PARAMS: Record<MetalFinish, { roughness: number; metalness: number; clearcoat: number; color: string }> = {
  gold:       { roughness: 0.08, metalness: 1.0, clearcoat: 0.5, color: '#D4AF37' },
  platinum:   { roughness: 0.05, metalness: 1.0, clearcoat: 0.7, color: '#E8E8E8' },
  'rose-gold':{ roughness: 0.08, metalness: 1.0, clearcoat: 0.5, color: '#B76E79' },
  color:      { roughness: 0.55, metalness: 0.0, clearcoat: 0.2, color: '#0a0a0a' },
};

@Injectable()
export class ThreeSceneService {
  private readonly zone = inject(NgZone);
  private readonly platformId = inject(PLATFORM_ID);

  private renderer?: THREE.WebGLRenderer;
  private scene?: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private controls?: OrbitControls;
  private animFrameId?: number;
  private resizeObserver?: ResizeObserver;
  private meshes = new Map<ConfigPart, THREE.Mesh[]>();
  private logoMesh?: THREE.Mesh;

  init(canvas: HTMLCanvasElement): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.zone.runOutsideAngular(() => {
      this.setupRenderer(canvas);
      this.setupScene();
      this.setupCamera(canvas);
      this.setupLights();
      this.setupControls(canvas);
      this.loadEnvironment();
      this.loadModel();
      this.startRenderLoop();
    });

    this.setupResizeObserver(canvas);
  }

  private setupRenderer(canvas: HTMLCanvasElement): void {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
  }

  private setupScene(): void {
    this.scene = new THREE.Scene();
  }

  private setupCamera(canvas: HTMLCanvasElement): void {
    const aspect = canvas.clientWidth / canvas.clientHeight || 1;
    this.camera = new THREE.PerspectiveCamera(40, aspect, 0.01, 100);
    this.camera.position.set(0, 0, 2.5);
  }

  private setupLights(): void {
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene!.add(ambient);

    const key = new THREE.DirectionalLight(0xffffff, 2);
    key.position.set(-2, 3, 4);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    this.scene!.add(key);

    const fill = new THREE.DirectionalLight(0xffffff, 0.5);
    fill.position.set(3, 1, -2);
    this.scene!.add(fill);
  }

  private setupControls(canvas: HTMLCanvasElement): void {
    this.controls = new OrbitControls(this.camera!, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.6;
    this.controls.minPolarAngle = Math.PI / 4;
    this.controls.maxPolarAngle = (3 * Math.PI) / 4;
    this.controls.minDistance = 1.0;
    this.controls.maxDistance = 5;
    this.controls.enablePan = false;
  }

  private loadEnvironment(): void {
    const pmremGen = new THREE.PMREMGenerator(this.renderer!);
    pmremGen.compileEquirectangularShader();

    new HDRLoader().load(
      '/textures/hdri/studio.hdr',
      (texture) => {
        const envMap = pmremGen.fromEquirectangular(texture).texture;
        this.scene!.environment = envMap;
        texture.dispose();
        pmremGen.dispose();
      },
      undefined,
      () => {
        // No HDRI file — use procedural studio environment so metals reflect correctly
        const env = pmremGen.fromScene(new RoomEnvironment()).texture;
        this.scene!.environment = env;
        pmremGen.dispose();
      },
    );
  }

  private getConfigPart(mesh: THREE.Mesh): ConfigPart | null {
    const n = mesh.name.trim().toLowerCase();
    const p = (mesh.parent?.name ?? '').toLowerCase();

    if (n.startsWith('button')) return 'buttons';
    if (p === 'camera_control') return 'antenna';
    if (p === 'body') {
      const mat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
      if ((mat?.name ?? '').toLowerCase().includes('plastic')) return 'antenna';
      return 'body';
    }
    if (p === 'back_glass') return 'backplate';
    if (p.startsWith('back_camera_module')) {
      // Skip standalone lens objects and any glass material slots
      if (n.startsWith('lens')) return null;
      const mat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
      if ((mat?.name ?? '').toLowerCase().includes('glass')) return null;
      return 'camera_ring';
    }

    return null;
  }

  private loadModel(): void {
    new GLTFLoader().load(
      '/models/Phone 17 Pro Max Simple.glb',
      (gltf) => {
        // Scale model to a consistent target height regardless of source units
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        if (maxDim > 0) {
          const scale = 1.4 / maxDim; // ← adjust this value to change model size
          gltf.scene.scale.setScalar(scale);
        }
        // Re-centre at origin after scaling
        const centredBox = new THREE.Box3().setFromObject(gltf.scene);
        const centre = new THREE.Vector3();
        centredBox.getCenter(centre);
        gltf.scene.position.sub(centre);

        gltf.scene.traverse((child) => {
          if (!(child instanceof THREE.Mesh)) return;
          child.castShadow = true;
          child.receiveShadow = true;
          const part = this.getConfigPart(child);
          if (part) {
            const existing = this.meshes.get(part) ?? [];
            existing.push(child);
            this.meshes.set(part, existing);
          }
        });
        (['body', 'backplate', 'camera_ring', 'buttons', 'antenna'] as ConfigPart[]).forEach((part) => {
          if (this.meshes.has(part)) this.applyDefaultMaterial(part);
        });
        this.scene!.add(gltf.scene);
        this.loadLogo(gltf.scene);
      },
      undefined,
      () => this.addPlaceholder(),
    );
  }

  private addPlaceholder(): void {
    const group = new THREE.Group();

    const bodyGeo = new THREE.BoxGeometry(0.75, 1.55, 0.08);
    const bodyMat = new THREE.MeshPhysicalMaterial({ color: '#E8E8E8', metalness: 1, roughness: 0.15, clearcoat: 0.4 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.castShadow = true;
    this.meshes.set('body', [body]);
    group.add(body);

    const backGeo = new THREE.BoxGeometry(0.72, 1.52, 0.01);
    const backMat = new THREE.MeshPhysicalMaterial({ color: '#1a1a1a', transmission: 0.3, roughness: 0.5, thickness: 0.5 });
    const back = new THREE.Mesh(backGeo, backMat);
    back.position.z = -0.044;
    back.castShadow = true;
    this.meshes.set('backplate', [back]);
    group.add(back);

    const ringGeo = new THREE.TorusGeometry(0.12, 0.018, 16, 64);
    const ringMat = new THREE.MeshPhysicalMaterial({ color: '#E8E8E8', metalness: 1, roughness: 0.15, clearcoat: 0.4 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.set(0.18, 0.52, -0.06);
    ring.rotation.x = Math.PI / 2;
    ring.castShadow = true;
    this.meshes.set('camera_ring', [ring]);
    group.add(ring);

    const btnGeo = new THREE.BoxGeometry(0.015, 0.1, 0.025);
    const btnMat = new THREE.MeshPhysicalMaterial({ color: '#E8E8E8', metalness: 1, roughness: 0.15 });
    const btn = new THREE.Mesh(btnGeo, btnMat);
    btn.position.set(0.385, 0.1, 0);
    btn.castShadow = true;
    this.meshes.set('buttons', [btn]);
    group.add(btn);

    this.scene!.add(group);
  }

  private applyDefaultMaterial(part: ConfigPart): void {
    if (part === 'backplate') {
      this.setFinish('backplate', 'platinum');
    } else if (part === 'antenna') {
      this.setAntennaColor('#4A4A4A');
    } else {
      this.setFinish(part, 'platinum');
    }
  }

  setAntennaColor(hex: string): void {
    const meshes = this.meshes.get('antenna');
    if (!meshes?.length) return;
    for (const mesh of meshes) {
      (mesh.material as THREE.Material)?.dispose?.();
      mesh.material = new THREE.MeshPhysicalMaterial({
        color: hex,
        roughness: 0.65,
        metalness: 0.0,
        clearcoat: 0.1,
      });
    }
  }

  setFinish(part: ConfigPart, finish: MetalFinish, color?: string): void {
    const meshes = this.meshes.get(part);
    if (!meshes?.length) return;

    const params = FINISH_PARAMS[finish];
    const resolvedColor = finish === 'color' && color ? color : params.color;

    for (const mesh of meshes) {
      (mesh.material as THREE.Material)?.dispose?.();
      mesh.material = new THREE.MeshPhysicalMaterial({
        color: resolvedColor,
        roughness: params.roughness,
        metalness: params.metalness,
        clearcoat: params.clearcoat,
      });
    }
  }

  setColor(part: ConfigPart, hex: string): void {
    const meshes = this.meshes.get(part);
    if (!meshes) return;
    for (const mesh of meshes) {
      const mat = mesh.material as THREE.MeshPhysicalMaterial;
      if (mat) {
        mat.color.set(hex);
        mat.needsUpdate = true;
      }
    }
  }

  setBackplateMaterial(type: BackplateMaterial, color?: string): void {
    const meshes = this.meshes.get('backplate');
    if (!meshes?.length) return;

    for (const mesh of meshes) {
      (mesh.material as THREE.Material)?.dispose?.();

      switch (type) {
        case 'matte-glass':
          mesh.material = new THREE.MeshPhysicalMaterial({
            color: color ?? '#111111',
            transmission: 0.35,
            roughness: 0.45,
            metalness: 0,
            thickness: 0.5,
            ior: 1.5,
          });
          break;

        case 'leather': {
          const mat = new THREE.MeshPhysicalMaterial({
            color: color ?? '#ffffff',
            roughness: 0.85,
            metalness: 0,
          });
          this.applyLeatherTextures(mat);
          mesh.material = mat;
          break;
        }

        case 'carbon': {
          const mat = new THREE.MeshPhysicalMaterial({
            color: color ?? '#111111',
            roughness: 0.3,
            metalness: 0.6,
            clearcoat: 0.8,
            clearcoatRoughness: 0.1,
          });
          this.applyCarbonTextures(mat);
          mesh.material = mat;
          break;
        }
      }
    }
  }

  private applyLeatherTextures(mat: THREE.MeshPhysicalMaterial): void {
    const loader = new THREE.TextureLoader();
    loader.load('/textures/leather/diffuse.jpg', (t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(2, 2);
      mat.map = t;
      mat.needsUpdate = true;
    });
    loader.load('/textures/leather/normal.jpg', (t) => {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(2, 2);
      mat.normalMap = t;
      mat.normalScale.set(1.5, 1.5);
      mat.needsUpdate = true;
    });
    loader.load('/textures/leather/roughness.jpg', (t) => {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(2, 2);
      mat.roughnessMap = t;
      mat.needsUpdate = true;
    });
  }

  private applyCarbonTextures(mat: THREE.MeshPhysicalMaterial): void {
    const loader = new THREE.TextureLoader();
    loader.load('/textures/carbon/diffuse.jpg', (t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(4, 4);
      mat.map = t;
      mat.needsUpdate = true;
    });
    loader.load('/textures/carbon/normal.jpg', (t) => {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(4, 4);
      mat.normalMap = t;
      mat.normalScale.set(2, 2);
      mat.needsUpdate = true;
    });
  }

  private setupResizeObserver(canvas: HTMLCanvasElement): void {
    this.resizeObserver = new ResizeObserver(() => {
      if (!this.renderer || !this.camera) return;
      const container = canvas.parentElement ?? canvas;
      const w = container.clientWidth;
      const h = container.clientHeight;
      this.renderer.setSize(w, h);
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
    });
    this.resizeObserver.observe(canvas.parentElement ?? canvas);
  }

  private startRenderLoop(): void {
    const tick = () => {
      this.controls?.update();
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
      this.animFrameId = requestAnimationFrame(tick);
    };
    this.animFrameId = requestAnimationFrame(tick);
  }

  stopAutoRotate(): void {
    if (this.controls) this.controls.autoRotate = false;
  }

  startAutoRotate(): void {
    if (this.controls) this.controls.autoRotate = true;
  }

  private loadLogo(root: THREE.Object3D): void {
    const backGlass = root.getObjectByName('Back_Glass');
    if (!backGlass) return;

    root.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(backGlass);
    const center = new THREE.Vector3();
    box.getCenter(center);

    new THREE.TextureLoader().load(
      '/textures/logo/logo.png',
      (texture) => {
        const aspect = texture.image.width / texture.image.height;
        const logoWidth = 0.125;  // ← adjust to resize the logo
        const logoHeight = logoWidth / aspect;

        const mat = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          depthWrite: false,
          alphaTest: 0.01,
        });
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(logoWidth, logoHeight), mat);

        // Position near the bottom of Back_Glass with a comfortable margin
        const glassHeight = box.max.y - box.min.y;
        const logoY = box.min.y + glassHeight * 0.115; // ← % from bottom (0 = extreme bottom, 0.5 = centre)
        mesh.position.set(center.x, logoY, box.min.z - 0.002);
        // Rotate 180° so the logo faces outward from the back of the phone
        mesh.rotation.y = Math.PI;

        this.logoMesh = mesh;
        this.scene!.add(mesh);
      },
      undefined,
      () => { /* logo.png not present yet — silently skip */ },
    );
  }

  destroy(): void {
    if (this.animFrameId !== undefined) cancelAnimationFrame(this.animFrameId);
    this.resizeObserver?.disconnect();
    this.controls?.dispose();
    this.renderer?.dispose();
    this.logoMesh?.geometry.dispose();
    (this.logoMesh?.material as THREE.Material)?.dispose();
    this.logoMesh = undefined;
    this.meshes.clear();
    this.scene = undefined;
    this.renderer = undefined;
    this.camera = undefined;
    this.controls = undefined;
  }
}
