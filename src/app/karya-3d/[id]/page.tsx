"use client";

import React, { useEffect, useRef, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import {
  ArrowLeft,
  RotateCcw,
  Play,
  Pause,
  Layers,
  Sparkles,
  Box,
  RefreshCw,
  Compass,
  Sliders,
  Maximize2,
  Minimize2,
  Camera,
  Eye,
  EyeOff,
  Sun,
  Palette,
  Check,
  Package,
  Wrench,
  FileText,
  Share2,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Upload,
  FileUp,
  FileCode,
  FolderOpen,
  AlertCircle,
  Info,
  CheckCircle2,
  Cpu,
  HelpCircle,
} from "lucide-react";
import { initialProjects, ProjectItem } from "@/lib/mock-data";

type ShadingMode = "material" | "wireframe" | "clay" | "matcap" | "xray";
type LightingPreset = "dark-mint" | "cyber-neon" | "clean-studio" | "warm-sunset";
type CameraPreset = "perspective" | "front" | "top" | "side" | "iso";

interface PartInfo {
  id: string;
  name: string;
  description: string;
  visible: boolean;
}

export default function Karya3DReviewPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const router = useRouter();
  // Unwrap Next.js 15/16 params
  const resolvedParams = "then" in params ? use(params) : params;
  const projectId = parseInt(resolvedParams.id, 10);

  // Find project or fallback to first 3D project
  const project =
    initialProjects.find((p) => p.id === projectId) ||
    initialProjects.find((p) => p.categorySlug === "3d-modeling") ||
    initialProjects[3];

  const modelKey = project.modelKey || (project.id === 6 ? "cyber-helmet" : project.id === 7 ? "beverage-can" : "packaging-box");

  // Canvas and Three.js references
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelPartsRef = useRef<Record<string, THREE.Object3D>>({});
  const animFrameRef = useRef<number | null>(null);
  const lightsRef = useRef<{
    ambient?: THREE.AmbientLight;
    main?: THREE.DirectionalLight;
    rim?: THREE.DirectionalLight;
    point?: THREE.PointLight;
  }>({});

  // Interactive States
  const [explodeProgress, setExplodeProgress] = useState<number>(0);
  const [isAutoExploding, setIsAutoExploding] = useState<boolean>(false);
  const [shadingMode, setShadingMode] = useState<ShadingMode>("material");
  const [lightingPreset, setLightingPreset] = useState<LightingPreset>("dark-mint");
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [rotateSpeed, setRotateSpeed] = useState<number>(1.5);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"concept" | "specs" | "other">("concept");
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [partsList, setPartsList] = useState<PartInfo[]>([]);
  const [activePartId, setActivePartId] = useState<string | null>(null);
  const [polyStats, setPolyStats] = useState({ tris: 0, verts: 0 });

  // Custom 3D Model Import & Test States (Blender, Rhino, SketchUp, CAD)
  const [loadedCustomModel, setLoadedCustomModel] = useState<{
    name: string;
    format: string;
    size?: string;
  } | null>(null);
  const [isLoadingFile, setIsLoadingFile] = useState<boolean>(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const customModelGroupRef = useRef<THREE.Group | null>(null);
  const defaultModelGroupRef = useRef<THREE.Group | null>(null);
  const defaultPartsListRef = useRef<PartInfo[]>([]);
  const defaultPolyStatsRef = useRef<{ tris: number; verts: number }>({ tris: 0, verts: 0 });

  // Target explode value for smooth animation
  const targetExplodeRef = useRef<number>(0);
  const currentExplodeRef = useRef<number>(0);

  // Other 3D projects for quick navigation
  const other3DProjects = initialProjects.filter(
    (p) => p.categorySlug === "3d-modeling" && p.id !== project.id
  );

  // Setup Three.js Scene
  useEffect(() => {
    const mount = canvasMountRef.current;
    if (!mount) return;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060e0a);
    scene.fog = new THREE.FogExp2(0x060e0a, 0.025);
    sceneRef.current = scene;

    // 2. Camera
    const width = mount.clientWidth || 800;
    const height = mount.clientHeight || 520;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(4.5, 3.2, 6.2);
    cameraRef.current = camera;

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    mount.appendChild(renderer.domElement);

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = rotateSpeed;
    controls.maxDistance = 18;
    controls.minDistance = 2.0;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // 5. Studio Ground Grid & Shadow Plane
    const grid = new THREE.GridHelper(20, 20, 0x1f4e39, 0x0f291e);
    grid.position.y = -1.6;
    scene.add(grid);

    const shadowGeo = new THREE.PlaneGeometry(16, 16);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.35 });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -1.59;
    shadowMesh.receiveShadow = true;
    scene.add(shadowMesh);

    // 6. Lights
    const ambientLight = new THREE.AmbientLight(0x0b2419, 2.5);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0x34d399, 4.0);
    mainLight.position.set(6, 8, 6);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    scene.add(mainLight);

    const rimLight = new THREE.DirectionalLight(0x22d3ee, 3.0);
    rimLight.position.set(-6, -2, -5);
    scene.add(rimLight);

    const pointLight = new THREE.PointLight(0x10b981, 6, 15);
    pointLight.position.set(0, 2.5, 0);
    scene.add(pointLight);

    lightsRef.current = {
      ambient: ambientLight,
      main: mainLight,
      rim: rimLight,
      point: pointLight,
    };

    // 7. Ambient Particle Stars
    const starCount = 450;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 30;
      starPos[i + 1] = Math.random() * 20 - 2;
      starPos[i + 2] = (Math.random() - 0.5) * 30;
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0x34d399,
      size: 0.05,
      transparent: true,
      opacity: 0.4,
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // 8. Build 3D Models with Explode Capability
    const partsMap: Record<string, THREE.Object3D> = {};
    const rootGroup = new THREE.Group();
    rootGroup.name = "default_model_group";
    scene.add(rootGroup);
    defaultModelGroupRef.current = rootGroup;

    const customGroup = new THREE.Group();
    customGroup.name = "custom_model_group";
    scene.add(customGroup);
    customModelGroupRef.current = customGroup;

    let totalTris = 0;
    let totalVerts = 0;

    const registerMesh = (
      name: string,
      geo: THREE.BufferGeometry,
      mat: THREE.Material | THREE.Material[],
      parent: THREE.Object3D
    ) => {
      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.name = name;
      parent.add(mesh);
      totalTris += geo.index ? geo.index.count / 3 : geo.attributes.position.count / 3;
      totalVerts += geo.attributes.position.count;
      return mesh;
    };

    if (modelKey === "packaging-box") {
      // ----------------------------------------------------
      // MODEL 1: LUXURY PACKAGING BOX & PERFUME BOTTLE
      // ----------------------------------------------------
      const boxMat = new THREE.MeshStandardMaterial({
        color: 0x09261b,
        roughness: 0.35,
        metalness: 0.3,
      });
      const goldMat = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        roughness: 0.2,
        metalness: 0.85,
      });
      const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0x10b981,
        transmission: 0.88,
        opacity: 1,
        transparent: true,
        roughness: 0.1,
        ior: 1.52,
        thickness: 1.2,
      });
      const velvetMat = new THREE.MeshStandardMaterial({
        color: 0x051710,
        roughness: 0.9,
      });

      // Part 1: Main Box Body (Base)
      const baseGroup = new THREE.Group();
      baseGroup.name = "part_box_body";
      const baseGeo = new THREE.BoxGeometry(2.0, 2.4, 1.4);
      registerMesh("box_base", baseGeo, boxMat, baseGroup);
      rootGroup.add(baseGroup);
      partsMap["part_box_body"] = baseGroup;

      // Part 2: Top Lid (Opens & lifts up)
      const lidGroup = new THREE.Group();
      lidGroup.name = "part_box_lid";
      lidGroup.position.set(0, 1.25, 0);
      const lidGeo = new THREE.BoxGeometry(2.08, 0.7, 1.48);
      registerMesh("box_lid", lidGeo, boxMat, lidGroup);
      // Gold trim on lid
      const trimGeo = new THREE.BoxGeometry(2.1, 0.08, 1.5);
      registerMesh("lid_trim", trimGeo, goldMat, lidGroup);
      rootGroup.add(lidGroup);
      partsMap["part_box_lid"] = lidGroup;

      // Part 3: Left Tuck Flap (Folds out left)
      const leftFlapGroup = new THREE.Group();
      leftFlapGroup.name = "part_left_flap";
      leftFlapGroup.position.set(-1.0, 0, 0);
      const leftFlapGeo = new THREE.BoxGeometry(0.04, 2.2, 1.3);
      registerMesh("flap_l", leftFlapGeo, boxMat, leftFlapGroup);
      rootGroup.add(leftFlapGroup);
      partsMap["part_left_flap"] = leftFlapGroup;

      // Part 4: Right Tuck Flap (Folds out right)
      const rightFlapGroup = new THREE.Group();
      rightFlapGroup.name = "part_right_flap";
      rightFlapGroup.position.set(1.0, 0, 0);
      const rightFlapGeo = new THREE.BoxGeometry(0.04, 2.2, 1.3);
      registerMesh("flap_r", rightFlapGeo, boxMat, rightFlapGroup);
      rootGroup.add(rightFlapGroup);
      partsMap["part_right_flap"] = rightFlapGroup;

      // Part 5: Inner Velvet Tray / Mold
      const trayGroup = new THREE.Group();
      trayGroup.name = "part_inner_tray";
      trayGroup.position.set(0, -0.2, 0);
      const trayGeo = new THREE.BoxGeometry(1.85, 1.8, 1.25);
      registerMesh("inner_mold", trayGeo, velvetMat, trayGroup);
      rootGroup.add(trayGroup);
      partsMap["part_inner_tray"] = trayGroup;

      // Part 6: Luxury Perfume Bottle (Inside, rises up)
      const bottleGroup = new THREE.Group();
      bottleGroup.name = "part_perfume_bottle";
      bottleGroup.position.set(0, 0, 0);
      // Glass body
      const bottleGeo = new THREE.CylinderGeometry(0.5, 0.52, 1.4, 24);
      registerMesh("bottle_glass", bottleGeo, glassMat, bottleGroup);
      // Golden Cap
      const capGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.5, 20);
      capGeo.translate(0, 0.95, 0);
      registerMesh("bottle_cap", capGeo, goldMat, bottleGroup);
      // Gold collar
      const collarGeo = new THREE.TorusGeometry(0.28, 0.05, 16, 32);
      collarGeo.rotateX(Math.PI / 2);
      collarGeo.translate(0, 0.72, 0);
      registerMesh("bottle_collar", collarGeo, goldMat, bottleGroup);
      rootGroup.add(bottleGroup);
      partsMap["part_perfume_bottle"] = bottleGroup;

      setPartsList([
        { id: "part_box_lid", name: "Tutup Box (Top Lid)", description: "Tutup atas kemasan dengan aksen spot UV gold foil", visible: true },
        { id: "part_left_flap", name: "Flap Lipatan Kiri", description: "Sayap lipat samping karton 360gsm", visible: true },
        { id: "part_right_flap", name: "Flap Lipatan Kanan", description: "Sayap pengunci samping dengan garis lipat dieline", visible: true },
        { id: "part_box_body", name: "Badan Kemasan Utama", description: "Wadah luar box berlapis matte soft-touch", visible: true },
        { id: "part_inner_tray", name: "Tray Beludru Dalam", description: "Bantalan pelindung produk interior", visible: true },
        { id: "part_perfume_bottle", name: "Botol Parfum / Produk", description: "Botol kaca kristal dengan cap emas elegan", visible: true },
      ]);
    } else if (modelKey === "cyber-helmet") {
      // ----------------------------------------------------
      // MODEL 2: CYBERNETIC HELMET & VISOR RIG
      // ----------------------------------------------------
      const armorMat = new THREE.MeshStandardMaterial({
        color: 0x0a1e16,
        roughness: 0.28,
        metalness: 0.75,
      });
      const neonVisorMat = new THREE.MeshPhysicalMaterial({
        color: 0x06b6d4,
        transmission: 0.7,
        roughness: 0.15,
        transparent: true,
        emissive: 0x0891b2,
        emissiveIntensity: 0.4,
      });
      const titaniumMat = new THREE.MeshStandardMaterial({
        color: 0x224c3a,
        roughness: 0.4,
        metalness: 0.85,
      });
      const glowCoreMat = new THREE.MeshBasicMaterial({
        color: 0x34d399,
        wireframe: true,
      });

      // 1. Outer Dome Shell
      const domeGroup = new THREE.Group();
      domeGroup.name = "part_helmet_dome";
      const domeGeo = new THREE.SphereGeometry(1.4, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.55);
      registerMesh("dome", domeGeo, armorMat, domeGroup);
      rootGroup.add(domeGroup);
      partsMap["part_helmet_dome"] = domeGroup;

      // 2. Optical Visor (Moves forward +Z)
      const visorGroup = new THREE.Group();
      visorGroup.name = "part_helmet_visor";
      visorGroup.position.set(0, 0.1, 0.45);
      const visorGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.65, 32, 1, false, -Math.PI * 0.45, Math.PI * 0.9);
      registerMesh("visor", visorGeo, neonVisorMat, visorGroup);
      rootGroup.add(visorGroup);
      partsMap["part_helmet_visor"] = visorGroup;

      // 3. Chin Guard (Moves down -Y and forward +Z)
      const chinGroup = new THREE.Group();
      chinGroup.name = "part_helmet_chin";
      chinGroup.position.set(0, -0.85, 0.4);
      const chinGeo = new THREE.BoxGeometry(1.5, 0.7, 1.1);
      registerMesh("chin", chinGeo, armorMat, chinGroup);
      rootGroup.add(chinGroup);
      partsMap["part_helmet_chin"] = chinGroup;

      // 4. Ear Armor Left
      const earLGroup = new THREE.Group();
      earLGroup.name = "part_helmet_ear_l";
      earLGroup.position.set(-1.35, 0, 0);
      const earLGeo = new THREE.CylinderGeometry(0.4, 0.48, 0.35, 18);
      earLGeo.rotateZ(Math.PI / 2);
      registerMesh("ear_l", earLGeo, titaniumMat, earLGroup);
      rootGroup.add(earLGroup);
      partsMap["part_helmet_ear_l"] = earLGroup;

      // 5. Ear Armor Right
      const earRGroup = new THREE.Group();
      earRGroup.name = "part_helmet_ear_r";
      earRGroup.position.set(1.35, 0, 0);
      const earRGeo = new THREE.CylinderGeometry(0.4, 0.48, 0.35, 18);
      earRGeo.rotateZ(Math.PI / 2);
      registerMesh("ear_r", earRGeo, titaniumMat, earRGroup);
      rootGroup.add(earRGroup);
      partsMap["part_helmet_ear_r"] = earRGroup;

      // 6. Internal Computing Cyber Core
      const coreGroup = new THREE.Group();
      coreGroup.name = "part_helmet_core";
      const coreGeo = new THREE.IcosahedronGeometry(0.7, 1);
      registerMesh("cyber_core", coreGeo, glowCoreMat, coreGroup);
      rootGroup.add(coreGroup);
      partsMap["part_helmet_core"] = coreGroup;

      setPartsList([
        { id: "part_helmet_dome", name: "Tempurung Helm Luar", description: "Armor kubah serat karbon pelindung kepala", visible: true },
        { id: "part_helmet_visor", name: "Visor Optik HUD", description: "Kaca visor magnetik dengan proyeksi HUD neon", visible: true },
        { id: "part_helmet_chin", name: "Pelindung Dagu (Chin Guard)", description: "Pelat pelindung rahang bawah", visible: true },
        { id: "part_helmet_ear_l", name: "Modul Audio Kiri", description: "Pod komunikasi dan peredam bising kiri", visible: true },
        { id: "part_helmet_ear_r", name: "Modul Audio Kanan", description: "Pod sensor akustik dan antena kanan", visible: true },
        { id: "part_helmet_core", name: "Inti Komputasi Sibernetik", description: "Unit pemrosesan internal holografik", visible: true },
      ]);
    } else {
      // ----------------------------------------------------
      // MODEL 3: MINIMALIST BEVERAGE CAN PACKAGING
      // ----------------------------------------------------
      const aluminiumMat = new THREE.MeshStandardMaterial({
        color: 0xd1d5db,
        roughness: 0.25,
        metalness: 0.9,
      });
      const labelMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        roughness: 0.35,
        metalness: 0.15,
      });
      const liquidMat = new THREE.MeshStandardMaterial({
        color: 0x34d399,
        roughness: 0.1,
        emissive: 0x059669,
        emissiveIntensity: 0.35,
      });

      // 1. Can Base Body
      const canBodyGroup = new THREE.Group();
      canBodyGroup.name = "part_can_body";
      const canGeo = new THREE.CylinderGeometry(0.9, 0.85, 2.6, 36);
      registerMesh("can_body", canGeo, aluminiumMat, canBodyGroup);
      rootGroup.add(canBodyGroup);
      partsMap["part_can_body"] = canBodyGroup;

      // 2. Can Lid (Separates up)
      const canLidGroup = new THREE.Group();
      canLidGroup.name = "part_can_lid";
      canLidGroup.position.set(0, 1.32, 0);
      const lidGeo = new THREE.CylinderGeometry(0.88, 0.9, 0.1, 36);
      registerMesh("can_lid", lidGeo, aluminiumMat, canLidGroup);
      rootGroup.add(canLidGroup);
      partsMap["part_can_lid"] = canLidGroup;

      // 3. Pull Tab (Separates further up and tilts)
      const tabGroup = new THREE.Group();
      tabGroup.name = "part_can_tab";
      tabGroup.position.set(0, 1.4, 0.1);
      const tabGeo = new THREE.BoxGeometry(0.3, 0.04, 0.55);
      registerMesh("can_tab", tabGeo, aluminiumMat, tabGroup);
      rootGroup.add(tabGroup);
      partsMap["part_can_tab"] = tabGroup;

      // 4. Cylindrical Label Sleeve (Expands outward radially)
      const labelGroup = new THREE.Group();
      labelGroup.name = "part_can_label";
      const labelGeo = new THREE.CylinderGeometry(0.92, 0.92, 2.2, 36, 1, true);
      registerMesh("can_label", labelGeo, labelMat, labelGroup);
      rootGroup.add(labelGroup);
      partsMap["part_can_label"] = labelGroup;

      // 5. Liquid Core
      const liquidGroup = new THREE.Group();
      liquidGroup.name = "part_can_liquid";
      const liquidGeo = new THREE.CylinderGeometry(0.8, 0.8, 2.3, 24);
      registerMesh("liquid_core", liquidGeo, liquidMat, liquidGroup);
      rootGroup.add(liquidGroup);
      partsMap["part_can_liquid"] = liquidGroup;

      setPartsList([
        { id: "part_can_tab", name: "Pull Tab Pembuka", description: "Cincin pembuka kaleng aluminium timbul", visible: true },
        { id: "part_can_lid", name: "Tutup Kaleng Atas", description: "Penutup atas dengan skor pembuka", visible: true },
        { id: "part_can_label", name: "Sleeve Label 360°", description: "Label desain kemasan cetak foil dinamis", visible: true },
        { id: "part_can_body", name: "Badan Aluminium Kaleng", description: "Silinder primer logam daur ulang 330ml", visible: true },
        { id: "part_can_liquid", name: "Cairan Minuman Organik", description: "Isi produk bio-energy mint berkilau", visible: true },
      ]);
    }

    modelPartsRef.current = partsMap;
    const initialStats = { tris: Math.round(totalTris), verts: totalVerts };
    setPolyStats(initialStats);
    defaultPolyStatsRef.current = initialStats;

    if (modelKey === "packaging-box") {
      defaultPartsListRef.current = [
        { id: "part_box_lid", name: "Tutup Box Atas", description: "Bagian tutup kemasan dengan emboss foil emas", visible: true },
        { id: "part_left_flap", name: "Flap Lipatan Kiri", description: "Sayap pengunci samping dengan garis lipat dieline", visible: true },
        { id: "part_right_flap", name: "Flap Lipatan Kanan", description: "Sayap pengunci samping dengan garis lipat dieline", visible: true },
        { id: "part_box_body", name: "Badan Kemasan Utama", description: "Wadah luar box berlapis matte soft-touch", visible: true },
        { id: "part_inner_tray", name: "Tray Beludru Dalam", description: "Bantalan pelindung produk interior", visible: true },
        { id: "part_perfume_bottle", name: "Botol Parfum / Produk", description: "Botol kaca kristal dengan cap emas elegan", visible: true },
      ];
    } else if (modelKey === "cyber-helmet") {
      defaultPartsListRef.current = [
        { id: "part_helmet_dome", name: "Tempurung Helm Luar", description: "Armor kubah serat karbon pelindung kepala", visible: true },
        { id: "part_helmet_visor", name: "Visor Optik HUD", description: "Kaca visor magnetik dengan proyeksi HUD neon", visible: true },
        { id: "part_helmet_chin", name: "Pelindung Dagu (Chin Guard)", description: "Pelat pelindung rahang bawah", visible: true },
        { id: "part_helmet_ear_l", name: "Modul Audio Kiri", description: "Pod komunikasi dan peredam bising kiri", visible: true },
        { id: "part_helmet_ear_r", name: "Modul Audio Kanan", description: "Pod sensor akustik dan antena kanan", visible: true },
        { id: "part_helmet_core", name: "Inti Komputasi Sibernetik", description: "Unit pemrosesan internal holografik", visible: true },
      ];
    } else {
      defaultPartsListRef.current = [
        { id: "part_can_tab", name: "Pull Tab Pembuka", description: "Cincin pembuka kaleng aluminium timbul", visible: true },
        { id: "part_can_lid", name: "Tutup Kaleng Atas", description: "Penutup atas dengan skor pembuka", visible: true },
        { id: "part_can_label", name: "Sleeve Label 360°", description: "Label desain kemasan cetak foil dinamis", visible: true },
        { id: "part_can_body", name: "Badan Aluminium Kaleng", description: "Silinder primer logam daur ulang 330ml", visible: true },
        { id: "part_can_liquid", name: "Cairan Minuman Organik", description: "Isi produk bio-energy mint berkilau", visible: true },
      ];
    }

    // 9. Animation & Explode Render Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Smooth interpolation of explode progress
      const target = targetExplodeRef.current;
      const current = currentExplodeRef.current;
      const step = (target - current) * 0.12;
      currentExplodeRef.current += step;
      const p = currentExplodeRef.current;

      // Apply Explode Physics to Parts
      if (modelKey === "packaging-box") {
        if (partsMap["part_box_lid"]) {
          partsMap["part_box_lid"].position.y = 1.25 + p * 2.2;
          partsMap["part_box_lid"].rotation.x = -p * 0.65;
        }
        if (partsMap["part_left_flap"]) {
          partsMap["part_left_flap"].position.x = -1.0 - p * 1.6;
          partsMap["part_left_flap"].rotation.z = p * 0.55;
        }
        if (partsMap["part_right_flap"]) {
          partsMap["part_right_flap"].position.x = 1.0 + p * 1.6;
          partsMap["part_right_flap"].rotation.z = -p * 0.55;
        }
        if (partsMap["part_box_body"]) {
          partsMap["part_box_body"].position.y = -p * 0.45;
        }
        if (partsMap["part_inner_tray"]) {
          partsMap["part_inner_tray"].position.y = -0.2 + p * 0.6;
        }
        if (partsMap["part_perfume_bottle"]) {
          partsMap["part_perfume_bottle"].position.y = p * 2.8;
          partsMap["part_perfume_bottle"].rotation.y += delta * 0.7;
        }
      } else if (modelKey === "cyber-helmet") {
        if (partsMap["part_helmet_dome"]) {
          partsMap["part_helmet_dome"].position.y = p * 2.0;
        }
        if (partsMap["part_helmet_visor"]) {
          partsMap["part_helmet_visor"].position.z = 0.45 + p * 2.2;
          partsMap["part_helmet_visor"].position.y = 0.1 + p * 0.5;
        }
        if (partsMap["part_helmet_chin"]) {
          partsMap["part_helmet_chin"].position.y = -0.85 - p * 1.8;
          partsMap["part_helmet_chin"].position.z = 0.4 + p * 1.2;
        }
        if (partsMap["part_helmet_ear_l"]) {
          partsMap["part_helmet_ear_l"].position.x = -1.35 - p * 2.0;
        }
        if (partsMap["part_helmet_ear_r"]) {
          partsMap["part_helmet_ear_r"].position.x = 1.35 + p * 2.0;
        }
        if (partsMap["part_helmet_core"]) {
          partsMap["part_helmet_core"].rotation.y += delta * 1.2;
          partsMap["part_helmet_core"].rotation.x += delta * 0.6;
        }
      } else {
        // beverage-can
        if (partsMap["part_can_lid"]) {
          partsMap["part_can_lid"].position.y = 1.32 + p * 1.8;
        }
        if (partsMap["part_can_tab"]) {
          partsMap["part_can_tab"].position.y = 1.4 + p * 2.9;
          partsMap["part_can_tab"].rotation.x = -p * 0.6;
        }
        if (partsMap["part_can_label"]) {
          const scale = 1 + p * 0.75;
          partsMap["part_can_label"].scale.set(scale, 1, scale);
        }
        if (partsMap["part_can_body"]) {
          partsMap["part_can_body"].position.y = -p * 0.5;
        }
        if (partsMap["part_can_liquid"]) {
          partsMap["part_can_liquid"].rotation.y += delta * 0.8;
        }
      }

      // If custom uploaded model is active, animate its parts
      if (
        customModelGroupRef.current &&
        customModelGroupRef.current.visible &&
        customModelGroupRef.current.children.length > 0
      ) {
        customModelGroupRef.current.children.forEach((child, idx) => {
          if (!child.userData.initialPos) {
            child.userData.initialPos = child.position.clone();
            const dir = child.position.clone().normalize();
            if (dir.lengthSq() < 0.0001) {
              dir.set(
                ((idx % 3) - 1) * 0.6,
                ((Math.floor(idx / 3) % 2) - 0.5) * 0.6,
                0.6
              ).normalize();
            }
            child.userData.explodeDir = dir;
          }
          const init = child.userData.initialPos as THREE.Vector3;
          const dir = child.userData.explodeDir as THREE.Vector3;
          child.position.x = init.x + dir.x * p * 1.5;
          child.position.y = init.y + dir.y * p * 1.5;
          child.position.z = init.z + dir.z * p * 1.5;
        });
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // 10. Resize Observer
    const handleResize = () => {
      if (!mount || !rendererRef.current || !cameraRef.current) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(mount);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.dispose();
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [modelKey]);

  // ----------------------------------------------------
  // CUSTOM 3D FILE PARSING & LOADING (Blender, Rhino, SketchUp, CAD)
  // ----------------------------------------------------
  const loadCustom3DObject = (
    object: THREE.Object3D,
    fileName: string,
    fileFormat: string,
    fileSizeStr?: string
  ) => {
    if (!sceneRef.current || !customModelGroupRef.current || !defaultModelGroupRef.current) return;

    // 1. Hide default model
    defaultModelGroupRef.current.visible = false;

    // 2. Clear old custom children
    const customGroup = customModelGroupRef.current;
    while (customGroup.children.length > 0) {
      customGroup.remove(customGroup.children[0]);
    }
    customGroup.visible = true;
    customGroup.add(object);

    // 3. Center and Scale Bounding Box
    const box = new THREE.Box3().setFromObject(object);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    // Shift object so center is at (0, 0, 0)
    object.position.x -= center.x;
    object.position.y -= center.y;
    object.position.z -= center.z;

    // Scale to standard viewable size (max dimension ~3.2)
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 0) {
      const scale = 3.2 / maxDim;
      object.scale.set(scale, scale, scale);
    }

    // Ground alignment (align min y with grid floor at y = -1.6)
    const newBox = new THREE.Box3().setFromObject(object);
    object.position.y += (-1.55 - newBox.min.y);

    // 4. Traverse meshes: setup shadow, materials, parts
    const partsMap: Record<string, THREE.Object3D> = {};
    const newParts: PartInfo[] = [];
    let tris = 0;
    let verts = 0;
    let partIndex = 1;

    object.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        if (!mesh.material) {
          mesh.material = new THREE.MeshStandardMaterial({
            color: 0x34d399,
            roughness: 0.35,
            metalness: 0.3,
          });
        }

        const partId = `custom_part_${partIndex}`;
        partsMap[partId] = mesh;
        newParts.push({
          id: partId,
          name: mesh.name || `Part Mesh #${partIndex}`,
          description: `Format: ${fileFormat.toUpperCase()} • Poligon Mesh 3D`,
          visible: true,
        });

        if (mesh.geometry) {
          const geo = mesh.geometry;
          tris += geo.index ? geo.index.count / 3 : (geo.attributes.position ? geo.attributes.position.count / 3 : 0);
          verts += geo.attributes.position ? geo.attributes.position.count : 0;
        }
        partIndex++;
      }
    });

    modelPartsRef.current = partsMap;
    setPartsList(newParts);
    setPolyStats({ tris: Math.round(tris), verts });
    setLoadedCustomModel({
      name: fileName,
      format: fileFormat.toUpperCase(),
      size: fileSizeStr,
    });
    setIsLoadingFile(false);
    setFileError(null);

    // Reset camera controls to look at loaded model
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  const process3DFile = async (file: File) => {
    setIsLoadingFile(true);
    setFileError(null);
    const ext = file.name.split(".").pop()?.toLowerCase() || "";

    const formatSize = (bytes: number) => {
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };
    const sizeStr = formatSize(file.size);

    try {
      if (ext === "glb" || ext === "gltf") {
        const arrayBuffer = await file.arrayBuffer();
        const loader = new GLTFLoader();
        loader.parse(
          arrayBuffer,
          "",
          (gltf) => {
            loadCustom3DObject(gltf.scene, file.name, ext, sizeStr);
          },
          (err) => {
            console.error("glTF parse error:", err);
            setFileError("Gagal membaca file GLTF/GLB: " + (err?.message || "Format tidak valid"));
            setIsLoadingFile(false);
          }
        );
      } else if (ext === "obj") {
        const text = await file.text();
        const loader = new OBJLoader();
        const obj = loader.parse(text);
        loadCustom3DObject(obj, file.name, "OBJ", sizeStr);
      } else if (ext === "stl") {
        const buffer = await file.arrayBuffer();
        const loader = new STLLoader();
        const geometry = loader.parse(buffer);
        const material = new THREE.MeshStandardMaterial({
          color: 0x34d399,
          roughness: 0.35,
          metalness: 0.4,
        });
        const mesh = new THREE.Mesh(geometry, material);
        const group = new THREE.Group();
        group.add(mesh);
        loadCustom3DObject(group, file.name, "STL", sizeStr);
      } else {
        const desktopSoftwares: Record<string, string> = {
          blend: "Blender (File > Export > glTF 2.0 .glb)",
          "3dm": "Rhinoceros (File > Export Selected > glTF .glb / .obj)",
          skp: "SketchUp (File > Export > 3D Model > .glb / .obj)",
          dwg: "AutoCAD (Export ke .stl / .obj)",
          step: "CAD / STEP (Export ke .obj / .stl atau konversi via Blender)",
          stp: "CAD / STEP (Export ke .obj / .stl atau konversi via Blender)",
          sldprt: "SolidWorks (File > Save As > .stl / .obj)",
          fbx: "Autodesk FBX (Export ulang ke .glb dari Blender untuk web penuh)",
        };
        const hint = desktopSoftwares[ext]
          ? `Gunakan ${desktopSoftwares[ext]}`
          : "Silakan ekspor dari software 3D Anda ke format universal web: .GLB, .GLTF, .OBJ, atau .STL";

        setFileError(
          `Format ".${ext}" adalah file mentah proyek software desktop. Web browser membaca format web universal. Panduan: ${hint}.`
        );
        setIsLoadingFile(false);
      }
    } catch (err: any) {
      console.error("3D file load error:", err);
      setFileError("Gagal membaca file 3D: " + (err?.message || "Pastikan file tidak korup"));
      setIsLoadingFile(false);
    }
  };

  const resetToDefaultModel = () => {
    if (customModelGroupRef.current) {
      customModelGroupRef.current.visible = false;
      while (customModelGroupRef.current.children.length > 0) {
        customModelGroupRef.current.remove(customModelGroupRef.current.children[0]);
      }
    }
    if (defaultModelGroupRef.current) {
      defaultModelGroupRef.current.visible = true;
    }
    setLoadedCustomModel(null);
    setPartsList(defaultPartsListRef.current);
    setPolyStats(defaultPolyStatsRef.current);
    setFileError(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      process3DFile(file);
    }
  };

  // Check if project.mediaUrl is an external 3D file on mount
  useEffect(() => {
    if (
      project.mediaUrl &&
      (project.mediaUrl.endsWith(".glb") ||
        project.mediaUrl.endsWith(".gltf") ||
        project.mediaUrl.endsWith(".obj") ||
        project.mediaUrl.endsWith(".stl") ||
        (project.mediaUrl.startsWith("/uploads/") && !project.mediaUrl.endsWith(".png") && !project.mediaUrl.endsWith(".jpg")))
    ) {
      setIsLoadingFile(true);
      const ext = project.mediaUrl.split(".").pop()?.toLowerCase() || "glb";
      if (ext === "glb" || ext === "gltf") {
        const loader = new GLTFLoader();
        loader.load(
          project.mediaUrl,
          (gltf) => {
            loadCustom3DObject(gltf.scene, project.title, ext);
          },
          undefined,
          (err) => {
            console.error("Failed to load project 3D model:", err);
            setIsLoadingFile(false);
          }
        );
      } else if (ext === "obj") {
        const loader = new OBJLoader();
        loader.load(
          project.mediaUrl,
          (obj) => {
            loadCustom3DObject(obj, project.title, "OBJ");
          },
          undefined,
          () => setIsLoadingFile(false)
        );
      } else if (ext === "stl") {
        const loader = new STLLoader();
        loader.load(
          project.mediaUrl,
          (geo) => {
            const mat = new THREE.MeshStandardMaterial({
              color: 0x34d399,
              roughness: 0.35,
              metalness: 0.4,
            });
            const mesh = new THREE.Mesh(geo, mat);
            const grp = new THREE.Group();
            grp.add(mesh);
            loadCustom3DObject(grp, project.title, "STL");
          },
          undefined,
          () => setIsLoadingFile(false)
        );
      }
    }
  }, [project.mediaUrl]);

  // Sync Explode Slider with Target
  const handleExplodeChange = (value: number) => {
    setExplodeProgress(value);
    targetExplodeRef.current = value / 100;
  };

  // Toggle Auto Explode
  const toggleAutoExplode = () => {
    if (explodeProgress > 50) {
      handleExplodeChange(0);
      setIsAutoExploding(false);
    } else {
      handleExplodeChange(100);
      setIsAutoExploding(true);
    }
  };

  // Sync Shading Mode
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        if (mesh.name === "grid" || mesh.name.startsWith("star")) return;

        if (Array.isArray(mesh.material)) return;
        const mat = mesh.material as THREE.MeshStandardMaterial;

        if (shadingMode === "wireframe") {
          mat.wireframe = true;
          mat.opacity = 1;
        } else if (shadingMode === "clay") {
          mat.wireframe = false;
          mat.roughness = 0.95;
          mat.metalness = 0.05;
          mat.color.setHex(0xd1d5db);
        } else if (shadingMode === "matcap") {
          mat.wireframe = false;
          mat.roughness = 0.05;
          mat.metalness = 0.98;
          mat.color.setHex(0x10b981);
        } else if (shadingMode === "xray") {
          mat.wireframe = true;
          mat.transparent = true;
          mat.opacity = 0.35;
          mat.color.setHex(0x34d399);
        } else {
          // Material / Default PBR
          mat.wireframe = false;
          mat.transparent = false;
          mat.opacity = 1;
          if (mesh.name.includes("glass") || mesh.name.includes("visor")) {
            mat.transparent = true;
            mat.opacity = 0.75;
          }
        }
        mat.needsUpdate = true;
      }
    });
  }, [shadingMode]);

  // Sync Lighting Preset
  useEffect(() => {
    const lights = lightsRef.current;
    if (!lights.main || !lights.rim || !lights.ambient) return;

    if (lightingPreset === "cyber-neon") {
      lights.main.color.setHex(0x06b6d4); // Cyan
      lights.rim.color.setHex(0xd946ef); // Magenta
      lights.ambient.color.setHex(0x0a1628);
    } else if (lightingPreset === "clean-studio") {
      lights.main.color.setHex(0xffffff);
      lights.rim.color.setHex(0xf1f5f9);
      lights.ambient.color.setHex(0x1e293b);
    } else if (lightingPreset === "warm-sunset") {
      lights.main.color.setHex(0xf59e0b); // Amber
      lights.rim.color.setHex(0xf97316); // Orange
      lights.ambient.color.setHex(0x291807);
    } else {
      // Dark Mint Signature
      lights.main.color.setHex(0x34d399);
      lights.rim.color.setHex(0x22d3ee);
      lights.ambient.color.setHex(0x0b2419);
    }
  }, [lightingPreset]);

  // Sync Auto Rotate & Speed
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
      controlsRef.current.autoRotateSpeed = rotateSpeed;
    }
  }, [autoRotate, rotateSpeed]);

  // Camera Presets
  const setCameraAngle = (preset: CameraPreset) => {
    if (!cameraRef.current || !controlsRef.current) return;
    const cam = cameraRef.current;
    controlsRef.current.reset();

    switch (preset) {
      case "front":
        cam.position.set(0, 0, 7.5);
        break;
      case "top":
        cam.position.set(0, 8.5, 0.01);
        break;
      case "side":
        cam.position.set(7.5, 0, 0);
        break;
      case "iso":
        cam.position.set(5.5, 5.5, 5.5);
        break;
      case "perspective":
      default:
        cam.position.set(4.5, 3.2, 6.2);
        break;
    }
    controlsRef.current.update();
  };

  // Toggle Part Visibility in Outliner
  const togglePartVisibility = (partId: string) => {
    const part = modelPartsRef.current[partId];
    if (!part) return;

    const willBeVisible = !part.visible;
    part.visible = willBeVisible;

    setPartsList((prev) =>
      prev.map((p) => (p.id === partId ? { ...p, visible: willBeVisible } : p))
    );
  };

  // Capture High-Res Screenshot
  const captureScreenshot = () => {
    if (!rendererRef.current) return;
    const dataUrl = rendererRef.current.domElement.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `${project.title.replace(/\s+/g, "_")}_3D_Review.png`;
    link.href = dataUrl;
    link.click();
  };

  // Share link
  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#070f0b] text-[#ecfdf5] flex flex-col pt-20 pb-16">
      {/* Top Breadcrumb & Header Bar */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-[#183928]">
          <div className="flex items-center gap-3">
            <Link
              href="/#projects"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0e241b] border border-[#1e4834] text-xs font-semibold text-emerald-300 hover:text-white hover:bg-[#15382a] transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Portofolio</span>
            </Link>
            <div className="h-5 w-px bg-[#183928] hidden sm:block" />
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  Blender 3D Review Studio
                </span>
                <span className="text-xs text-emerald-400/60 font-mono hidden md:inline">
                  {polyStats.tris.toLocaleString()} Tris • {polyStats.verts.toLocaleString()} Verts
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                {project.title}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Hidden file input for 3D model test */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".glb,.gltf,.obj,.stl"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  process3DFile(e.target.files[0]);
                }
              }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500/25 to-teal-500/25 border border-emerald-500/40 text-xs font-semibold text-emerald-300 hover:text-white hover:border-emerald-400 transition flex items-center gap-1.5 shadow-sm"
              title="Uji file 3D dari Blender, Rhino, SketchUp, CAD (.glb, .gltf, .obj, .stl)"
            >
              <FileUp className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Uji File 3D Lokal</span>
              <span className="sm:hidden">Uji 3D</span>
            </button>

            <button
              onClick={handleShare}
              className="px-3.5 py-2 rounded-xl bg-[#0e241b] border border-[#1e4834] text-xs font-semibold text-emerald-300 hover:text-white transition flex items-center gap-1.5"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              <span>{copiedLink ? "Link Disalin!" : "Bagikan"}</span>
            </button>
            <button
              onClick={captureScreenshot}
              className="px-3.5 py-2 rounded-xl bg-[#0e241b] border border-[#1e4834] text-xs font-semibold text-emerald-300 hover:text-white transition flex items-center gap-1.5"
              title="Download Snapshot Render PNG"
            >
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline">Render PNG</span>
            </button>
            <button
              onClick={() => setCameraAngle("perspective")}
              className="p-2 rounded-xl bg-[#0e241b] border border-[#1e4834] text-emerald-300 hover:text-white transition"
              title="Reset Sudut Kamera"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Viewport Grid */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: The 3D Interactive Viewport (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div
            className={`relative rounded-3xl bg-[#060e0a] border border-[#1e4835] overflow-hidden shadow-2xl flex flex-col transition-all ${
              isFullscreen ? "!fixed !inset-0 !z-[100] !rounded-none !h-screen !w-screen" : ""
            }`}
          >
            {/* Viewport Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-[#0a1811]/95 backdrop-blur-md border-b border-[#183928] z-20">
              {/* Shading Mode Picker (Blender-like) */}
              <div className="flex items-center gap-1 bg-[#0f241a] p-1 rounded-xl border border-[#1b4330]">
                <span className="text-[10px] text-emerald-400/60 font-bold px-2 uppercase hidden sm:inline">
                  Shading
                </span>
                {(
                  [
                    { id: "material", label: "PBR Material" },
                    { id: "wireframe", label: "Wireframe" },
                    { id: "clay", label: "Clay" },
                    { id: "matcap", label: "MatCap" },
                    { id: "xray", label: "X-Ray" },
                  ] as const
                ).map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setShadingMode(mode.id)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                      shadingMode === mode.id
                        ? "bg-emerald-400 text-emerald-950 font-bold shadow-sm"
                        : "text-emerald-200/70 hover:text-white"
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>

              {/* Lighting & Fullscreen Actions */}
              <div className="flex items-center gap-1.5">
                {/* Lighting Presets */}
                <div className="flex items-center gap-1 bg-[#0f241a] p-1 rounded-xl border border-[#1b4330]">
                  <Sun className="w-3.5 h-3.5 text-amber-300 ml-1.5" />
                  <select
                    value={lightingPreset}
                    onChange={(e) => setLightingPreset(e.target.value as LightingPreset)}
                    className="bg-transparent text-xs font-semibold text-emerald-200 focus:outline-none pr-2 py-0.5 cursor-pointer"
                  >
                    <option value="dark-mint" className="bg-[#070f0b]">Studio Mint</option>
                    <option value="cyber-neon" className="bg-[#070f0b]">Cyber Neon</option>
                    <option value="clean-studio" className="bg-[#070f0b]">Clean Studio</option>
                    <option value="warm-sunset" className="bg-[#070f0b]">Sunset Warm</option>
                  </select>
                </div>

                {/* Fullscreen Toggle */}
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 rounded-xl bg-[#0f241a] border border-[#1b4330] text-emerald-300 hover:text-white transition"
                  title={isFullscreen ? "Keluar Fullscreen" : "Layar Penuh"}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Notification: Active Custom Model Banner */}
            {loadedCustomModel && (
              <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-emerald-950/80 border-b border-emerald-500/30 text-xs text-emerald-200 z-20">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>
                    Model Aktif: <strong className="text-white font-mono">{loadedCustomModel.name}</strong>{" "}
                    ({loadedCustomModel.format} {loadedCustomModel.size ? `• ${loadedCustomModel.size}` : ""})
                  </span>
                </div>
                <button
                  onClick={resetToDefaultModel}
                  className="text-[11px] underline hover:text-white text-emerald-400 font-semibold"
                >
                  Kembali ke Model Asli
                </button>
              </div>
            )}

            {/* Notification: File Error Banner */}
            {fileError && (
              <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-red-950/90 border-b border-red-500/40 text-xs text-red-200 z-20">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span className="leading-snug">{fileError}</span>
                </div>
                <button
                  onClick={() => setFileError(null)}
                  className="text-red-300 hover:text-white font-bold text-base px-1.5"
                  title="Tutup"
                >
                  ×
                </button>
              </div>
            )}

            {/* The 3D WebGL Canvas */}
            <div
              ref={canvasMountRef}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`w-full relative cursor-grab active:cursor-grabbing bg-[#060e0a] ${
                isFullscreen ? "h-[calc(100vh-140px)]" : "h-[450px] sm:h-[520px]"
              }`}
            >
              {/* Drag Over Overlay */}
              {isDragOver && (
                <div className="absolute inset-0 z-30 bg-emerald-950/85 border-2 border-dashed border-emerald-400 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 pointer-events-none">
                  <Upload className="w-12 h-12 text-emerald-400 animate-bounce mb-3" />
                  <h3 className="text-lg font-bold text-white mb-1">
                    Lepaskan File 3D Anda di Sini!
                  </h3>
                  <p className="text-xs text-emerald-200 max-w-sm">
                    Mendukung ekspor dari Blender, Rhino, SketchUp, CAD (.glb, .gltf, .obj, .stl).
                  </p>
                </div>
              )}

              {/* Loading State Overlay */}
              {isLoadingFile && (
                <div className="absolute inset-0 z-30 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6">
                  <RefreshCw className="w-10 h-10 text-emerald-400 animate-spin mb-3" />
                  <h3 className="text-sm font-bold text-white mb-1">
                    Memuat dan Merakit Objek 3D...
                  </h3>
                  <p className="text-xs text-emerald-300/70">
                    Menghitung poligon, material, dan hierarki mesh
                  </p>
                </div>
              )}
              {/* Floating Camera Angle Buttons HUD (Top Left) */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-1 bg-[#08150f]/85 backdrop-blur-md p-1.5 rounded-xl border border-[#193b29] text-[11px]">
                <span className="text-[9px] uppercase font-bold text-emerald-400/80 px-1 mb-0.5 flex items-center gap-1">
                  <Compass className="w-3 h-3" />
                  <span>Kamera</span>
                </span>
                <button
                  onClick={() => setCameraAngle("front")}
                  className="px-2 py-1 rounded bg-[#10291e] text-emerald-200 hover:text-white text-left transition hover:bg-[#183d2c]"
                >
                  Depan (Front)
                </button>
                <button
                  onClick={() => setCameraAngle("top")}
                  className="px-2 py-1 rounded bg-[#10291e] text-emerald-200 hover:text-white text-left transition hover:bg-[#183d2c]"
                >
                  Atas (Top)
                </button>
                <button
                  onClick={() => setCameraAngle("side")}
                  className="px-2 py-1 rounded bg-[#10291e] text-emerald-200 hover:text-white text-left transition hover:bg-[#183d2c]"
                >
                  Samping (Side)
                </button>
                <button
                  onClick={() => setCameraAngle("iso")}
                  className="px-2 py-1 rounded bg-[#10291e] text-emerald-200 hover:text-white text-left transition hover:bg-[#183d2c]"
                >
                  Isometrik (ISO)
                </button>
              </div>

              {/* 360 Turntable Auto Rotate Control (Top Right) */}
              <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-[#08150f]/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#193b29]">
                <button
                  onClick={() => setAutoRotate(!autoRotate)}
                  className={`flex items-center gap-1.5 text-xs font-bold transition ${
                    autoRotate ? "text-emerald-300" : "text-emerald-400/60 hover:text-white"
                  }`}
                >
                  {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>360° Spin</span>
                </button>
              </div>

              {/* Central Watermark Helper */}
              <div className="absolute bottom-3 left-3 pointer-events-none z-10 flex items-center gap-2 text-[10px] text-emerald-400/50 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Klik &amp; Drag untuk putar 360° • Scroll untuk Zoom • Klik Kanan untuk Pan</span>
              </div>
            </div>

            {/* Bottom Floating HUD: Fitur BONGKAR PASANG (Exploded View) */}
            <div className="p-4 bg-[#0a1912]/95 backdrop-blur-md border-t border-[#183a29] z-20 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={toggleAutoExplode}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-md ${
                    explodeProgress > 50
                      ? "bg-[#143525] border border-emerald-500/40 text-emerald-200 hover:bg-[#1a4430]"
                      : "bg-gradient-to-r from-emerald-400 to-teal-400 text-emerald-950 hover:brightness-110 shadow-emerald-500/25"
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>{explodeProgress > 50 ? "Rakit Kembali" : "Bongkar Model"}</span>
                </button>

                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-3 h-3 text-cyan-300" />
                    <span>Fitur Bongkar (Explode)</span>
                  </span>
                  <span className="text-[10px] text-emerald-300/70">
                    Tingkat Bongkar: <strong className="text-white">{explodeProgress}%</strong>
                  </span>
                </div>
              </div>

              {/* Explode Slider */}
              <div className="flex items-center gap-3 w-full sm:max-w-xs">
                <span className="text-[10px] font-mono text-emerald-400/70">0%</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={explodeProgress}
                  onChange={(e) => handleExplodeChange(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-[#122e20] rounded-lg appearance-none cursor-pointer accent-emerald-400 focus:outline-none"
                />
                <span className="text-[10px] font-mono text-emerald-400/70">100%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Blender-like Outliner & Parts Inspector (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Outliner Hierarchy Box */}
          <div className="p-5 rounded-3xl bg-[#091a12] border border-[#1b4330] shadow-xl flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#183928] mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Outliner Komponen 3D
                </h2>
              </div>
              <span className="text-[10px] font-mono text-emerald-300/60 bg-[#102b1d] px-2 py-0.5 rounded border border-[#1d4c34]">
                {partsList.length} Komponen
              </span>
            </div>

            <p className="text-xs text-emerald-200/70 mb-3 leading-relaxed">
              Klik ikon mata untuk menyembunyikan atau menampilkan bagian tertentu secara terpisah ala Blender:
            </p>

            <div className="flex flex-col gap-2 max-h-[380px] overflow-y-auto pr-1">
              {partsList.map((part) => (
                <div
                  key={part.id}
                  onClick={() => setActivePartId(activePartId === part.id ? null : part.id)}
                  className={`p-3 rounded-xl border transition-all flex items-start justify-between gap-3 cursor-pointer ${
                    activePartId === part.id
                      ? "bg-[#143826] border-emerald-400/80 shadow-md shadow-emerald-500/10"
                      : "bg-[#0c2217] border-[#183d2a] hover:border-emerald-500/40"
                  }`}
                >
                  <div className="flex flex-col flex-1">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Box className="w-3.5 h-3.5 text-cyan-300" />
                      {part.name}
                    </span>
                    <span className="text-[11px] text-emerald-300/65 mt-0.5 line-clamp-1">
                      {part.description}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePartVisibility(part.id);
                    }}
                    className={`p-1.5 rounded-lg transition ${
                      part.visible
                        ? "text-emerald-300 hover:text-white bg-[#153a27]"
                        : "text-emerald-500/30 bg-[#091811] hover:text-emerald-300"
                    }`}
                    title={part.visible ? "Sembunyikan Bagian" : "Tampilkan Bagian"}
                  >
                    {part.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="p-5 rounded-3xl bg-[#091a12] border border-[#1b4330] shadow-xl flex flex-col gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Detail Ringkas Karya</span>
            </h3>
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-[#0b2016] border border-[#173a28]">
                <span className="text-[10px] text-emerald-400/60 block font-medium">Klien</span>
                <span className="font-bold text-white mt-0.5 block">{project.client || "Studio Portfolio Project"}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0b2016] border border-[#173a28]">
                <span className="text-[10px] text-emerald-400/60 block font-medium">Tahun Rilis</span>
                <span className="font-bold text-white mt-0.5 block">{project.year || "2024"}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0b2016] border border-[#173a28] col-span-2">
                <span className="text-[10px] text-emerald-400/60 block font-medium">Dimensi / Ukuran</span>
                <span className="font-bold text-emerald-300 mt-0.5 block">{project.dimensions || "Ukuran Standar Industri"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Deep Dive Information Tabs (Concept, Specs, Other 3D Projects) */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="p-6 sm:p-8 rounded-3xl bg-[#091a12] border border-[#1b4330] shadow-2xl">
          {/* Tab Header */}
          <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-[#183928] mb-6">
            <button
              onClick={() => setActiveTab("concept")}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition ${
                activeTab === "concept"
                  ? "bg-emerald-400 text-emerald-950 shadow-md shadow-emerald-500/20"
                  : "text-emerald-200/70 hover:text-white hover:bg-[#122c1f]"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Konsep &amp; Filosofi Desain</span>
            </button>
            <button
              onClick={() => setActiveTab("specs")}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition ${
                activeTab === "specs"
                  ? "bg-emerald-400 text-emerald-950 shadow-md shadow-emerald-500/20"
                  : "text-emerald-200/70 hover:text-white hover:bg-[#122c1f]"
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>Spesifikasi Teknis &amp; Cetak</span>
            </button>
            <button
              onClick={() => setActiveTab("other")}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition ${
                activeTab === "other"
                  ? "bg-emerald-400 text-emerald-950 shadow-md shadow-emerald-500/20"
                  : "text-emerald-200/70 hover:text-white hover:bg-[#122c1f]"
              }`}
            >
              <Box className="w-4 h-4" />
              <span>Karya 3D Lainnya ({other3DProjects.length})</span>
            </button>
          </div>

          {/* Tab 1: Concept & Design Philosophy */}
          {activeTab === "concept" && (
            <div className="space-y-4 text-sm leading-relaxed text-emerald-100/85">
              <h3 className="text-xl font-bold text-white">
                Rasionalisasi Desain &amp; Pengalaman Interaktif
              </h3>
              <p>
                {project.conceptDetails || project.description}
              </p>
              <p>
                Dalam proyek ini, fokus utama adalah menciptakan antarmuka fisik dan digital yang saling melengkapi. 
                Dengan memanfaatkan teknologi WebGL 3D secara langsung di peramban, klien dan pengunjung dapat mengamati 
                kualitas karya dari seluruh sudut 360 derajat serta melihat anatomi bagian dalam kemasan secara transparan 
                sebelum masuk ke tahap produksi massal.
              </p>
              <div className="pt-4 flex flex-wrap gap-2">
                {project.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-lg bg-[#112d1f] border border-[#1e4a33] text-xs font-semibold text-emerald-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: Technical Specifications */}
          {activeTab === "specs" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
              <div className="p-5 rounded-2xl bg-[#0c2217] border border-[#183d2a] space-y-3">
                <h4 className="font-bold text-emerald-300 uppercase tracking-wider text-xs">
                  Spesifikasi Material &amp; Cetak
                </h4>
                <div className="flex justify-between py-1.5 border-b border-[#143424]">
                  <span className="text-emerald-300/70">Material Fisik:</span>
                  <span className="font-semibold text-white">{project.materialSpecs || "Art Carton 360gsm"}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#143424]">
                  <span className="text-emerald-300/70">Dimensi Dieline:</span>
                  <span className="font-semibold text-white">{project.dimensions || "Presisi Skala 1:1"}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-emerald-300/70">Finishing Cetak:</span>
                  <span className="font-semibold text-white">Soft-Touch Lamination + Spot UV Gold</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#0c2217] border border-[#183d2a] space-y-3">
                <h4 className="font-bold text-cyan-300 uppercase tracking-wider text-xs">
                  Spesifikasi Model 3D WebGL
                </h4>
                <div className="flex justify-between py-1.5 border-b border-[#143424]">
                  <span className="text-emerald-300/70">Perangkat Lunak:</span>
                  <span className="font-semibold text-white">{(project.software || ["Blender 4.2 LTS", "Three.js"]).join(", ")}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#143424]">
                  <span className="text-emerald-300/70">Kerapatan Poligon:</span>
                  <span className="font-semibold text-white">{project.polyCount || `${polyStats.tris} Tris`}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-emerald-300/70">Shader Engine:</span>
                  <span className="font-semibold text-white">PBR Metallic/Roughness Three.js</span>
                </div>
              </div>

              {/* Panduan Kompatibilitas Software 3D */}
              <div className="md:col-span-2 mt-2 p-6 rounded-2xl bg-[#071910] border border-[#183f2a] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#143623]">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-emerald-400" />
                    <h4 className="font-bold text-sm sm:text-base text-white">
                      Panduan Kompatibilitas Software 3D (Blender, Rhinoceros, SketchUp, CAD)
                    </h4>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400/80 bg-[#0e271b] px-2.5 py-1 rounded-full border border-[#1a442f]">
                    Format Web Universal: .GLB / .GLTF / .OBJ / .STL
                  </span>
                </div>

                <p className="text-xs text-emerald-200/80 leading-relaxed">
                  Web browser modern menjalankan 3D menggunakan WebGL &amp; Three.js secara langsung di GPU kartu grafis. File mentah proyek desktop 
                  seperti <code className="text-emerald-300 bg-black/40 px-1 py-0.5 rounded">.blend</code>, <code className="text-emerald-300 bg-black/40 px-1 py-0.5 rounded">.3dm</code>, <code className="text-emerald-300 bg-black/40 px-1 py-0.5 rounded">.skp</code>, atau <code className="text-emerald-300 bg-black/40 px-1 py-0.5 rounded">.dwg / .step</code> 
                  berisi nodes proprietary software yang berukuran sangat besar. Agar bisa dilihat klien di browser 360°, ekspor karya Anda ke format web standar:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
                  {/* 1. Blender */}
                  <div className="p-4 rounded-xl bg-[#0a2015] border border-[#163b27] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-orange-400" />
                        Blender (.blend)
                      </span>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                        Standar Emas
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-300/80">
                      <strong>Cara Ekspor:</strong><br />
                      Pilih <span className="text-white font-mono">File &gt; Export &gt; glTF 2.0 (.glb)</span>.
                    </p>
                    <p className="text-[10px] text-emerald-400/70 leading-relaxed">
                      Format <strong className="text-emerald-300">.glb</strong> otomatis menyatukan geometri, material PBR, tekstur warna/roughness, dan hierarki part dalam 1 file compact.
                    </p>
                  </div>

                  {/* 2. Rhinoceros */}
                  <div className="p-4 rounded-xl bg-[#0a2015] border border-[#163b27] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-cyan-400" />
                        Rhinoceros (.3dm)
                      </span>
                      <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30">
                        Rhino 7 / 8
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-300/80">
                      <strong>Cara Ekspor:</strong><br />
                      Pilih objek &gt; <span className="text-white font-mono">File &gt; Export Selected</span> &gt; pilih format <span className="text-white font-mono">glTF (.glb)</span> atau <span className="text-white font-mono">Wavefront (.obj)</span>.
                    </p>
                    <p className="text-[10px] text-emerald-400/70 leading-relaxed">
                      Kurva kurva NURBS industri otomatis diubah menjadi poligon mesh segitiga yang tajam dan presisi.
                    </p>
                  </div>

                  {/* 3. SketchUp */}
                  <div className="p-4 rounded-xl bg-[#0a2015] border border-[#163b27] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-400" />
                        SketchUp (.skp)
                      </span>
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30">
                        Arsitektur / Ruang
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-300/80">
                      <strong>Cara Ekspor:</strong><br />
                      Pilih <span className="text-white font-mono">File &gt; Export &gt; 3D Model</span> &gt; pilih format <span className="text-white font-mono">glTF (.glb)</span> (via plugin/ekstensi glTF) atau <span className="text-white font-mono">.OBJ</span>.
                    </p>
                    <p className="text-[10px] text-emerald-400/70 leading-relaxed">
                      Cocok untuk memamerkan rancangan interior rumah, booth pameran, dan maket arsitektural 360°.
                    </p>
                  </div>

                  {/* 4. CAD & SolidWorks */}
                  <div className="p-4 rounded-xl bg-[#0a2015] border border-[#163b27] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-400" />
                        CAD / SolidWorks
                      </span>
                      <span className="text-[10px] font-bold text-blue-400 bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-500/30">
                        Teknik &amp; Manufaktur
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-300/80">
                      <strong>Cara Ekspor:</strong><br />
                      Ekspor ke format <span className="text-white font-mono">.STL</span> atau <span className="text-white font-mono">.OBJ</span>, atau buka file <span className="text-white font-mono">.step</span> di Blender untuk diekspor ke <span className="text-white font-mono">.GLB</span>.
                    </p>
                    <p className="text-[10px] text-emerald-400/70 leading-relaxed">
                      Format STL &amp; OBJ dapat langsung dibuka dan dihitung poligonnya di peninjau 3D ini.
                    </p>
                  </div>
                </div>

                {/* Direct Test Action inside Specs */}
                <div className="p-4 rounded-xl bg-[#05140d] border border-[#143d27] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 text-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>
                      Ingin melihat hasil ekspor Anda secara langsung? Uji file <strong className="text-emerald-300">.glb, .gltf, .obj, .stl</strong> Anda sekarang!
                    </span>
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-emerald-950 font-bold hover:brightness-110 transition whitespace-nowrap shadow-md"
                  >
                    Buka File 3D Lokal
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Other 3D Projects */}
          {activeTab === "other" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {other3DProjects.map((other) => (
                <Link
                  key={other.id}
                  href={`/karya-3d/${other.id}`}
                  className="group rounded-2xl bg-[#0c2217] border border-[#183d2a] hover:border-emerald-400 p-4 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-black/40">
                      <img
                        src={other.thumbnailUrl}
                        alt={other.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-900/80 text-cyan-300 border border-cyan-500/40">
                        3D 360°
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors line-clamp-1">
                      {other.title}
                    </h4>
                    <p className="text-xs text-emerald-200/65 line-clamp-2 mt-1">
                      {other.description}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#143424] flex items-center justify-between text-xs text-emerald-400 font-semibold">
                    <span>Review Model Ini</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
