import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader, AlertCircle, CheckCircle, MapPin } from 'lucide-react';

interface DeliveryFormData {
  name: string;
  phone: string;
  email: string;
  address: string;
  cep: string;
}

interface DeliveryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DeliveryFormData & { deliveryFee: number; deliveryTime: number; zone: string }) => void;
  subtotal: number;
}

const PIZZARIA_CEP = '01310100'; // CEP da pizzaria (Av. Paulista, SP)
const PIZZARIA_LAT = -23.5615;
const PIZZARIA_LNG = -46.6560;

// Haversine formula para calcular distância
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // Raio da Terra em km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Calcular frete baseado na distância
const calculateDeliveryFee = (distance: number): { fee: number; time: number; zone: string } => {
  if (distance > 15) {
    return { fee: 0, time: 0, zone: 'fora_area' };
  } else if (distance <= 3) {
    return { fee: 5.0, time: 20, zone: 'proxima' };
  } else if (distance <= 8) {
    const fee = 5.0 + (distance - 3) * 1.8;
    return { fee: Math.round(fee * 100) / 100, time: 25 + Math.floor((distance - 3) * 3), zone: 'normal' };
  } else {
    const fee = 5.0 + 5 * 1.8 + 3.0;
    return { fee: Math.round(fee * 100) / 100, time: 40 + Math.floor((distance - 8) * 2), zone: 'distante' };
  }
};

export function DeliveryFormModal({ isOpen, onClose, onSubmit, subtotal }: DeliveryFormModalProps) {
  const [formData, setFormData] = useState<DeliveryFormData>({
    name: '',
    phone: '',
    email: '',
    address: '',
    cep: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deliveryInfo, setDeliveryInfo] = useState<{ fee: number; time: number; zone: string } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCalculateDelivery = useCallback(async () => {
    if (!formData.cep || !/^\d{5}-?\d{3}$/.test(formData.cep)) {
      setError('CEP inválido. Use o formato 00000-000.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/delivery/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cep: formData.cep }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erro ao calcular frete');
        return;
      }

      const deliveryData = calculateDeliveryFee(data.distancia);
      setDeliveryInfo(deliveryData);

      if (deliveryData.zone === 'fora_area') {
        setError('Endereço fora da área de entrega (máximo 15 km)');
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [formData.cep]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone || !formData.email || !formData.address || !formData.cep) {
      setError('Preencha todos os campos');
      return;
    }

    if (!deliveryInfo) {
      setError('Calcule o frete antes de continuar');
      return;
    }

    if (deliveryInfo.zone === 'fora_area') {
      setError('Endereço fora da área de entrega');
      return;
    }

    onSubmit({
      ...formData,
      deliveryFee: deliveryInfo.fee,
      deliveryTime: deliveryInfo.time,
      zone: deliveryInfo.zone,
    });
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const total = subtotal + (deliveryInfo?.fee || 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 z-50 flex items-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-[#1a1a1a] w-full rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto"
            initial={{ y: 500 }}
            animate={{ y: 0 }}
            exit={{ y: 500 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-white text-2xl font-bold">Dados de Entrega</h2>
              <motion.button
                onClick={onClose}
                className="text-gray-400 hover:text-white"
                whileHover={{ scale: 1.1 }}
              >
                <X size={24} />
              </motion.button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nome */}
              <div>
                <label className="block text-gray-400 text-sm font-bold mb-2">Nome Completo</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Seu nome"
                  className="w-full bg-[#0f0f0f] text-white border border-gray-700 rounded-lg px-4 py-3 focus:border-[#DC2626] outline-none transition-colors"
                />
              </div>

              {/* Telefone */}
              <div>
                <label className="block text-gray-400 text-sm font-bold mb-2">Telefone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="(11) 99999-9999"
                  className="w-full bg-[#0f0f0f] text-white border border-gray-700 rounded-lg px-4 py-3 focus:border-[#DC2626] outline-none transition-colors"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-gray-400 text-sm font-bold mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="seu@email.com"
                  className="w-full bg-[#0f0f0f] text-white border border-gray-700 rounded-lg px-4 py-3 focus:border-[#DC2626] outline-none transition-colors"
                />
              </div>

              {/* Endereço */}
              <div>
                <label className="block text-gray-400 text-sm font-bold mb-2">Endereço Completo</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Rua, número, complemento"
                  className="w-full bg-[#0f0f0f] text-white border border-gray-700 rounded-lg px-4 py-3 focus:border-[#DC2626] outline-none transition-colors"
                />
              </div>

              {/* CEP */}
              <div>
                <label className="block text-gray-400 text-sm font-bold mb-2">CEP</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="cep"
                    value={formData.cep}
                    onChange={handleInputChange}
                    placeholder="00000-000"
                    className="flex-1 bg-[#0f0f0f] text-white border border-gray-700 rounded-lg px-4 py-3 focus:border-[#DC2626] outline-none transition-colors"
                  />
                  <motion.button
                    type="button"
                    onClick={handleCalculateDelivery}
                    disabled={loading}
                    className="bg-[#DC2626] hover:bg-red-700 disabled:bg-gray-600 text-white font-bold px-6 rounded-lg transition-colors flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {loading ? <Loader size={18} className="animate-spin" /> : <MapPin size={18} />}
                    {loading ? 'Calculando...' : 'Calcular'}
                  </motion.button>
                </div>
              </div>

              {/* Mensagem de erro */}
              {error && (
                <motion.div
                  className="bg-red-900/20 border border-red-700 text-red-400 p-3 rounded-lg flex items-center gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <AlertCircle size={18} />
                  <span className="text-sm">{error}</span>
                </motion.div>
              )}

              {/* Resultado do frete */}
              {deliveryInfo && deliveryInfo.zone !== 'fora_area' && (
                <motion.div
                  className="bg-[#0f0f0f] border border-green-700 p-4 rounded-lg"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle size={20} className="text-green-400" />
                    <span className="text-green-400 font-bold">Frete Calculado</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Subtotal:</span>
                      <span className="text-white font-bold">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Taxa de Entrega:</span>
                      <span className="text-[#F59E0B] font-bold">{formatCurrency(deliveryInfo.fee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Tempo Estimado:</span>
                      <span className="text-blue-400 font-bold">~{deliveryInfo.time} min</span>
                    </div>
                    <div className="border-t border-gray-700 pt-2 mt-2 flex justify-between">
                      <span className="text-white font-black">TOTAL:</span>
                      <span className="text-[#DC2626] font-black text-lg">{formatCurrency(total)}</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Botão de envio */}
              <motion.button
                type="submit"
                disabled={!deliveryInfo || deliveryInfo.zone === 'fora_area'}
                className="w-full bg-[#DC2626] hover:bg-red-700 disabled:bg-gray-600 text-white py-4 rounded-lg font-bold text-lg transition-colors mt-6"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Continuar para Pagamento
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default DeliveryFormModal;
