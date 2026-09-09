"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
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
  Cpu,
} from "lucide-react";

interface ThreeDViewerProps {
  modelType?: "torus" | "sphere" | "crystal" | "ring";
  title?: string;
  className?: string;
  autoRotateDefault?: boolean;
}

export function ThreeDViewer({
  modelType = "torus",
  title = "Interactive 3D Visualizer",
  className = "",
  autoRotateDefault = true,
}: ThreeDViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const currentMeshGroup = useRef<THREE.Group | null>(null);

  const [currentShape, setCurrentShape] = useState<"torus" | "sphere" | "crystal" | "ring">(modelType);
  const [renderMode, setRenderMode] = useState<"solid" | "wireframe" | "points">("solid");
  const [autoRotate, setAutoRotate] = useState(autoRotateDefault);
  const [rotateSpeed, setRotateSpeed] = useState<number>(2.0);
  const [themeColor, setThemeColor] = useState<"mint" | "cyan" | "gold">("mint");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [polyStats, setPolyStats] = useState({ vertices: 0, faces: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060e0a);
    scene.fog = new THREE.FogExp2(0x060e0a, 0.04);

    // 2. Camera setup
    const width = container.clientWidth || 700;
    const height = container.clientHeight || 450;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 7);
    cameraRef.current = camera;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    rendererRef.current = renderer;

    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = rotateSpeed;
    controls.maxDistance = 14;
    controls.minDistance = 2.5;
    controlsRef.current = controls;

    // 5. Starfield background particles
    const starCount = 600;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 35;
      starPositions[i + 1] = (Math.random() - 0.5) * 35;
      starPositions[i + 2] = (Math.random() - 0.5) * 35;
    }
    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({
      color: 0x34d399,
      size: 0.06,
      transparent: true,
      opacity: 0.45,
    });
    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    // 6. Lights
    const ambientLight = new THREE.AmbientLight(0x0c261b, 3.0);
    scene.add(ambientLight);

    const mainLightColor =
      themeColor === "cyan"
        ? 0x22d3ee
        : themeColor === "gold"
        ? 0xf59e0b
        : 0x34d399;

    const mainLight = new THREE.DirectionalLight(mainLightColor, 3.5);
    mainLight.position.set(5, 5, 5);
    scene.add(mainLight);

    const rimLight = new THREE.DirectionalLight(0x06b6d4, 2.5);
    rimLight.position.set(-5, -4, -4);
    scene.add(rimLight);

    const orbitLight = new THREE.PointLight(mainLightColor, 5, 14);
    orbitLight.position.set(0, 3, 2);
    scene.add(orbitLight);

    // 7. Object Group
    const group = new THREE.Group();
    scene.add(group);
    currentMeshGroup.current = group;

    // Build Geometry
    const buildModel = () => {
      while (group.children.length > 0) {
        const obj = group.children[0] as THREE.Mesh;
        if (obj.geometry) obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else if (obj.material) {
          obj.material.dispose();
        }
        group.remove(obj);
      }

      let geom: THREE.BufferGeometry;
      switch (currentShape) {
        case "sphere":
          geom = new THREE.IcosahedronGeometry(2.1, 4);
          break;
        case "crystal":
          geom = new THREE.OctahedronGeometry(2.3, 0);
          break;
        case "ring":
          geom = new THREE.TorusGeometry(1.9, 0.55, 32, 100);
          break;
        case "torus":
        default:
          geom = new THREE.TorusKnotGeometry(1.45, 0.44, 128, 32);
          break;
      }

      setPolyStats({
        vertices: geom.attributes.position.count,
        faces: geom.index ? geom.index.count / 3 : geom.attributes.position.count / 3,
      });

      const colorHex =
        themeColor === "cyan"
          ? 0x083344
          : themeColor === "gold"
          ? 0x451a03
          : 0x0d281a;

      const accentHex =
        themeColor === "cyan"
          ? 0x22d3ee
          : themeColor === "gold"
          ? 0xf59e0b
          : 0x34d399;

      if (renderMode === "points") {
        const pointsMat = new THREE.PointsMaterial({
          color: accentHex,
          size: 0.05,
          transparent: true,
          opacity: 0.85,
        });
        const pointsObj = new THREE.Points(geom, pointsMat);
        group.add(pointsObj);
      } else if (renderMode === "wireframe") {
        const wireMat = new THREE.MeshBasicMaterial({
          color: accentHex,
          wireframe: true,
        });
        const wireObj = new THREE.Mesh(geom, wireMat);
        group.add(wireObj);
      } else {
        // Solid Metallic with faint glowing wireframe overlay
        const solidMat = new THREE.MeshStandardMaterial({
          color: colorHex,
          roughness: 0.22,
          metalness: 0.88,
        });
        const solidMesh = new THREE.Mesh(geom, solidMat);
        group.add(solidMesh);

        const wireMat = new THREE.MeshBasicMaterial({
          color: accentHex,
          wireframe: true,
          transparent: true,
          opacity: 0.24,
        });
        const wireMesh = new THREE.Mesh(geom, wireMat);
        wireMesh.scale.set(1.012, 1.012, 1.012);
        group.add(wireMesh);
      }
    };

    buildModel();
    setIsLoading(false);

    // 8. Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Slow orbital motion of light
      orbitLight.position.x = Math.sin(elapsed * 0.9) * 4;
      orbitLight.position.y = Math.cos(elapsed * 0.7) * 4;

      // Slow drift of background stars
      starField.rotation.y = elapsed * 0.02;
      starField.rotation.x = elapsed * 0.01;

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // 9. Resize Listener
    const handleResize = () => {
      if (!container || !rendererRef.current) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(newWidth, newHeight);
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      if (controlsRef.current) controlsRef.current.dispose();
      if (rendererRef.current) rendererRef.current.dispose();
      if (container) container.innerHTML = "";
    };
  }, [currentShape, renderMode, themeColor]);

  // Sync controls speed & autoRotate
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
      controlsRef.current.autoRotateSpeed = rotateSpeed;
    }
  }, [autoRotate, rotateSpeed]);

  // Viewpoint presets
  const setCameraView = (view: "front" | "top" | "iso") => {
    if (!cameraRef.current || !controlsRef.current) return;
    controlsRef.current.reset();
    if (view === "front") {
      cameraRef.current.position.set(0, 0, 7);
    } else if (view === "top") {
      cameraRef.current.position.set(0, 7, 0.01);
    } else if (view === "iso") {
      cameraRef.current.position.set(5, 5, 5);
    }
  };

  return (
    <div
      className={`relative rounded-2xl bg-[#060e0a] border border-[#1e4835] overflow-hidden flex flex-col shadow-2xl ${className} ${
        isFullscreen ? "!fixed !inset-0 !z-[110] !rounded-none !h-screen !w-screen" : ""
      }`}
    >
      {/* Top Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-[#0a1811]/95 backdrop-blur-md border-b border-[#183928] z-10">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs sm:text-sm font-bold text-white tracking-wide flex items-center gap-1.5">
            <Box className="w-4 h-4 text-cyan-300" />
            {title}
          </span>
          <span className="hidden md:inline px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#133022] text-emerald-300 border border-[#205139]">
            {polyStats.vertices} Verts • {Math.round(polyStats.faces)} Tris
          </span>
        </div>

        {/* Model Shape Picker */}
        <div className="flex items-center gap-1 bg-[#0f241a] p-1 rounded-xl border border-[#1b4330]">
          {(["torus", "sphere", "crystal", "ring"] as const).map((shape) => (
            <button
              key={shape}
              onClick={() => setCurrentShape(shape)}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg capitalize transition ${
                currentShape === shape
                  ? "bg-emerald-400 text-emerald-950 shadow-sm"
                  : "text-emerald-200/70 hover:text-white"
              }`}
            >
              {shape === "torus" ? "Knot" : shape}
            </button>
          ))}
        </div>
      </div>

      {/* 3D Canvas Container */}
      <div
        ref={containerRef}
        className={`w-full relative cursor-grab active:cursor-grabbing bg-[#060e0a] ${
          isFullscreen ? "h-[calc(100vh-120px)]" : "h-[380px] sm:h-[450px]"
        }`}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#060e0a]">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Memuat 3D Canvas WebGL...</span>
            </div>
          </div>
        )}

        {/* Interactive Viewpoint Presets HUD Overlay */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 bg-[#08150f]/85 backdrop-blur-md p-2 rounded-xl border border-[#193b29] text-[11px]">
          <span className="text-[10px] uppercase font-bold text-emerald-400/80 px-1 mb-0.5 flex items-center gap-1">
            <Compass className="w-3 h-3" />
            <span>Sudut Pandang</span>
          </span>
          <button
            onClick={() => setCameraView("front")}
            className="px-2.5 py-1 rounded bg-[#10291e] text-emerald-200 hover:text-white text-left transition hover:bg-[#183d2c]"
          >
            Depan (Front)
          </button>
          <button
            onClick={() => setCameraView("top")}
            className="px-2.5 py-1 rounded bg-[#10291e] text-emerald-200 hover:text-white text-left transition hover:bg-[#183d2c]"
          >
            Atas (Top)
          </button>
          <button
            onClick={() => setCameraView("iso")}
            className="px-2.5 py-1 rounded bg-[#10291e] text-emerald-200 hover:text-white text-left transition hover:bg-[#183d2c]"
          >
            Isometrik 3D
          </button>
        </div>

        {/* Shading Mode HUD */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-1 bg-[#08150f]/85 backdrop-blur-md p-2 rounded-xl border border-[#193b29] text-[11px]">
          <span className="text-[10px] uppercase font-bold text-emerald-400/80 px-1 mb-0.5 flex items-center gap-1">
            <Layers className="w-3 h-3" />
            <span>Mode Shader</span>
          </span>
          <button
            onClick={() => setRenderMode("solid")}
            className={`px-2.5 py-1 rounded text-left transition ${
              renderMode === "solid"
                ? "bg-emerald-400 text-emerald-950 font-bold"
                : "bg-[#10291e] text-emerald-200 hover:text-white"
            }`}
          >
            Solid Metal
          </button>
          <button
            onClick={() => setRenderMode("wireframe")}
            className={`px-2.5 py-1 rounded text-left transition ${
              renderMode === "wireframe"
                ? "bg-emerald-400 text-emerald-950 font-bold"
                : "bg-[#10291e] text-emerald-200 hover:text-white"
            }`}
          >
            Wireframe Grid
          </button>
          <button
            onClick={() => setRenderMode("points")}
            className={`px-2.5 py-1 rounded text-left transition ${
              renderMode === "points"
                ? "bg-emerald-400 text-emerald-950 font-bold"
                : "bg-[#10291e] text-emerald-200 hover:text-white"
            }`}
          >
            Point Cloud
          </button>
        </div>
      </div>

      {/* Bottom Exploration Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#0a1811]/95 backdrop-blur-md border-t border-[#183928] z-10 text-xs">
        {/* Color Palette Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-emerald-300/70 font-medium">Aksen:</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setThemeColor("mint")}
              className={`w-5 h-5 rounded-full bg-emerald-400 transition-all ${
                themeColor === "mint" ? "ring-2 ring-white scale-110" : "opacity-70"
              }`}
              title="Mint Green"
            />
            <button
              onClick={() => setThemeColor("cyan")}
              className={`w-5 h-5 rounded-full bg-cyan-400 transition-all ${
                themeColor === "cyan" ? "ring-2 ring-white scale-110" : "opacity-70"
              }`}
              title="Cyber Cyan"
            />
            <button
              onClick={() => setThemeColor("gold")}
              className={`w-5 h-5 rounded-full bg-amber-400 transition-all ${
                themeColor === "gold" ? "ring-2 ring-white scale-110" : "opacity-70"
              }`}
              title="Solar Gold"
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Auto Rotate button */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition ${
              autoRotate
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                : "bg-[#10271d] text-emerald-200/70 border-[#1d4734] hover:text-white"
            }`}
          >
            {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>Rotasi Otomatis</span>
          </button>

          {/* Reset Camera button */}
          <button
            onClick={() => {
              if (controlsRef.current) controlsRef.current.reset();
            }}
            className="p-2 rounded-lg bg-[#10271d] text-emerald-200 hover:text-white border border-[#1d4734] transition"
            title="Reset Posisi Kamera"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-lg bg-[#10271d] text-emerald-200 hover:text-white border border-[#1d4734] transition"
            title={isFullscreen ? "Keluar Layar Penuh" : "Layar Penuh"}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
