import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Loader, AlertCircle, CheckCircle, Map } from 'lucide-react';
import { DeliveryMapModal } from './DeliveryMapModal';

interface DeliveryResult {
  cep: string;
  endereco: string;
  distancia: number;
  frete: number;
  tempo: number;
  zona: string;
  erro?: string;
  pizzariaLat?: number;
  pizzariaLng?: number;
  clienteLat?: number;
  clienteLng?: number;
}

interface DeliveryCalculatorProps {
  onFreteCalculated?: (fee: number, time: number, zone: string) => void;
}

export function DeliveryCalculator({ onFreteCalculated }: DeliveryCalculatorProps = {}) {
  const [cep, setCep] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('degusta_cep') || '';
    }
    return '';
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DeliveryResult | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('degusta_frete_result');
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });
  const [error, setError] = useState<string | null>(null);
  const [isMapOpen, setIsMapOpen] = useState(false);

  // Restaurar frete ao carregar componente
  React.useEffect(() => {
    if (result && result.zona !== 'fora_area' && onFreteCalculated) {
      onFreteCalculated(result.frete, result.tempo, result.zona);
    }
  }, []);

  const handleCalculate = async () => {
    if (!cep || !/^\d{5}-?\d{3}$/.test(cep)) {
      setError('CEP inválido. Use o formato 00000-000.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/delivery/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cep }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erro ao calcular frete');
        return;
      }

      setResult(data);
      // Salvar no localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('degusta_cep', cep);
        localStorage.setItem('degusta_frete_result', JSON.stringify(data));
      }
      // Chamar callback com valores calculados
      if (onFreteCalculated && data.zona !== 'fora_area') {
        onFreteCalculated(data.frete, data.tempo, data.zona);
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCalculate();
    }
  };

  const getZonaLabel = (zona: string) => {
    switch (zona) {
      case 'proxima':
        return '🟢 Zona Próxima';
      case 'normal':
        return '🟡 Zona Normal';
      case 'distante':
        return '🔴 Zona Distante';
      case 'fora_area':
        return '⛔ Fora da Área';
      default:
        return zona;
    }
  };

  return (
    <>
      <motion.section
        className="py-16 px-4 bg-[#0a0a0a]"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="max-w-2xl mx-auto">
          <motion.h2
            className="text-3xl md:text-4xl font-black text-white mb-2 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Calcule seu Frete
          </motion.h2>

          <motion.p
            className="text-gray-400 text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Informe seu CEP para saber o valor da entrega
          </motion.p>

          {/* Input CEP */}
          <motion.div
            className="bg-[#1a1a1a] p-6 rounded-lg border border-gray-700 mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-gray-400 text-sm mb-2 block">CEP</label>
                <input
                  type="text"
                  value={cep}
                  onChange={(e) => setCep(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="00000-000"
                  className="w-full bg-[#0f0f0f] text-white p-3 rounded-lg border border-gray-700 focus:border-[#DC2626] outline-none"
                />
              </div>
              <div className="flex items-end">
                <motion.button
                  onClick={handleCalculate}
                  disabled={loading}
                  className="bg-[#DC2626] hover:bg-red-700 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {loading ? (
                    <>
                      <Loader className="animate-spin" size={20} />
                      Calculando...
                    </>
                  ) : (
                    <>
                      <MapPin size={20} />
                      Calcular
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Erro */}
          <AnimatePresence>
            {error && (
              <motion.div
                className="bg-red-900/20 border border-red-700 text-red-400 p-4 rounded-lg mb-6 flex gap-3"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Resultado */}
          <AnimatePresence>
            {result && !error && (
              <motion.div
                className="bg-[#1a1a1a] border border-gray-700 p-6 rounded-lg space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* Sucesso */}
                {result.zona !== 'fora_area' && (
                  <>
                    <div className="flex items-center gap-3 pb-4 border-b border-gray-700">
                      <CheckCircle className="text-[#25D366]" size={24} />
                      <div>
                        <p className="text-white font-bold">Entrega disponível!</p>
                        <p className="text-gray-400 text-sm">{result.endereco}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Distância */}
                      <div className="bg-[#0f0f0f] p-4 rounded-lg">
                        <p className="text-gray-400 text-sm mb-1">Distância</p>
                        <p className="text-white font-black text-2xl">{result.distancia.toFixed(1)} km</p>
                      </div>

                      {/* Zona */}
                      <div className="bg-[#0f0f0f] p-4 rounded-lg">
                        <p className="text-gray-400 text-sm mb-1">Zona</p>
                        <p className="text-white font-bold">{getZonaLabel(result.zona)}</p>
                      </div>

                      {/* Frete */}
                      <div className="bg-[#0f0f0f] p-4 rounded-lg">
                        <p className="text-gray-400 text-sm mb-1">Taxa de Entrega</p>
                        <p className="text-[#F59E0B] font-black text-2xl">R$ {result.frete.toFixed(2)}</p>
                      </div>

                      {/* Tempo */}
                      <div className="bg-[#0f0f0f] p-4 rounded-lg">
                        <p className="text-gray-400 text-sm mb-1">Tempo Estimado</p>
                        <p className="text-white font-bold">~{result.tempo} min</p>
                      </div>
                    </div>

                    {/* Botão do Mapa */}
                    {result.clienteLat && result.clienteLng && (
                      <motion.button
                        onClick={() => setIsMapOpen(true)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Map size={20} />
                        Ver Rota no Mapa
                      </motion.button>
                    )}

                    <div className="bg-green-900/20 border border-green-700 text-green-400 p-4 rounded-lg text-sm">
                      ✅ Você está na área de entrega. Prossiga com seu pedido!
                    </div>
                  </>
                )}

                {/* Fora da área */}
                {result.zona === 'fora_area' && (
                  <div className="text-center py-6">
                    <AlertCircle className="text-red-500 mx-auto mb-3" size={40} />
                    <p className="text-white font-bold mb-2">Fora da área de entrega</p>
                    <p className="text-gray-400 text-sm">
                      Desculpe, não fazemos entrega para CEPs acima de 15km da pizzaria.
                    </p>
                    <p className="text-gray-500 text-xs mt-3">
                      Distância calculada: {result.distancia.toFixed(1)} km
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Informações - NOVA TABELA DE FRETE */}
          <motion.div
            className="mt-8 bg-[#1a1a1a] p-6 rounded-lg border border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-white font-bold mb-4">📍 Cobertura de Entrega</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">1 - 3 km</span>
                <span className="text-[#25D366] font-bold">R$ 5,00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">&gt; 3 km</span>
                <span className="text-[#F59E0B] font-bold">R$ 5,00 + R$ 1,00/km</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-700">
                <span className="text-gray-400">&gt; 15 km</span>
                <span className="text-red-500 font-bold">Fora da área</span>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-900/20 border border-blue-700 text-blue-400 rounded text-xs">
              📍 <strong>Ponto de partida:</strong> Rua Gentil Fabriano 182, Vila Carmosina
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Modal do Mapa */}
      {result && result.clienteLat && result.clienteLng && result.pizzariaLat && result.pizzariaLng && (
        <DeliveryMapModal
          isOpen={isMapOpen}
          onClose={() => setIsMapOpen(false)}
          clienteLat={result.clienteLat}
          clienteLng={result.clienteLng}
          pizzariaLat={result.pizzariaLat}
          pizzariaLng={result.pizzariaLng}
          distancia={result.distancia}
          frete={result.frete}
          endereco={result.endereco}
        />
      )}
    </>
  );
}

export default DeliveryCalculator;
