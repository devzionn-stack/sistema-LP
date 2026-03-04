import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { PizzaSelection } from '@/types';
import { MENU_ITEMS } from '@/data/menu';

interface PizzaBuilderModalProps {
  pizza: any;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: PizzaSelection) => void;
}

export function PizzaBuilderModal({ pizza, isOpen, onClose, onAddToCart }: PizzaBuilderModalProps) {
  const [step, setStep] = useState<'type' | 'size' | 'half' | 'review'>('type');
  const [pizzaType, setPizzaType] = useState<'whole' | 'half'>('whole');
  const [selectedSize, setSelectedSize] = useState<any>(pizza.sizes[0]);
  const [secondFlavor, setSecondFlavor] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [observation, setObservation] = useState('');

  // Calcular preço final
  const calculatePrice = (): number => {
    if (pizzaType === 'whole') {
      return selectedSize.price;
    } else {
      // Metade-metade: média dos dois sabores
      if (secondFlavor) {
        const secondFlavorSize = secondFlavor.sizes.find((s: any) => s.label === selectedSize.label);
        if (secondFlavorSize) {
          return (selectedSize.price + secondFlavorSize.price) / 2;
        }
      }
      return selectedSize.price;
    }
  };

  const handleAddToCart = () => {
    const selection: PizzaSelection = {
      id: `${pizza.id}-${Date.now()}`,
      type: pizzaType,
      size: selectedSize.label,
      flavor1: pizza.name,
      flavor1Price: selectedSize.price,
      flavor2: pizzaType === 'half' ? secondFlavor?.name : undefined,
      flavor2Price: pizzaType === 'half' ? secondFlavor?.sizes.find((s: any) => s.label === selectedSize.label)?.price : undefined,
      finalPrice: calculatePrice(),
      quantity,
      observation,
      image: pizza.image
    };
    onAddToCart(selection);
    onClose();
  };

  const handleNext = () => {
    if (step === 'type') {
      setStep('size');
    } else if (step === 'size') {
      if (pizzaType === 'half') {
        setStep('half');
      } else {
        setStep('review');
      }
    } else if (step === 'half') {
      setStep('review');
    }
  };

  const handlePrev = () => {
    if (step === 'review') {
      if (pizzaType === 'half') {
        setStep('half');
      } else {
        setStep('size');
      }
    } else if (step === 'half') {
      setStep('size');
    } else if (step === 'size') {
      setStep('type');
    }
  };

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
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-white text-2xl font-bold">Montar Pizza</h2>
              <motion.button
                onClick={onClose}
                className="text-gray-400 hover:text-white"
                whileHover={{ scale: 1.1 }}
              >
                <X size={24} />
              </motion.button>
            </div>

            {/* PASSO 0: Tipo de Pizza */}
            {step === 'type' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-white text-lg font-bold mb-4">Tipo de Pizza</h3>
                
                <motion.button
                  onClick={() => setPizzaType('whole')}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    pizzaType === 'whole'
                      ? 'border-[#DC2626] bg-red-900/20'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="text-left">
                    <p className="text-white font-bold">🍕 Pizza Inteira</p>
                    <p className="text-gray-400 text-sm">Um sabor único</p>
                  </div>
                </motion.button>

                <motion.button
                  onClick={() => setPizzaType('half')}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    pizzaType === 'half'
                      ? 'border-[#DC2626] bg-red-900/20'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="text-left">
                    <p className="text-white font-bold">🍕🍕 Metade-Metade</p>
                    <p className="text-gray-400 text-sm">Dois sabores diferentes</p>
                  </div>
                </motion.button>
              </motion.div>
            )}

            {/* PASSO 1: Tamanho */}
            {step === 'size' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-white text-lg font-bold mb-4">Tamanho</h3>
                
                {pizza.sizes.map((size: any) => (
                  <motion.button
                    key={size.label}
                    onClick={() => setSelectedSize(size)}
                    className={`w-full p-4 rounded-lg border-2 transition-all flex justify-between items-center ${
                      selectedSize.label === size.label
                        ? 'border-[#DC2626] bg-red-900/20'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="text-left">
                      <p className="text-white font-bold">{size.label === 'P' ? 'Pequena' : size.label === 'M' ? 'Média' : 'Grande'}</p>
                      <p className="text-gray-400 text-sm">Tamanho {size.label}</p>
                    </div>
                    <p className="text-[#F59E0B] font-black">R$ {size.price.toFixed(2)}</p>
                  </motion.button>
                ))}
              </motion.div>
            )}

            {/* PASSO 2: Segundo Sabor (se Metade-Metade) */}
            {step === 'half' && pizzaType === 'half' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-white text-lg font-bold mb-4">Escolha o 2º Sabor</h3>
                
                <div className="bg-[#0f0f0f] p-4 rounded-lg mb-4">
                  <p className="text-gray-400 text-sm">1º Sabor: <span className="text-white font-bold">{pizza.name}</span></p>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {MENU_ITEMS.map((item: any) => (
                    <motion.button
                      key={item.id}
                      onClick={() => setSecondFlavor(item)}
                      className={`w-full p-3 rounded-lg text-left border transition-all ${
                        secondFlavor?.id === item.id
                          ? 'border-[#DC2626] bg-red-900/20'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                      whileHover={{ scale: 1.02 }}
                    >
                      <p className="text-white font-bold">{item.name}</p>
                      <p className="text-gray-400 text-sm">{item.desc}</p>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* PASSO 3: Resumo */}
            {step === 'review' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-white text-lg font-bold mb-4">Resumo do Pedido</h3>

                {/* Imagem */}
                <div className="relative h-40 rounded-lg overflow-hidden">
                  <img src={pizza.image} alt={pizza.name} className="w-full h-full object-cover" />
                </div>

                {/* Detalhes */}
                <div className="bg-[#0f0f0f] p-4 rounded-lg space-y-3">
                  <div>
                    <p className="text-gray-400 text-sm">Tipo</p>
                    <p className="text-white font-bold">{pizzaType === 'whole' ? 'Pizza Inteira' : 'Metade-Metade'}</p>
                  </div>

                  <div>
                    <p className="text-gray-400 text-sm">Sabor(es)</p>
                    {pizzaType === 'whole' ? (
                      <p className="text-white font-bold">{pizza.name}</p>
                    ) : (
                      <p className="text-white font-bold">{pizza.name} + {secondFlavor?.name || 'Selecione'}</p>
                    )}
                  </div>

                  <div>
                    <p className="text-gray-400 text-sm">Tamanho</p>
                    <p className="text-white font-bold">{selectedSize.label === 'P' ? 'Pequena' : selectedSize.label === 'M' ? 'Média' : 'Grande'}</p>
                  </div>

                  <div>
                    <p className="text-gray-400 text-sm">Quantidade</p>
                    <div className="flex items-center gap-3 mt-2">
                      <motion.button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="bg-[#DC2626] text-white p-2 rounded"
                        whileHover={{ scale: 1.1 }}
                      >
                        −
                      </motion.button>
                      <span className="text-white font-bold text-lg w-8 text-center">{quantity}</span>
                      <motion.button
                        onClick={() => setQuantity(quantity + 1)}
                        className="bg-[#DC2626] text-white p-2 rounded"
                        whileHover={{ scale: 1.1 }}
                      >
                        +
                      </motion.button>
                    </div>
                  </div>

                  <div>
                    <p className="text-gray-400 text-sm">Observações (opcional)</p>
                    <textarea
                      value={observation}
                      onChange={(e) => setObservation(e.target.value)}
                      placeholder="Ex: Sem cebola, bem crocante..."
                      className="w-full mt-2 p-2 bg-[#1a1a1a] text-white rounded border border-gray-700 focus:border-[#DC2626] outline-none"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Preço */}
                <div className="bg-[#0f0f0f] p-4 rounded-lg border border-[#DC2626]">
                  <div className="flex justify-between items-center">
                    <p className="text-gray-400">Preço unitário:</p>
                    <p className="text-[#F59E0B] font-black text-lg">R$ {calculatePrice().toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-700">
                    <p className="text-white font-bold">Total:</p>
                    <p className="text-[#F59E0B] font-black text-2xl">R$ {(calculatePrice() * quantity).toFixed(2)}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Botões de Navegação */}
            <div className="flex gap-3 mt-8">
              {step !== 'type' && (
                <motion.button
                  onClick={handlePrev}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ChevronLeft size={20} />
                  Voltar
                </motion.button>
              )}

              {step !== 'review' ? (
                <motion.button
                  onClick={handleNext}
                  className="flex-1 bg-[#DC2626] hover:bg-red-700 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Próximo
                  <ChevronRight size={20} />
                </motion.button>
              ) : (
                <motion.button
                  onClick={handleAddToCart}
                  className="flex-1 bg-[#25D366] hover:bg-green-600 text-white py-3 rounded-lg font-bold"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Adicionar ao Carrinho
                </motion.button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default PizzaBuilderModal;
