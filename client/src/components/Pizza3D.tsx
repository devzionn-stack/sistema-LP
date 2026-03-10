/**
 * Pizza3D.tsx — De Gusta Pizzas  
 * Ultra-realista: PBR materials + normal maps procedurais + iluminação cinematográfica
 * Compatível: @react-three/fiber@9 + three@0.183 + @react-three/postprocessing@3
 */

import React, { useEffect, useRef, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import { motion, useMotionValue, useAnimationFrame, useMotionTemplate } from 'framer-motion';
import * as THREE from 'three';

// ─── postprocessing: carregamento seguro ──────────────────────────────────────
let EffectComposer: any = null;
let Bloom: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const pp = require('@react-three/postprocessing');
  EffectComposer = pp.EffectComposer;
  Bloom          = pp.Bloom;
} catch { /* bloom desativado silenciosamente */ }

// ─── Detecção WebGL ───────────────────────────────────────────────────────────
function detectWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch { return false; }
}

// ─── Gerador de normal map procedural ────────────────────────────────────────
// Simula a superfície granulada e irregular de uma massa de pizza assada
function buildNormalMap(size = 512): THREE.DataTexture {
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      // Simplex-like noise usando senos com frequências múltiplas
      const nx = x / size, ny = y / size;
      const h =
        Math.sin(nx * 40 + ny * 37) * 0.3 +
        Math.sin(nx * 23 - ny * 19) * 0.2 +
        Math.sin(nx * 97 + ny * 83) * 0.15 +
        Math.sin(nx * 7  + ny * 11) * 0.35;
      // Derivadas para normal map (R=X, G=Y, B=Z)
      const dhx =
        Math.cos(nx * 40 + ny * 37) * 40 * 0.3 +
        Math.cos(nx * 23 - ny * 19) * 23 * 0.2 +
        Math.cos(nx * 97 + ny * 83) * 97 * 0.15 +
        Math.cos(nx * 7  + ny * 11) * 7  * 0.35;
      const dhy =
        Math.cos(nx * 40 + ny * 37) * 37 * 0.3 -
        Math.cos(nx * 23 - ny * 19) * 19 * 0.2 +
        Math.cos(nx * 97 + ny * 83) * 83 * 0.15 +
        Math.cos(nx * 7  + ny * 11) * 11 * 0.35;
      const scale = 0.04;
      const len = Math.sqrt(dhx * dhx * scale * scale + dhy * dhy * scale * scale + 1);
      data[i    ] = Math.round((-dhx * scale / len * 0.5 + 0.5) * 255); // R = X
      data[i + 1] = Math.round((-dhy * scale / len * 0.5 + 0.5) * 255); // G = Y
      data[i + 2] = Math.round((1 / len * 0.5 + 0.5) * 255);           // B = Z
      data[i + 3] = 255;
    }
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.needsUpdate = true;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

