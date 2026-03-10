import React from 'react';
import { motion } from 'framer-motion';
import { Truck, Clock, MapPin } from 'lucide-react';

interface FreteDisplayProps {
  subtotal: number;
  deliveryFee: number;
  deliveryTime: number;
  deliveryZone: string;
  total: number;
}

export function FreteDisplay({
  subtotal,
  deliveryFee,
  deliveryTime,
  deliveryZone,
  total
}: FreteDisplayProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const getZonaColor = (zona: string) => {
    switch (zona) {
      case 'proxima':
        return 'text-green-400';
      case 'normal':
        return 'text-yellow-400';
      case 'distante':
        return 'text-orange-400';
      default:
        return 'text-gray-400';
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
      default:
        return 'Sem frete calculado';
    }
  };

  return (
    <motion.div
      className="bg-[#1a1a1a] border border-gray-700 rounded-lg p-4 space-y-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Subtotal */}
      <div className="flex justify-between items-center">
        <span className="text-gray-400 text-sm">Subtotal</span>
        <span className="text-white font-bold">{formatCurrency(subtotal)}</span>
      </div>

      {/* Frete */}
      {deliveryFee > 0 && (
        <>
          <motion.div
            className="flex justify-between items-center py-2 border-t border-gray-700"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-2">
              <Truck size={16} className="text-[#DC2626]" />
              <span className="text-gray-400 text-sm">Taxa de Entrega</span>
            </div>
            <span className="text-[#F59E0B] font-bold">{formatCurrency(deliveryFee)}</span>
          </motion.div>

          {/* Informações de Entrega */}
          <motion.div
            className="bg-[#0f0f0f] p-3 rounded-lg space-y-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2 text-xs">
              <MapPin size={14} className={getZonaColor(deliveryZone)} />
              <span className={`font-bold ${getZonaColor(deliveryZone)}`}>
                {getZonaLabel(deliveryZone)}
              </span>
            </div>
            {deliveryTime > 0 && (
              <div className="flex items-center gap-2 text-xs">
                <Clock size={14} className="text-blue-400" />
                <span className="text-gray-400">
                  Entrega em ~<span className="text-white font-bold">{deliveryTime} min</span>
                </span>
              </div>
            )}
          </motion.div>
        </>
      )}

      {/* Total */}
      <motion.div
        className="flex justify-between items-center pt-3 border-t border-gray-700"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <span className="text-white font-black text-lg">TOTAL</span>
        <span className="text-[#DC2626] font-black text-2xl">{formatCurrency(total)}</span>
      </motion.div>

      {/* Aviso se sem frete */}
      {deliveryFee === 0 && (
        <motion.div
          className="bg-blue-900/20 border border-blue-700 text-blue-400 p-3 rounded-lg text-xs text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          💡 Use o calculador de frete acima para adicionar a taxa de entrega
        </motion.div>
      )}
    </motion.div>
  );
}

export default FreteDisplay;
