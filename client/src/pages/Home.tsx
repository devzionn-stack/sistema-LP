import React, { useState, useEffect, useMemo, useRef, forwardRef, lazy, Suspense } from 'react';
import { motion, useScroll, useTransform, useMotionTemplate, useMotionValue, AnimatePresence, useSpring, useAnimation, useAnimationFrame } from 'framer-motion';
import { ShoppingBag, Star, Clock, ChefHat, Flame, ArrowRight, Phone, Menu as MenuIcon, Zap, MapPin, Search, Plus, Minus, X, ShoppingCart, Check, ChevronDown, ChevronUp, Trash2, MessageCircle } from 'lucide-react';
import { CATEGORIES, MENU_ITEMS } from '@/data/menu';
import { PizzaBuilderModal } from '@/components/PizzaBuilderModal';
import { CheckoutModal } from '@/components/CheckoutModal';
import { QRCodeSection } from '@/components/QRCodeSection';
import { DeliveryCalculator } from '@/components/DeliveryCalculator';
import { FreteDisplay } from '@/components/FreteDisplay';
import { DeliveryFormModal } from '@/components/DeliveryFormModal';

// Lazy load Pizza3D para não bloquear LCP
const Pizza3DLazy = lazy(() => import('@/components/Pizza3D').then(m => ({ default: m.Pizza3D })));

const PHONE_NUMBER = "5511934195908";
const ADDRESS = "Rua Gentil Fabiano, 182 - Vila Carmosina";
const NEU_BG = "#101010";
const NEU_SHADOW_FLAT = "0 10px 30px -10px rgba(0,0,0,0.8)";
const NEU_SHADOW_PRESSED = "inset 0 4px 15px rgba(0,0,0,0.9)";


const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

// --- COMPONENTES CINEMATOGRÁFICOS & UX ---