// ─── Textura procedural da massa (color map) ──────────────────────────────────
function buildCrustTexture(size = 1024): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  const ctx = c.getContext('2d')!;

  // Massa base — gradiente radial dourado
  const g = ctx.createRadialGradient(size/2, size/2, 20, size/2, size/2, size/2);
  g.addColorStop(0,   '#F2D06B');
  g.addColorStop(0.45,'#D4A853');
  g.addColorStop(0.72,'#B8863C');
  g.addColorStop(0.88,'#8B5E2A');
  g.addColorStop(1,   '#6B3F18');
  ctx.fillStyle = g; ctx.fillRect(0, 0, size, size);

  // Textura de farinha — pontilhado orgânico
  for (let i = 0; i < 8000; i++) {
    const x = Math.random() * size, y = Math.random() * size;
    const r = Math.random() * 3 + 0.5;
    const bright = Math.random() > 0.5;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = bright
      ? `rgba(255,230,160,${Math.random() * 0.25})`
      : `rgba(80,40,10,${Math.random() * 0.2})`;
    ctx.fill();
  }

  // Bolhas de ar assadas (círculos dourado-escuros)
  for (let i = 0; i < 60; i++) {
    const bx = Math.random() * size * 0.9 + size * 0.05;
    const by = Math.random() * size * 0.9 + size * 0.05;
    const br = Math.random() * 18 + 4;
    const bg = ctx.createRadialGradient(bx - br*0.3, by - br*0.3, 0, bx, by, br);
    bg.addColorStop(0,   'rgba(255,220,120,0.6)');
    bg.addColorStop(0.6, 'rgba(160,90,20,0.4)');
    bg.addColorStop(1,   'rgba(80,30,5,0.7)');
    ctx.beginPath(); ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.fillStyle = bg; ctx.fill();
  }

  // Molho de tomate — círculo central irregular
  const sauceG = ctx.createRadialGradient(size/2, size/2, size*0.05, size/2, size/2, size*0.37);
  sauceG.addColorStop(0,   'rgba(190,35,15,0.92)');
  sauceG.addColorStop(0.6, 'rgba(160,25,10,0.85)');
  sauceG.addColorStop(1,   'rgba(120,15,5,0.0)');
  ctx.beginPath(); ctx.arc(size/2, size/2, size*0.38, 0, Math.PI * 2);
  ctx.fillStyle = sauceG; ctx.fill();

  // Brilho de óleo na massa
  for (let i = 0; i < 30; i++) {
    const ox = Math.random() * size * 0.7 + size * 0.15;
    const oy = Math.random() * size * 0.7 + size * 0.15;
    const or = Math.random() * 12 + 3;
    ctx.beginPath(); ctx.ellipse(ox, oy, or, or * 0.5, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,240,180,${Math.random() * 0.18})`;
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 16;
  return tex;
}

// ─── Textura de queijo derretido ───────────────────────────────────────────────
function buildCheeseColorMap(size = 256): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  const ctx = c.getContext('2d')!;
  // Base amarela-dourada
  ctx.fillStyle = '#F5C842'; ctx.fillRect(0, 0, size, size);
  // Manchas de gratinado
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * size, y = Math.random() * size;
    const r = Math.random() * 8 + 2;
    const dark = Math.random() > 0.6;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = dark ? `rgba(160,85,10,${Math.random()*0.5})` : `rgba(255,230,100,${Math.random()*0.4})`;
    ctx.fill();
  }
  // Brilho de gordura
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * size, y = Math.random() * size;
    ctx.beginPath(); ctx.arc(x, y, Math.random() * 5 + 1, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,200,${Math.random()*0.3})`;
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  return tex;
}

