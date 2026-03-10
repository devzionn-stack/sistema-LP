import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

// ============================================================================
// PARTICLE SYSTEM - Gerenciador de Partículas de Fogo/Brasa
// ============================================================================

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

class ParticleSystem {
  particles: Particle[] = [];
  private nextId = 0;
  private maxParticles = 50;
  private emissionRate = 3;
  private colors = ['#FFD700', '#FFA500', '#FF6B35', '#FF4500', '#CC0000'];

  emit(x: number, y: number, count: number) {
    for (let i = 0; i < count && this.particles.length < this.maxParticles; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 1.5;
      
      this.particles.push({
        id: this.nextId++,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: -Math.abs(Math.sin(angle) * speed) - 0.5,
        life: 1,
        maxLife: 2 + Math.random(),
        size: 4 + Math.random() * 8,
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
      });
    }
  }

  update(deltaTime: number) {
    this.particles = this.particles.filter((p) => {
      p.life -= deltaTime / 1000;
      p.x += p.vx;
      p.y += p.vy;
      p.vy -= 0.1; // Gravidade
      p.vx *= 0.98; // Atrito
      return p.life > 0;
    });
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.particles.forEach((p) => {
      const opacity = p.life / p.maxLife;
      ctx.fillStyle = p.color + Math.floor(opacity * 255).toString(16).padStart(2, '0');
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
  }
}

// ============================================================================
// VOLUMETRIC SMOKE EFFECT - Fumaça/Calor Volumétrico
// ============================================================================

const VolumetricSmoke: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const animate = () => {
      if (!isActive) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      timeRef.current += 0.016;

      // Limpar com fade
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Desenhar fumaça com Perlin-like noise
      const smokeColor = 'rgba(255, 165, 0, ';
      
      for (let i = 0; i < 5; i++) {
        const x = canvas.width / 2 + Math.sin(timeRef.current * 0.5 + i) * 30;
        const y = canvas.height - 20;
        const size = 40 + Math.sin(timeRef.current * 0.3 + i * 0.5) * 20;
        const opacity = 0.15 * (1 - i / 5);

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
        gradient.addColorStop(0, smokeColor + opacity + ')');
        gradient.addColorStop(1, smokeColor + '0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y - i * 10, size, 0, Math.PI * 2);
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        opacity: 0.6,
      }}
    />
  );
};

// ============================================================================
// PARTICLE CANVAS - Renderização de Partículas
// ============================================================================

const ParticleCanvas: React.FC<{ isActive: boolean; mouseX: number; mouseY: number }> = ({
  isActive,
  mouseX,
  mouseY,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particleSystemRef = useRef(new ParticleSystem());
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef(Date.now());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const animate = () => {
      const now = Date.now();
      const deltaTime = now - lastTimeRef.current;
      lastTimeRef.current = now;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (isActive) {
        // Emitir novas partículas na posição do mouse
        particleSystemRef.current.emit(mouseX, mouseY, 2);
      }

      particleSystemRef.current.update(deltaTime);
      particleSystemRef.current.draw(ctx);

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, mouseX, mouseY]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    />
  );
};

// ============================================================================
// NEUMORPHIC CARD COMPONENT
// ============================================================================

interface NeumorphicCardProps {
  title: string;
  description: string;
  price: number;
  image: string;
  onOrder?: () => void;
}

export const NeumorphicCard: React.FC<NeumorphicCardProps> = ({
  title,
  description,
  price,
  image,
  onOrder,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [glowX, setGlowX] = useState(50);
  const [glowY, setGlowY] = useState(50);

  // Tilt effect com Framer Motion
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const rotateXSpring = useTransform(rotateX, (value) => value);
  const rotateYSpring = useTransform(rotateY, (value) => value);

  const handleMouseMove = useCallback<React.MouseEventHandler<HTMLDivElement>>(
    (e) => {
      if (!cardRef.current || !isHovered) return;

      const rect = cardRef.current.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Calcular rotação (máx 15 graus)
      const rotX = ((y - centerY) / centerY) * 15;
      const rotY = ((x - centerX) / centerX) * -15;

      rotateX.set(rotX);
      rotateY.set(rotY);

      // Atualizar posição do glow
      setGlowX((x / rect.width) * 100);
      setGlowY((y / rect.height) * 100);

      // Atualizar posição das partículas
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    },
    [isHovered, rotateX, rotateY]
  );

  const handleMouseLeave = useCallback<React.MouseEventHandler<HTMLDivElement>>(() => {
    setIsHovered(false);
    rotateX.set(0);
    rotateY.set(0);
  }, [rotateX, rotateY]);

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: rotateXSpring,
        rotateY: rotateYSpring,
        transformStyle: 'preserve-3d',
      }}
      className="relative w-80 h-96 rounded-3xl overflow-hidden cursor-pointer"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Fundo Neumórfico Dark */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] via-[#0f0f0f] to-[#0a0a0a]"
        style={{
          boxShadow: `
            inset 0 1px 0 rgba(255,255,255,0.1),
            inset 0 -1px 0 rgba(0,0,0,0.8),
            0 20px 40px rgba(0,0,0,0.8),
            0 0 60px rgba(255, 107, 53, 0.2)
          `,
        }}
      />

      {/* Metallic Glow Dinâmico */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at ${glowX}% ${glowY}%, rgba(255, 165, 0, 0.3) 0%, transparent 50%)`,
          opacity: isHovered ? 1 : 0.5,
        }}
      />

      {/* Imagem da Pizza */}
      <motion.div
        className="relative h-48 overflow-hidden"
        initial={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.4 }}
      >
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0a0a0a]" />
      </motion.div>

      {/* Conteúdo */}
      <div className="relative p-6 h-48 flex flex-col justify-between">
        <div>
          <motion.h3
            className="text-xl font-bold text-white mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {title}
          </motion.h3>
          <motion.p
            className="text-sm text-gray-400 line-clamp-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {description}
          </motion.p>
        </div>

        <div className="flex items-center justify-between">
          <motion.span
            className="text-2xl font-black text-[#FFA500]"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            R$ {price.toFixed(2)}
          </motion.span>

          <motion.button
            onClick={onOrder}
            className="bg-gradient-to-r from-[#FF6B35] to-[#FF4500] hover:from-[#FF7D4D] hover:to-[#FF6B35] text-white px-4 py-2 rounded-lg font-semibold transition-all"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            Pedir
          </motion.button>
        </div>
      </div>

      {/* Volumetric Smoke */}
      <VolumetricSmoke isActive={isHovered} />

      {/* Particle System */}
      <ParticleCanvas isActive={isHovered} mouseX={mouseX} mouseY={mouseY} />
    </motion.div>
  );
};

export default NeumorphicCard;