// 1. Logo De Gusta (Corrigido para SVG Nativo)
const CinematicLogo = ({ size = "large" }: any) => {
  const isSmall = size === "small";
  const scale = isSmall ? 0.5 : 1;
  
  return (
    <motion.div 
      className="relative flex flex-col items-center justify-center select-none"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
    >
      <div className="relative" style={{ width: 120 * scale, height: 120 * scale }}>
        <motion.svg 
          viewBox="0 0 100 120" 
          className="absolute inset-0 w-full h-full drop-shadow-[0_0_15px_rgba(220,38,38,0.6)]"
          animate={{ filter: ["drop-shadow(0 0 10px rgba(220,38,38,0.4))", "drop-shadow(0 0 20px rgba(220,38,38,0.8))"] }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
        >
          <path d="M50 115 C20 115 5 90 5 60 C5 35 25 5 50 5 C55 15 65 25 65 25 C65 25 60 15 65 5 C85 20 95 45 95 65 C95 95 75 115 50 115 Z" fill="none" stroke="#DC2626" strokeWidth="6" strokeLinecap="round" />
          <motion.path 
            d="M50 105 C30 105 15 85 15 65 C15 50 30 30 50 20 C60 40 70 50 70 50 C70 50 65 40 70 30 C80 45 85 60 85 70 C85 90 70 105 50 105 Z"
            fill="none" stroke="#EF4444" strokeWidth="3" strokeLinecap="round"
            animate={{ d: [
              "M50 105 C30 105 15 85 15 65 C15 50 30 30 50 20 C60 40 70 50 70 50 C70 50 65 40 70 30 C80 45 85 60 85 70 C85 90 70 105 50 105 Z",
              "M50 105 C32 105 17 87 17 67 C17 52 32 32 50 22 C62 42 72 52 72 52 C72 52 67 42 72 32 C82 47 87 62 87 72 C87 92 72 105 50 105 Z"
            ]}}
            transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
          />
        </motion.svg>
        <motion.div 
          className="absolute inset-0 flex items-center justify-center pt-4 pl-1"
          animate={{ rotate: [0, 2, -2, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg width={50 * scale} height={60 * scale} viewBox="0 0 50 60" fill="none">
             <path d="M5 10 L45 10 L25 55 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="2" strokeLinejoin="round" />
             <path d="M2 10 Q25 0 48 10 L45 15 Q25 5 5 15 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
             <circle cx="25" cy="25" r="4" fill="#DC2626" />
             <circle cx="20" cy="35" r="3" fill="#DC2626" />
             <circle cx="30" cy="35" r="3" fill="#DC2626" />
          </svg>
        </motion.div>
      </div>
      {!isSmall && (
        <div className="mt-[-10px] text-center z-10">
          <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5, duration: 0.8 }} className="flex flex-col items-center leading-none">
            <h2 className="text-[#DC2626] font-black text-3xl tracking-wide drop-shadow-lg font-sans">DE</h2>
            <h1 className="text-[#DC2626] font-black text-5xl tracking-tight drop-shadow-xl font-sans scale-y-110">GUSTA</h1>
            <span className="text-[#F59E0B] font-bold text-lg tracking-[0.4em] mt-1 drop-shadow-md">PIZZAS</span>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

// 2. Cinematic Empty State (Radar de Pizza Neon)
const CinematicEmptyState = () => {
  return (
    <div className="relative w-40 h-40 flex items-center justify-center mb-6">
      <div className="absolute inset-0 bg-red-900/10 rounded-full blur-2xl animate-pulse" />
      <motion.div 
        className="w-32 h-32 rounded-full border border-dashed border-white/10 flex items-center justify-center relative bg-[#0f0f0f] shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]"
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
         <svg viewBox="0 0 100 100" className="w-24 h-24 opacity-60">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#333" strokeWidth="1" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
              <motion.line key={i} x1="50" y1="50" x2="50" y2="5" stroke="#DC2626" strokeWidth="0.5" transform={`rotate(${deg} 50 50)`} initial={{ opacity: 0 }} animate={{ opacity: [0.1, 0.4, 0.1] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }} />
            ))}
            {[{x: 60, y: 40}, {x: 40, y: 60}, {x: 50, y: 25}, {x: 70, y: 50}, {x: 30, y: 45}, {x: 50, y: 75}].map((pos, i) => (
               <motion.circle key={i} cx={pos.x} cy={pos.y} r="2" fill="#F59E0B" animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }} transition={{ duration: 1.5 + Math.random(), repeat: Infinity, delay: Math.random() }} />
            ))}
         </svg>
      </motion.div>
      <motion.div className="absolute -top-6 text-white/10" animate={{ y: [-5, -25], opacity: [0, 0.5, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
        <Flame size={20} />
      </motion.div>
    </div>
  );
};

// 3. Animação Procedural 2.5D (Pizza Giratória - Data-Driven & Imagem Corrigida)
// ProceduralPizza removido — substituído por Pizza3D real com Three.js

// 4. Cartão de Pizza Interativo com Hover Cinematográfico
const PizzaCard = ({ item, onAddToCart, onOpenBuilder }: any) => {
  const [isHovered, setIsHovered] = useState(false);
  const controls = useAnimation();

  const handleHover = () => {
    setIsHovered(true);
    controls.start({ scale: 1.05, y: -10 });
  };

  const handleHoverEnd = () => {
    setIsHovered(false);
    controls.start({ scale: 1, y: 0 });
  };

  const handleQuickWhatsApp = (pizzaName: string) => {
    const message = `Olá! 😍🍕\nQuero pedir a pizza sabor ${pizzaName}.\nPode me informar:\n• Tamanhos disponíveis\n• Tempo médio de entrega\nJá estou com vontade de garantir a minha 😋🔥`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${PHONE_NUMBER}?text=${encodedMessage}`, '_blank');
  };

  return (
    <motion.div
      className="relative bg-[#1a1a1a] rounded-2xl overflow-hidden cursor-pointer group"
      onHoverStart={handleHover}
      onHoverEnd={handleHoverEnd}
      animate={controls}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      style={{ boxShadow: NEU_SHADOW_FLAT }}
    >
      {/* Imagem */}
      <div className="relative h-48 overflow-hidden">
        <motion.img 
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
          animate={{ scale: isHovered ? 1.1 : 1 }}
          transition={{ duration: 0.3 }}
        />
        <motion.div 
          className="absolute inset-0 bg-black/40"
          animate={{ opacity: isHovered ? 0.6 : 0 }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
          {item.badges.map((badge: string, i: number) => (
            <motion.span 
              key={i}
              className="px-2 py-1 bg-[#DC2626] text-white text-xs font-bold rounded-full"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              {badge}
            </motion.span>
          ))}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-4 relative z-10">
        <h3 className="text-white font-bold text-lg mb-1">{item.name}</h3>
        <p className="text-gray-400 text-sm mb-3 line-clamp-2">{item.desc}</p>
        
        <div className="flex items-center justify-between">
          <span className="text-[#F59E0B] font-black text-xl">{formatCurrency(item.price)}</span>
          <motion.button
            onClick={() => onOpenBuilder(item)}
            className="bg-[#DC2626] hover:bg-red-700 text-white p-2 rounded-lg transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus size={20} />
          </motion.button>
        </div>
        
        <motion.button
          onClick={() => handleQuickWhatsApp(item.name)}
          className="w-full mt-3 bg-[#25D366] hover:bg-green-600 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          title="Enviar mensagem no WhatsApp"
        >
          <MessageCircle size={18} />
          <span>Pedir Agora</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

// 5. Carrinho Flutuante com Animação de Entrada
const FloatingCart = ({ items, onOpen }: any) => {
  const total = useMemo(() => items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0), [items]);
  const itemCount = useMemo(() => items.reduce((sum: number, item: any) => sum + item.quantity, 0), [items]);

  return (
    <motion.button
      onClick={onOpen}
      className="fixed bottom-6 right-6 z-50 bg-[#DC2626] text-white p-4 rounded-full shadow-2xl flex items-center gap-3"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <ShoppingCart size={24} />
      <div className="flex flex-col items-start">
        <span className="text-xs font-bold">{itemCount} itens</span>
        <span className="text-sm font-black">{formatCurrency(total)}</span>
      </div>
      {itemCount > 0 && (
        <motion.div 
          className="absolute -top-2 -right-2 bg-[#F59E0B] text-black rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
        >
          {itemCount}
        </motion.div>
      )}
    </motion.button>
  );
};

// 6. Modal do Carrinho
const CartModal = ({ isOpen, items, onClose, onRemove, onQuantityChange, onCheckout, deliveryFee = 0, deliveryTime = 0, deliveryZone = '' }: any) => {
  const total = useMemo(() => items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0), [items]);

  const handleWhatsApp = () => {
    const itemsList = items.map((item: any) => `${item.name} x${item.quantity} - ${formatCurrency(item.price * item.quantity)}`).join('\n');
    const message = `Olá! Gostaria de fazer um pedido:\n\n${itemsList}\n\nTotal: ${formatCurrency(total)}\n\nEndereço de entrega: ${ADDRESS}`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${PHONE_NUMBER}?text=${encodedMessage}`, '_blank');
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
            className="bg-[#1a1a1a] w-full rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto"
            initial={{ y: 500 }}
            animate={{ y: 0 }}
            exit={{ y: 500 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-white text-2xl font-bold">Seu Carrinho</h2>
              <motion.button 
                onClick={onClose}
                className="text-gray-400 hover:text-white"
                whileHover={{ scale: 1.1 }}
              >
                <X size={24} />
              </motion.button>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-12">
                <CinematicEmptyState />
                <p className="text-gray-400 text-lg">Seu carrinho está vazio</p>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {items.map((item: any, i: number) => (
                    <motion.div 
                      key={i}
                      className="flex gap-4 bg-[#0f0f0f] p-4 rounded-lg"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <img src={item.image} alt={item.name} className="w-20 h-20 rounded-lg object-cover" />
                      <div className="flex-1">
                        <h4 className="text-white font-bold">{item.name}</h4>
                        <p className="text-[#F59E0B] font-black">{formatCurrency(item.price)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <motion.button 
                          onClick={() => onQuantityChange(i, item.quantity - 1)}
                          className="bg-[#DC2626] text-white p-1 rounded"
                          whileHover={{ scale: 1.1 }}
                        >
                          <Minus size={16} />
                        </motion.button>
                        <span className="text-white font-bold w-8 text-center">{item.quantity}</span>
                        <motion.button 
                          onClick={() => onQuantityChange(i, item.quantity + 1)}
                          className="bg-[#DC2626] text-white p-1 rounded"
                          whileHover={{ scale: 1.1 }}
                        >
                          <Plus size={16} />
                        </motion.button>
                        <motion.button 
                          onClick={() => onRemove(i)}
                          className="bg-red-900 text-white p-1 rounded ml-2"
                          whileHover={{ scale: 1.1 }}
                        >
                          <Trash2 size={16} />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="border-t border-gray-700 pt-4 mb-6">
                  <FreteDisplay 
                    subtotal={total}
                    deliveryFee={deliveryFee}
                    deliveryTime={deliveryTime}
                    deliveryZone={deliveryZone}
                    total={total + deliveryFee}
                  />
                </div>

                <motion.button 
                  onClick={onCheckout}
                  className="w-full bg-[#DC2626] hover:bg-red-700 text-white py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ShoppingCart size={20} />
                  Ir para Pagamento
                </motion.button>
                
                <motion.button 
                  onClick={handleWhatsApp}
                  className="w-full mt-3 bg-[#25D366] hover:bg-green-600 text-white py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Phone size={18} />
                  Ou Finalizar no WhatsApp
                </motion.button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --- COMPONENTE PRINCIPAL ---

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>("Todas");
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedPizza, setSelectedPizza] = useState<any>(null);
  const [isPizzaBuilderOpen, setIsPizzaBuilderOpen] = useState<boolean>(false);
  const [deliveryFee, setDeliveryFee] = useState<number>(0);
  const [deliveryTime, setDeliveryTime] = useState<number>(0);
  const [deliveryZone, setDeliveryZone] = useState<string>('');
  const [isDeliveryFormOpen, setIsDeliveryFormOpen] = useState<boolean>(false);

  const filteredItems = useMemo(() => {
    return MENU_ITEMS.filter((item: any) => {
      const matchCategory = selectedCategory === "Todas" || item.category === selectedCategory;
      const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.desc.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [selectedCategory, searchTerm]);

  const handleAddToCart = (item: any) => {
    setCartItems(prev => {
      const existing = prev.findIndex(i => i.id === item.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing].quantity += 1;
        return updated;
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (index: number) => {
    setCartItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleQuantityChange = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(index);
    } else {
      setCartItems(prev => {
        const updated = [...prev];
        updated[index].quantity = newQuantity;
        return updated;
      });
    }
  };

  const handleOpenPizzaBuilder = (pizza: any) => {
    setSelectedPizza(pizza);
    setIsPizzaBuilderOpen(true);
  };

  const handleAddFromBuilder = (item: any) => {
    setCartItems(prev => {
      const existing = prev.findIndex(i => i.id === item.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing].quantity += item.quantity;
        return updated;
      }
      return [...prev, item];
    });
    setIsCartOpen(true);
  };

  const handleOpenCheckout = () => {
    setIsCartOpen(false);
    setIsDeliveryFormOpen(true);
  };

  const handleDeliveryFormSubmit = (data: any) => {
    setDeliveryFee(data.deliveryFee);
    setDeliveryTime(data.deliveryTime);
    setDeliveryZone(data.zone);
    setIsDeliveryFormOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleCheckoutSuccess = () => {
    setCartItems([]);
    setIsCheckoutOpen(false);
  };

  const handleDeliveryCalculated = (fee: number, time: number, zone: string) => {
    setDeliveryFee(fee);
    setDeliveryTime(time);
    setDeliveryZone(zone);
  };

  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);
  }, [cartItems]);

  const total = useMemo(() => {
    return subtotal + deliveryFee;
  }, [subtotal, deliveryFee]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden">
      {/* Header */}
      <motion.header 
        className="sticky top-0 z-40 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-gray-800"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <CinematicLogo size="small" />
          
          <div className="flex-1 mx-8 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
            <input 
              type="text"
              placeholder="Buscar pizzas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1a1a1a] text-white pl-10 pr-4 py-2 rounded-lg border border-gray-700 focus:border-[#DC2626] outline-none transition-colors"
            />
          </div>

          <div className="flex items-center gap-4">
            <motion.a 
              href={`tel:${PHONE_NUMBER}`}
              className="flex items-center gap-2 bg-[#DC2626] px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              <Phone size={20} />
              <span className="hidden sm:inline">Ligar</span>
            </motion.a>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative py-12 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-6xl font-black mb-4 leading-tight">
                <span className="text-[#DC2626]">Pizzas</span> que <span className="text-[#F59E0B]">Incendeiam</span>
              </h1>
              <p className="text-xl text-gray-400 mb-8">
                Sabor autêntico, ingredientes premium e entrega rápida. Descubra a melhor pizzaria de São Paulo.
              </p>
              <div className="flex gap-4">
                <motion.button 
                  onClick={() => setIsCartOpen(true)}
                  className="bg-[#DC2626] hover:bg-red-700 text-white px-8 py-4 rounded-lg font-bold text-lg flex items-center gap-2 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ShoppingBag size={24} />
                  Ver Cardápio
                </motion.button>
                <motion.a 
                  href={`https://wa.me/${PHONE_NUMBER}?text=Olá! Gostaria de fazer um pedido`}
                  target="_blank"
                  className="bg-[#25D366] hover:bg-green-600 text-white px-8 py-4 rounded-lg font-bold text-lg flex items-center gap-2 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Phone size={24} />
                  WhatsApp
                </motion.a>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 50, scale: 0.75 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
              className="flex justify-center"
            >
              <Suspense fallback={
                <div className="w-64 h-80 rounded-2xl bg-[#1a1a1a] animate-pulse flex items-center justify-center">
                  <div className="w-48 h-48 rounded-full bg-[#2a2a2a] animate-pulse" />
                </div>
              }>
                <Pizza3DLazy className="w-full max-w-sm" />
              </Suspense>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categorias */}
      <section className="py-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div 
            className="flex gap-2 overflow-x-auto pb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {CATEGORIES.map((cat, i) => (
              <motion.button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat 
                    ? 'bg-[#DC2626] text-white' 
                    : 'bg-[#1a1a1a] text-gray-400 hover:text-white'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                {cat}
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Grid de Pizzas */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          {filteredItems.length === 0 ? (
            <div className="text-center py-20">
              <CinematicEmptyState />
              <p className="text-gray-400 text-lg">Nenhuma pizza encontrada</p>
            </div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {filteredItems.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <PizzaCard item={item} onAddToCart={handleAddToCart} onOpenBuilder={handleOpenPizzaBuilder} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Footer */}
      <motion.footer 
        className="border-t border-gray-800 py-12 mt-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <CinematicLogo size="small" />
              <p className="text-gray-400 mt-4">As melhores pizzas de São Paulo, entregues na sua porta.</p>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">Contato</h3>
              <div className="space-y-2 text-gray-400">
                <p className="flex items-center gap-2"><Phone size={16} /> {PHONE_NUMBER}</p>
                <p className="flex items-center gap-2"><MapPin size={16} /> {ADDRESS}</p>
              </div>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">Horário</h3>
              <p className="text-gray-400">Seg - Dom: 18h às 23h</p>
              <p className="text-gray-400">Entrega rápida em toda região</p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-500">
            <p>&copy; 2024 De Gusta Pizzas. Todos os direitos reservados.</p>
          </div>
        </div>
      </motion.footer>

      {/* Seção de Cálculo de Frete */}
      <DeliveryCalculator onFreteCalculated={handleDeliveryCalculated} />

      {/* Seção de QR Code */}
      <QRCodeSection siteUrl={typeof window !== 'undefined' ? window.location.origin : 'https://degustapizzas.com.br'} phoneNumber={PHONE_NUMBER} />

      {/* Carrinho Flutuante */}
      {cartItems.length > 0 && (
        <FloatingCart items={cartItems} onOpen={() => setIsCartOpen(true)} />
      )}

      {/* Modal do Carrinho */}
      <CartModal 
        isOpen={isCartOpen}
        items={cartItems}
        onClose={() => setIsCartOpen(false)}
        onRemove={handleRemoveFromCart}
        onQuantityChange={handleQuantityChange}
        onCheckout={handleOpenCheckout}
        deliveryFee={deliveryFee}
        deliveryTime={deliveryTime}
        deliveryZone={deliveryZone}
      />

      {/* Pizza Builder Modal */}
      {selectedPizza && (
        <PizzaBuilderModal 
          pizza={selectedPizza}
          isOpen={isPizzaBuilderOpen}
          onClose={() => setIsPizzaBuilderOpen(false)}
          onAddToCart={handleAddFromBuilder}
        />
      )}

      {/* Delivery Form Modal */}
      <DeliveryFormModal
        isOpen={isDeliveryFormOpen}
        onClose={() => setIsDeliveryFormOpen(false)}
        onSubmit={handleDeliveryFormSubmit}
        subtotal={subtotal}
      />

      {/* Checkout Modal */}
      <CheckoutModal 
        items={cartItems}
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />
    </div>
  );
}
