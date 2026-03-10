import React from 'react';
import { Pizza3D } from '@/components/Pizza3D';
import { NeumorphicCard } from '@/components/NeumorphicCard';

export default function ComponentShowcase() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0f0f0f] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-black text-white mb-4">
            Componentes Avançados
          </h1>
          <p className="text-gray-400 text-lg">
            Pizza 3D Hiper 2.5D + Card Neumórfico com Efeitos Cinematográficos
          </p>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Pizza 3D Section */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] rounded-3xl p-6 border border-[#333]">
              <h2 className="text-2xl font-bold text-white mb-4">Pizza 3D</h2>
              <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                Componente 3D com React Three Fiber. Mova o mouse para ver a pizza seguir seu cursor com spring physics suave. Animação procedural de flutuação contínua.
              </p>
              
              <div className="bg-[#0a0a0a] rounded-2xl overflow-hidden h-96 border border-[#222]">
                <Pizza3D />
              </div>

              <div className="mt-6 space-y-3 text-sm text-gray-400">
                <div className="flex items-start gap-3">
                  <span className="text-[#FFA500]">✓</span>
                  <span>Geometria procedural: disco texturizado, queijo e pepperoni</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#FFA500]">✓</span>
                  <span>Animação de flutuação orgânica com respiração suave</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#FFA500]">✓</span>
                  <span>Parallax inverso: pizza segue o cursor com inércia</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#FFA500]">✓</span>
                  <span>Iluminação cinematográfica com Rim Light laranja</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#FFA500]">✓</span>
                  <span>Post-processing: Bloom + Film Grain</span>
                </div>
              </div>
            </div>
          </div>

          {/* Neumorphic Card Section */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] rounded-3xl p-6 border border-[#333]">
              <h2 className="text-2xl font-bold text-white mb-4">Card Neumórfico</h2>
              <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                Card com Tilt 3D, Metallic Glow dinâmico e partículas de fogo. Passe o mouse para ativar efeitos cinematográficos.
              </p>

              <div className="flex justify-center items-center min-h-96 bg-[#0a0a0a] rounded-2xl border border-[#222] p-4">
                <NeumorphicCard
                  title="Mussarela Premium"
                  description="Queijo derretido em massa rústica com orégano fresco"
                  price={38.90}
                  image="https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=1000&auto=format&fit=crop"
                  onOrder={() => alert('Pedido realizado!')}
                />
              </div>

              <div className="mt-6 space-y-3 text-sm text-gray-400">
                <div className="flex items-start gap-3">
                  <span className="text-[#FFA500]">✓</span>
                  <span>Tilt 3D com Framer Motion (máx 15 graus)</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#FFA500]">✓</span>
                  <span>Metallic Glow dinâmico seguindo cursor</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#FFA500]">✓</span>
                  <span>Sistema de partículas (50 máx) com cores quentes</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#FFA500]">✓</span>
                  <span>Fumaça volumétrica procedural</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#FFA500]">✓</span>
                  <span>Pausa automática quando aba perde foco</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="mt-16 bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] rounded-3xl p-8 border border-[#333]">
          <h3 className="text-2xl font-bold text-white mb-6">Especificações Técnicas</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold text-[#FFA500] mb-4">Pizza 3D</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• React Three Fiber + Three.js</li>
                <li>• Geometrias de baixa poligonagem</li>
                <li>• Texturas procedurais em Canvas</li>
                <li>• Spring physics para animação suave</li>
                <li>• EffectComposer com Bloom e Film Grain</li>
                <li>• DPR limitado para performance</li>
                <li>• Suporte a mouse e touch</li>
                <li>• Pausa automática quando aba não está focada</li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-[#FFA500] mb-4">Card Neumórfico</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Framer Motion para animações</li>
                <li>• useMotionValue + useTransform</li>
                <li>• Canvas API para partículas e fumaça</li>
                <li>• ParticleSystem com ciclo de vida</li>
                <li>• Gradientes radiais para glow</li>
                <li>• requestAnimationFrame otimizado</li>
                <li>• Limite de 50 partículas simultâneas</li>
                <li>• Visibilidade API para economia de recursos</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 p-4 bg-[#0a0a0a] rounded-lg border border-[#222]">
            <p className="text-sm text-gray-400">
              <span className="text-[#FFA500] font-semibold">Performance:</span> Ambos os componentes são otimizados para manter 60 FPS consistentes. A Pizza 3D usa geometrias de baixa poligonagem com texturas procedurais. O Card Neumórfico limita partículas e pausa animações quando a aba perde foco.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