// ─── Textura de pepperoni ──────────────────────────────────────────────────────
function buildPepperoniMap(size = 128): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  const ctx = c.getContext('2d')!;
  // Base vermelha com gradiente radial (efeito curvatura)
  const g = ctx.createRadialGradient(size*0.4, size*0.35, 2, size/2, size/2, size/2);
  g.addColorStop(0,   '#E84040');
  g.addColorStop(0.5, '#C02020');
  g.addColorStop(0.85,'#8B1010');
  g.addColorStop(1,   '#5A0808');
  ctx.beginPath(); ctx.arc(size/2, size/2, size/2 - 2, 0, Math.PI * 2);
  ctx.fillStyle = g; ctx.fill();
  // Pontinhos de gordura
  for (let i = 0; i < 25; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = Math.random() * size * 0.35;
    const x = size/2 + Math.cos(angle) * r;
    const y = size/2 + Math.sin(angle) * r;
    ctx.beginPath(); ctx.arc(x, y, Math.random() * 4 + 1, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,180,100,${Math.random()*0.35})`;
    ctx.fill();
  }
  // Borda queimada
  const borderG = ctx.createRadialGradient(size/2, size/2, size*0.38, size/2, size/2, size/2);
  borderG.addColorStop(0,   'rgba(0,0,0,0)');
  borderG.addColorStop(0.7, 'rgba(0,0,0,0)');
  borderG.addColorStop(1,   'rgba(0,0,0,0.5)');
  ctx.beginPath(); ctx.arc(size/2, size/2, size/2 - 1, 0, Math.PI * 2);
  ctx.fillStyle = borderG; ctx.fill();

  const tex = new THREE.CanvasTexture(c);
  return tex;
}

// ─── Textura de roughness para a crosta ───────────────────────────────────────
function buildRoughnessMap(size = 512): THREE.DataTexture {
  const data = new Uint8Array(size * size * 4);
  for (let i = 0; i < size * size * 4; i += 4) {
    const x = (i / 4) % size, y = Math.floor(i / 4 / size);
    const nx = x / size, ny = y / size;
    // Área de borda mais rugosa, centro mais liso (molho)
    const dist = Math.sqrt((nx - 0.5) ** 2 + (ny - 0.5) ** 2) * 2;
    const base = 0.6 + dist * 0.3;
    const noise = Math.sin(nx * 60) * Math.sin(ny * 60) * 0.08;
    const v = Math.round(Math.min(1, Math.max(0, base + noise)) * 220);
    data[i] = data[i+1] = data[i+2] = v;
    data[i+3] = 255;
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.needsUpdate = true;
  return tex;
}

// ─── Ambiente Map (fake IBL com gradiente esférico) ───────────────────────────
function buildEnvMap(): THREE.CubeTexture {
  // Cria 6 faces de uma CubeTexture (32x32 cada) com cores quentes de "forno"
  const size = 32;
  const faces = [
    { top: '#FF6B20', bot: '#1a0800' }, // +X right
    { top: '#FF4500', bot: '#110500' }, // -X left
    { top: '#FFA040', bot: '#FF6B20' }, // +Y top (sky = calor do forno)
    { top: '#0a0300', bot: '#0a0300' }, // -Y bottom (chão escuro)
    { top: '#FF5520', bot: '#1a0500' }, // +Z front
    { top: '#FF6030', bot: '#150400' }, // -Z back
  ];
  const canvases = faces.map(({ top, bot }) => {
    const c = document.createElement('canvas');
    c.width = size; c.height = size;
    const ctx = c.getContext('2d')!;
    const g = ctx.createLinearGradient(0, 0, 0, size);
    g.addColorStop(0, top); g.addColorStop(1, bot);
    ctx.fillStyle = g; ctx.fillRect(0, 0, size, size);
    return c;
  });
  const loader = new THREE.CubeTextureLoader();
  // Hack: usar CubeTexture diretamente das canvas
  const cubeTexture = new THREE.CubeTexture(canvases as any);
  cubeTexture.needsUpdate = true;
  return cubeTexture;
}

// ─── PIZZA MESH — ultra-realista ──────────────────────────────────────────────
interface PizzaMeshProps { mouseX: number; mouseY: number }

const PizzaMesh: React.FC<PizzaMeshProps> = ({ mouseX, mouseY }) => {
  const groupRef  = useRef<THREE.Group>(null!);
  const steamRefs = useRef<THREE.Mesh[]>([]);
  const tX = useRef(0), tY = useRef(0), cX = useRef(0), cY = useRef(0);

  // ── Geometrias ────────────────────────────────────────────────────────────
  // Pizza: disco com geometria mais segmentada para normal map funcionar bem
  const pizzaGeo = useMemo(() => {
    const geo = new THREE.CylinderGeometry(2.05, 2.15, 0.28, 64, 8);
    // Deformar vértices levemente para borda irregular (orgânica)
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const x = pos.getX(i), z = pos.getZ(i);
      const r = Math.sqrt(x * x + z * z);
      if (r > 1.8 && Math.abs(y) < 0.15) {
        // Borda irregular
        const bump = (Math.sin(Math.atan2(z, x) * 12) * 0.03 +
                      Math.sin(Math.atan2(z, x) * 7)  * 0.02);
        const angle = Math.atan2(z, x);
        pos.setX(i, x + Math.cos(angle) * bump);
        pos.setZ(i, z + Math.sin(angle) * bump);
        pos.setY(i, y + Math.sin(Math.atan2(z, x) * 18) * 0.015);
      }
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  // Queijo: blob orgânico (IcosahedronGeometry deformado)
  const cheeseGeo = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(1, 2);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      const noise = Math.sin(x * 8) * Math.cos(z * 6) * 0.12 + Math.sin(y * 10) * 0.08;
      const len = Math.sqrt(x*x + y*y + z*z);
      pos.setXYZ(i, x/len * (1 + noise), y/len * (1 + noise) * 0.6, z/len * (1 + noise));
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  const pepperoniGeo = useMemo(() => new THREE.CylinderGeometry(0.26, 0.25, 0.06, 32, 1), []);

  // ── Materiais PBR ultra-realistas ─────────────────────────────────────────
  const pizzaMat = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      map:          buildCrustTexture(1024),
      normalMap:    buildNormalMap(512),
      roughnessMap: buildRoughnessMap(512),
      roughness:    0.82,
      metalness:    0.0,
      normalScale:  new THREE.Vector2(1.8, 1.8), // força do relevo
      side:         THREE.DoubleSide,
      envMapIntensity: 0.6,
    });
    return mat;
  }, []);

  const cheeseMat = useMemo(() => new THREE.MeshStandardMaterial({
    map:             buildCheeseColorMap(256),
    color:           new THREE.Color(0xF5C030),
    roughness:       0.25,   // queijo derretido = brilhoso
    metalness:       0.0,
    emissive:        new THREE.Color(0xFF8800),
    emissiveIntensity: 0.08,
    envMapIntensity: 1.2,
  }), []);

  const pepperoniMat = useMemo(() => new THREE.MeshStandardMaterial({
    map:             buildPepperoniMap(128),
    color:           new THREE.Color(0xCC2020),
    roughness:       0.55,
    metalness:       0.05,
    emissive:        new THREE.Color(0xFF3000),
    emissiveIntensity: 0.04,
    envMapIntensity: 0.5,
  }), []);

  // Vapor: partículas translúcidas
  const steamMat = useMemo(() => new THREE.MeshBasicMaterial({
    color:       0xFFFFFF,
    transparent: true,
    opacity:     0.0,
    depthWrite:  false,
  }), []);

  // ── Posições procedurais (seed determinístico) ────────────────────────────
  const cheesePos = useMemo(() => Array.from({ length: 16 }, (_, i) => {
    const angle = (i / 16) * Math.PI * 2 + (i % 3) * 0.4;
    const r = 0.3 + (i % 5) * 0.28;
    return {
      x: Math.cos(angle) * r,
      z: Math.sin(angle) * r,
      sy: 0.55 + (i % 4) * 0.06,          // achatamento Y (queijo derretido)
      sx: 0.13 + (i % 3) * 0.035,
      ry: (i * 1.17) % (Math.PI * 2),
    };
  }), []);

  const pepPos = useMemo(() => Array.from({ length: 9 }, (_, i) => {
    const angle = (i / 9) * Math.PI * 2 + 0.22;
    const ring  = i < 5 ? 0.85 : 1.45;
    return {
      x:  Math.cos(angle) * ring + (i % 3 - 1) * 0.08,
      z:  Math.sin(angle) * ring + (i % 2 - 0.5) * 0.08,
      ry: (i * 0.79) % (Math.PI * 2),
    };
  }), []);

  // Steam positions
  const steamPos = useMemo(() => Array.from({ length: 8 }, (_, i) => ({
    x: (Math.cos(i * 0.8) * 0.6),
    z: (Math.sin(i * 0.8) * 0.6),
    phase: i * 0.7,
  })), []);

  // ── Animation loop ────────────────────────────────────────────────────────
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const w = window.innerWidth, h = window.innerHeight;
    // Parallax suave pelo mouse
    tX.current = ((mouseY - h / 2) / (h / 2)) * 0.28;
    tY.current = ((mouseX - w / 2) / (w / 2)) * 0.28;
    cX.current += (tX.current - cX.current) * 0.06;  // spring inércia
    cY.current += (tY.current - cY.current) * 0.06;
    const t = clock.elapsedTime;
    // Flutuação orgânica com múltiplos senos (Lissajous suave)
    groupRef.current.position.y = Math.sin(t * 0.48) * 0.22 + Math.sin(t * 0.31) * 0.08;
    groupRef.current.rotation.x = cX.current + Math.cos(t * 0.27) * 0.035;
    groupRef.current.rotation.y = cY.current + t * 0.055;               // gira lentamente
    groupRef.current.rotation.z = Math.sin(t * 0.19) * 0.045;

    // Steam: vapor sobe e desaparece
    steamRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const p = steamPos[i];
      const cycle = ((t * 0.4 + p.phase) % 2.0);
      mesh.position.y  = 0.2 + cycle * 0.6;
      mesh.scale.setScalar(0.04 + cycle * 0.06);
      const mat = mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = cycle < 1.0 ? cycle * 0.12 : (2.0 - cycle) * 0.12;
    });
  });

  return (
    <group ref={groupRef}>
      {/* ── Disco principal da pizza ── */}
      <mesh geometry={pizzaGeo} material={pizzaMat} receiveShadow castShadow />

      {/* ── Queijo derretido ── */}
      {cheesePos.map((p, i) => (
        <mesh
          key={`ch${i}`}
          geometry={cheeseGeo}
          material={cheeseMat}
          position={[p.x, 0.18, p.z]}
          rotation={[0, p.ry, 0]}
          scale={[p.sx, p.sy * p.sx, p.sx]}
          castShadow
        />
      ))}

      {/* ── Pepperoni ── */}
      {pepPos.map((p, i) => (
        <mesh
          key={`pp${i}`}
          geometry={pepperoniGeo}
          material={pepperoniMat}
          position={[p.x, 0.155, p.z]}
          rotation={[Math.PI / 2, 0, p.ry]}
          castShadow
        />
      ))}

      {/* ── Vapor (partículas de calor) ── */}
      {steamPos.map((p, i) => (
        <mesh
          key={`st${i}`}
          ref={el => { if (el) steamRefs.current[i] = el; }}
          position={[p.x, 0.3, p.z]}
          material={steamMat}
        >
          <sphereGeometry args={[1, 6, 6]} />
        </mesh>
      ))}
    </group>
  );
};

// ─── ILUMINAÇÃO CINEMATOGRÁFICA ────────────────────────────────────────────────
// Sistema PBR com 6 luzes estratégicas para simular ambiente de pizzaria
const CinematicLighting: React.FC = () => {
  const { scene } = useThree();

  useEffect(() => {
    // 1. Ambient — preenchimento geral quente (simula luz ambiente da pizzaria)
    const ambient = new THREE.AmbientLight(0xFFD08080, 0.4);

    // 2. Key light — luz principal de cima/frente (forno a lenha)
    const key = new THREE.SpotLight(0xFFE8C0, 3.5, 18, Math.PI * 0.18, 0.3, 1.5);
    key.position.set(2, 7, 4);
    key.target.position.set(0, 0, 0);
    key.castShadow = true;
    key.shadow.mapSize.width  = 1024;
    key.shadow.mapSize.height = 1024;

    // 3. Rim light esquerda — laranja quente (chama do forno)
    const rimL = new THREE.PointLight(0xFF5010, 2.2, 10, 1.8);
    rimL.position.set(-4, 2, -2);

    // 4. Rim light direita — vermelho de brasa
    const rimR = new THREE.PointLight(0xFF2200, 1.4, 8, 2.0);
    rimR.position.set(4, 1, -3);

    // 5. Fill light frontal suave — azul frio para contrastar
    const fill = new THREE.PointLight(0x8080FF, 0.4, 12, 2.5);
    fill.position.set(0, -2, 6);

    // 6. Top accent — luz quente bem de cima (calor)
    const top = new THREE.PointLight(0xFFAA40, 1.0, 6, 2.0);
    top.position.set(0, 5, 0);

    const lights = [ambient, key, key.target, rimL, rimR, fill, top];
    lights.forEach(l => scene.add(l));

    // Environment map para reflecções PBR
    const envMap = buildEnvMap();
    scene.environment = envMap;

    return () => {
      lights.forEach(l => scene.remove(l));
      scene.environment = null;
    };
  }, [scene]);

  return null;
};

// ─── Bloom seguro ─────────────────────────────────────────────────────────────
const SafeBloom: React.FC = () => {
  if (!EffectComposer || !Bloom) return null;
  return (
    <EffectComposer>
      <Bloom
        luminanceThreshold={0.2}
        luminanceSmoothing={0.9}
        intensity={0.9}
        mipmapBlur
      />
    </EffectComposer>
  );
};

// ─── FALLBACK CSS 2.5D ────────────────────────────────────────────────────────
// Quando WebGL indisponível — mantém experiência visual com Framer Motion puro
export const FallbackPizza2D: React.FC = () => {
  const y      = useMotionValue(0);
  const rotX   = useMotionValue(0);
  const rotZ   = useMotionValue(0);
  const shadow = useMotionValue(1);

  useAnimationFrame((t) => {
    const floatY = Math.sin(t / 900) * 18 + Math.sin(t / 400) * 4;
    y.set(floatY);
    rotX.set(Math.cos(t / 1200) * 10);
    rotZ.set(Math.sin(t / 1800) * 5);
    shadow.set(1 - Math.abs(Math.sin(t / 900)) * 0.3);
  });

  const transform = useMotionTemplate`perspective(1100px) rotateX(${rotX}deg) rotateZ(${rotZ}deg)`;

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 300, height: 300 }}>
      {/* Sombra dinâmica */}
      <motion.div style={{
        position: 'absolute', bottom: 8, left: '50%', x: '-50%',
        width: 200, height: 32, borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(220,38,38,0.45) 0%, transparent 70%)',
        filter: 'blur(14px)',
        scaleX: shadow,
      }} />

      <motion.div style={{ transform, y, position: 'relative' }}>
        {/* Pizza rotacionando */}
        <motion.div
          style={{
            width: 240, height: 240, borderRadius: '50%', overflow: 'hidden',
            boxShadow: '0 0 60px rgba(255,80,0,0.5), 0 30px 80px rgba(0,0,0,0.9), inset 0 0 30px rgba(0,0,0,0.4)',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        >
          <img
            src="https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=600&auto=format&fit=crop"
            alt="Pizza De Gusta"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </motion.div>

        {/* Rim light cónico girando */}
        <motion.div style={{
          position: 'absolute', inset: -4, borderRadius: '50%', pointerEvents: 'none',
          background: 'conic-gradient(from 0deg, rgba(255,80,0,0.5) 0deg, transparent 60deg, rgba(255,40,0,0.2) 180deg, transparent 240deg, rgba(255,100,20,0.4) 300deg, transparent 360deg)',
        }}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        />

        {/* Brilho specular estático */}
        <div style={{
          position: 'absolute', top: '15%', left: '20%', width: '30%', height: '20%',
          borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(255,255,240,0.35) 0%, transparent 100%)',
          filter: 'blur(6px)', pointerEvents: 'none',
          transform: 'rotate(-30deg)',
        }} />
      </motion.div>
    </div>
  );
};

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export const Pizza3D: React.FC<{ className?: string }> = ({ className }) => {
  const [mouseX, setMouseX] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth / 2 : 400
  );
  const [mouseY, setMouseY] = useState(() =>
    typeof window !== 'undefined' ? window.innerHeight / 2 : 300
  );
  const [hasWebGL]          = useState(() => detectWebGL());
  const [webglError, setWebglError] = useState(false);

  useEffect(() => {
    const onMove  = (e: MouseEvent) => { setMouseX(e.clientX); setMouseY(e.clientY); };
    const onTouch = (e: TouchEvent) => {
      if (e.touches[0]) { setMouseX(e.touches[0].clientX); setMouseY(e.touches[0].clientY); }
    };
    window.addEventListener('mousemove', onMove,  { passive: true });
    window.addEventListener('touchmove', onTouch, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onTouch);
    };
  }, []);

  if (!hasWebGL || webglError) return <FallbackPizza2D />;

  return (
    <div
      className={className}
      style={{ width: '100%', height: 380, minHeight: 300, position: 'relative' }}
    >
      <Suspense fallback={<FallbackPizza2D />}>
        <Canvas
          shadows                                      // habilita shadow map global
          camera={{ position: [0, 2.2, 5.5], fov: 42 }}
          gl={{
            antialias:                    true,
            alpha:                        true,
            powerPreference:              'high-performance',
            failIfMajorPerformanceCaveat: false,
            toneMapping:                  THREE.ACESFilmicToneMapping,  // cinema look
            toneMappingExposure:          1.15,
          }}
          dpr={[1, Math.min(
            typeof window !== 'undefined' ? window.devicePixelRatio : 1,
            2.0                                        // até 2x em telas Retina
          )]}
          onCreated={({ gl }) => {
            gl.domElement.addEventListener('webglcontextlost', () => setWebglError(true));
          }}
        >
          <CinematicLighting />
          <PizzaMesh mouseX={mouseX} mouseY={mouseY} />
          <Suspense fallback={null}>
            <SafeBloom />
          </Suspense>
        </Canvas>
      </Suspense>
    </div>
  );
};

export default Pizza3D;
