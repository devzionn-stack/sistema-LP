import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Check, Loader, AlertCircle, CreditCard } from 'lucide-react';
import { CheckoutData, PizzaSelection } from '@/types';

interface CheckoutModalProps {
  items: PizzaSelection[];
  isOpen: boolean;
  onClose: () => void;
}

const DELIVERY_FEE = 5.00;

export function CheckoutModal({ items, isOpen, onClose }: CheckoutModalProps) {
  const [step, setStep] = useState<'personal' | 'address' | 'review' | 'payment' | 'processing' | 'success'>('personal');
  const [loading, setLoading] = useState(false);
  const [pixQrCode, setPixQrCode] = useState<string | null>(null);
  const [pixCopiaECola, setPixCopiaECola] = useState<string | null>(null);
  const [chargeId, setChargeId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Estados para cartão de crédito
  const [cardData, setCardData] = useState({
    number: '',
    holderName: '',
    expiry: '',
    cvv: '',
    cpf: ''
  });
  const [installments, setInstallments] = useState(1);
  const [cardError, setCardError] = useState<string | null>(null);
  const [pixCopiado, setPixCopiado] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [formData, setFormData] = useState<CheckoutData>({
    name: '',
    phone: '',
    email: '',
    deliveryType: 'delivery',
    address: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      cep: ''
    },
    items,
    subtotal: calculateSubtotal(items),
    deliveryFee: DELIVERY_FEE,
    total: 0,
    paymentMethod: 'pix'
  });

  function calculateSubtotal(pizzas: PizzaSelection[]): number {
    return pizzas.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);
  }

  useEffect(() => {
    const subtotal = calculateSubtotal(formData.items);
    const deliveryFee = formData.deliveryType === 'delivery' ? DELIVERY_FEE : 0;
    setFormData(prev => ({
      ...prev,
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee
    }));
  }, [formData.deliveryType, formData.items]);

  useEffect(() => {
    if (!isOpen) {
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
      setStep('personal');
      setPixQrCode(null);
      setPixCopiaECola(null);
      setChargeId(null);
      setError(null);
      setCardError(null);
      setPixCopiado(false);
      setCardData({ number: '', holderName: '', expiry: '', cvv: '', cpf: '' });
      setInstallments(1);
    }
  }, [isOpen]);

  const validatePersonal = (): boolean => {
    if (!formData.name.trim() || formData.name.length < 3) return false;
    if (!formData.phone.trim() || formData.phone.length < 10) return false;
    if (!formData.email.trim() || !formData.email.includes('@')) return false;
    return true;
  };

  const validateAddress = (): boolean => {
    if (formData.deliveryType === 'pickup') return true;
    if (!formData.address?.street?.trim()) return false;
    if (!formData.address?.number?.trim()) return false;
    if (!formData.address?.neighborhood?.trim()) return false;
    if (!formData.address?.city?.trim()) return false;
    if (!formData.address?.cep?.trim()) return false;
    return true;
  };

  const handleNext = () => {
    if (step === 'personal' && !validatePersonal()) {
      alert('Por favor, preencha todos os dados pessoais corretamente');
      return;
    }
    if (step === 'address' && !validateAddress()) {
      alert('Por favor, preencha todos os dados de endereço');
      return;
    }

    const steps: Array<'personal' | 'address' | 'review' | 'payment' | 'processing' | 'success'> = ['personal', 'address', 'review', 'payment', 'processing', 'success'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    }
  };

  const handlePrev = () => {
    const steps: Array<'personal' | 'address' | 'review' | 'payment' | 'processing' | 'success'> = ['personal', 'address', 'review', 'payment', 'processing', 'success'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    }
  };

  const handleProcessPayment = async () => {
    setError(null);
    setCardError(null);

    // PIX
    if (formData.paymentMethod === 'pix') {
      setStep('processing');
      try {
        const customerRes = await fetch('/api/checkout/create-customer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            mobilePhone: formData.phone.replace(/\D/g, ''),
            email: formData.email
          })
        });
        const customerJson = await customerRes.json();
        if (!customerJson.customerId) throw new Error(customerJson.error || 'Erro ao criar cliente');
        const { customerId } = customerJson;

        const chargeRes = await fetch('/api/checkout/create-charge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerId,
            value: formData.total,
            description: `Pedido De Gusta Pizzas - ${formData.items.map(i => i.flavor1).join(', ')}`
          })
        });
        const chargeJson = await chargeRes.json();
        if (!chargeJson.chargeId) throw new Error(chargeJson.error || 'Erro ao gerar PIX');

        setChargeId(chargeJson.chargeId);
        setPixQrCode(chargeJson.pixQrCode);
        setPixCopiaECola(chargeJson.pixCopiaECola);
        setStep('payment');

        if (pollRef.current) clearInterval(pollRef.current);
        pollRef.current = setInterval(async () => {
          try {
            const statusRes = await fetch(`/api/checkout/charge-status/${chargeJson.chargeId}`);
            const { status } = await statusRes.json();
            if (status === 'RECEIVED' || status === 'CONFIRMED') {
              if (pollRef.current) clearInterval(pollRef.current);
              pollRef.current = null;
              setStep('success');
            }
          } catch { }
        }, 3000);
        setTimeout(() => {
          if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
        }, 600000);

      } catch (err: any) {
        console.error('Erro PIX:', err);
        setError(err.message || 'Erro ao processar PIX');
        setStep('payment');
      }
    }

    // CARTÃO DE CRÉDITO
    else if (formData.paymentMethod === 'credit_card') {
      const digits = cardData.number.replace(/\D/g, '');
      if (digits.length < 15) { setCardError('Número de cartão inválido'); return; }
      if (!cardData.holderName.trim()) { setCardError('Informe o nome no cartão'); return; }
      if (cardData.expiry.length < 5) { setCardError('Informe a validade (MM/AA)'); return; }
      if (cardData.cvv.length < 3) { setCardError('CVV inválido'); return; }
      if (cardData.cpf.replace(/\D/g, '').length < 11) { setCardError('CPF do titular obrigatório'); return; }

      const [expMonth, expYear] = cardData.expiry.split('/');

      setStep('processing');
      try {
        const customerRes = await fetch('/api/checkout/create-customer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            mobilePhone: formData.phone.replace(/\D/g, ''),
            email: formData.email,
            cpf: cardData.cpf.replace(/\D/g, '')
          })
        });
        const { customerId } = await customerRes.json();

        const chargeRes = await fetch('/api/checkout/create-charge-card', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerId,
            value: formData.total,
            description: `Pedido De Gusta Pizzas - ${formData.items.map(i => i.flavor1).join(', ')}`,
            installmentCount: installments,
            installmentValue: parseFloat((formData.total / installments).toFixed(2)),
            creditCard: {
              holderName: cardData.holderName,
              number: digits,
              expiryMonth: expMonth,
              expiryYear: `20${expYear}`,
              ccv: cardData.cvv
            },
            creditCardHolderInfo: {
              name: formData.name,
              email: formData.email,
              cpfCnpj: cardData.cpf.replace(/\D/g, ''),
              postalCode: formData.address?.cep?.replace(/\D/g, '') || '08265090',
              addressNumber: formData.address?.number || 'S/N',
              phone: formData.phone.replace(/\D/g, '')
            }
          })
        });
        const chargeJson = await chargeRes.json();

        if (chargeJson.error) throw new Error(chargeJson.error);

        if (chargeJson.status === 'CONFIRMED' || chargeJson.status === 'RECEIVED') {
          setStep('success');
        } else if (chargeJson.status === 'PENDING') {
          alert('Pagamento em análise. Aguarde confirmação.');
          setStep('success');
        } else {
          throw new Error(chargeJson.message || 'Cartão recusado');
        }

      } catch (err: any) {
        console.error('Erro Cartão:', err);
        setCardError(err.message || 'Erro ao processar cartão');
        setStep('payment');
      }
    }

    // WHATSAPP
    else if (formData.paymentMethod === 'whatsapp') {
      setStep('processing');
      try {
        const messageRes = await fetch('/api/checkout/generate-message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ checkoutData: formData })
        });
        const { whatsappUrl } = await messageRes.json();
        window.open(whatsappUrl, '_blank');
        setStep('success');
      } catch (err) {
        setError('Erro ao abrir WhatsApp');
        setStep('payment');
      }
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

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
              <h2 className="text-white text-2xl font-bold">Checkout</h2>
              <motion.button
                onClick={onClose}
                className="text-gray-400 hover:text-white"
                whileHover={{ scale: 1.1 }}
              >
                <X size={24} />
              </motion.button>
            </div>

            {/* Step Indicator */}
            <div className="flex justify-between mb-8 text-xs">
              {['personal', 'address', 'review', 'payment', 'success'].map((s, i) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      ['personal', 'address', 'review', 'payment', 'success'].indexOf(step) >= i
                        ? 'bg-[#DC2626] text-white'
                        : 'bg-gray-700 text-gray-400'
                    }`}
                  >
                    {i + 1}
                  </div>
                  {i < 4 && <div className="w-4 h-0.5 bg-gray-700 mx-1" />}
                </div>
              ))}
            </div>

            {/* STEP: PERSONAL */}
            {step === 'personal' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <h3 className="text-white text-lg font-bold mb-4">Dados Pessoais</h3>
                <input
                  type="text"
                  placeholder="Nome completo"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#0f0f0f] text-white p-3 rounded-lg border border-gray-700 focus:border-[#DC2626] outline-none"
                />
                <input
                  type="tel"
                  placeholder="Telefone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-[#0f0f0f] text-white p-3 rounded-lg border border-gray-700 focus:border-[#DC2626] outline-none"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#0f0f0f] text-white p-3 rounded-lg border border-gray-700 focus:border-[#DC2626] outline-none"
                />
              </motion.div>
            )}

            {/* STEP: ADDRESS */}
            {step === 'address' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <h3 className="text-white text-lg font-bold mb-4">Endereço de Entrega</h3>
                <div className="flex gap-2">
                  <input
                    type="radio"
                    id="delivery"
                    checked={formData.deliveryType === 'delivery'}
                    onChange={() => setFormData({ ...formData, deliveryType: 'delivery' })}
                  />
                  <label htmlFor="delivery" className="text-gray-300">Entrega</label>
                  <input
                    type="radio"
                    id="pickup"
                    checked={formData.deliveryType === 'pickup'}
                    onChange={() => setFormData({ ...formData, deliveryType: 'pickup' })}
                    className="ml-4"
                  />
                  <label htmlFor="pickup" className="text-gray-300">Retirada</label>
                </div>
                {formData.deliveryType === 'delivery' && (
                  <>
                    <input
                      type="text"
                      placeholder="Rua"
                      value={formData.address?.street || ''}
                      onChange={(e) => setFormData({ ...formData, address: { ...formData.address!, street: e.target.value } })}
                      className="w-full bg-[#0f0f0f] text-white p-3 rounded-lg border border-gray-700 focus:border-[#DC2626] outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Número"
                      value={formData.address?.number || ''}
                      onChange={(e) => setFormData({ ...formData, address: { ...formData.address!, number: e.target.value } })}
                      className="w-full bg-[#0f0f0f] text-white p-3 rounded-lg border border-gray-700 focus:border-[#DC2626] outline-none"
                    />
                    <input
                      type="text"
                      placeholder="CEP"
                      value={formData.address?.cep || ''}
                      onChange={(e) => setFormData({ ...formData, address: { ...formData.address!, cep: e.target.value } })}
                      className="w-full bg-[#0f0f0f] text-white p-3 rounded-lg border border-gray-700 focus:border-[#DC2626] outline-none"
                    />
                  </>
                )}
              </motion.div>
            )}

            {/* STEP: REVIEW */}
            {step === 'review' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <h3 className="text-white text-lg font-bold mb-4">Resumo do Pedido</h3>
                {formData.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-gray-300 text-sm">
                    <span>{item.flavor1} x{item.quantity}</span>
                    <span>{formatCurrency(item.finalPrice * item.quantity)}</span>
                  </div>
                ))}
                <div className="border-t border-gray-700 pt-2 mt-2">
                  <div className="flex justify-between text-gray-400 text-sm mb-1">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(formData.subtotal)}</span>
                  </div>
                  {formData.deliveryType === 'delivery' && (
                    <div className="flex justify-between text-gray-400 text-sm mb-1">
                      <span>Frete:</span>
                      <span>{formatCurrency(formData.deliveryFee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-white font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-[#DC2626]">{formatCurrency(formData.total)}</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP: PAYMENT */}
            {step === 'payment' && !pixQrCode && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <h3 className="text-white text-lg font-bold mb-4">Método de Pagamento</h3>

                {/* Seletor de método */}
                <div className="flex gap-3 mb-6">
                  <motion.button
                    onClick={() => setFormData({ ...formData, paymentMethod: 'pix' })}
                    className={`flex-1 p-4 rounded-lg border-2 transition-all text-left ${
                      formData.paymentMethod === 'pix'
                        ? 'border-[#DC2626] bg-red-900/20'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                    whileHover={{ scale: 1.02 }}
                  >
                    <p className="text-white font-bold text-xl">◼ PIX</p>
                    <p className="text-gray-400 text-sm">Instantâneo e sem taxas</p>
                  </motion.button>

                  <motion.button
                    onClick={() => setFormData({ ...formData, paymentMethod: 'credit_card' })}
                    className={`flex-1 p-4 rounded-lg border-2 transition-all text-left ${
                      formData.paymentMethod === 'credit_card'
                        ? 'border-[#DC2626] bg-red-900/20'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                    whileHover={{ scale: 1.02 }}
                  >
                    <p className="text-white font-bold text-xl">💳 Cartão</p>
                    <p className="text-gray-400 text-sm">Crédito em até 3x</p>
                  </motion.button>
                </div>

                {/* PIX */}
                {formData.paymentMethod === 'pix' && (
                  <div className="bg-[#0f0f0f] p-4 rounded-lg border border-green-800">
                    <p className="text-green-400 font-bold mb-1">✅ PIX Selecionado</p>
                    <p className="text-gray-400 text-sm">Ao confirmar, você verá o QR Code para pagamento.</p>
                    <div className="mt-3 border-t border-gray-700 pt-3">
                      <div className="flex justify-between text-gray-400">
                        <span>Total a pagar:</span>
                        <span className="text-[#F59E0B] font-black text-lg">{formatCurrency(formData.total)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* CARTÃO */}
                {formData.paymentMethod === 'credit_card' && (
                  <div className="space-y-4">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={cardData.number}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, '').slice(0, 16);
                        const masked = v.replace(/(\d{4})(?=\d)/g, '$1 ');
                        setCardData({ ...cardData, number: masked });
                      }}
                      placeholder="0000 0000 0000 0000"
                      maxLength={19}
                      className="w-full bg-[#0f0f0f] text-white p-3 rounded-lg border border-gray-700 focus:border-[#DC2626] outline-none font-mono"
                    />
                    <input
                      type="text"
                      value={cardData.holderName}
                      onChange={(e) => setCardData({ ...cardData, holderName: e.target.value.toUpperCase() })}
                      placeholder="NOME COMO NO CARTÃO"
                      className="w-full bg-[#0f0f0f] text-white p-3 rounded-lg border border-gray-700 focus:border-[#DC2626] outline-none"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={cardData.expiry}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, '').slice(0, 4);
                          const masked = v.length > 2 ? `${v.slice(0, 2)}/${v.slice(2)}` : v;
                          setCardData({ ...cardData, expiry: masked });
                        }}
                        placeholder="MM/AA"
                        maxLength={5}
                        className="w-full bg-[#0f0f0f] text-white p-3 rounded-lg border border-gray-700 focus:border-[#DC2626] outline-none font-mono"
                      />
                      <input
                        type="text"
                        inputMode="numeric"
                        value={cardData.cvv}
                        onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                        placeholder="CVV"
                        maxLength={4}
                        className="w-full bg-[#0f0f0f] text-white p-3 rounded-lg border border-gray-700 focus:border-[#DC2626] outline-none font-mono"
                      />
                    </div>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={cardData.cpf}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, '').slice(0, 11);
                        const masked = v
                          .replace(/(\d{3})(\d)/, '$1.$2')
                          .replace(/(\d{3})(\d)/, '$1.$2')
                          .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
                        setCardData({ ...cardData, cpf: masked });
                      }}
                      placeholder="CPF do Titular"
                      maxLength={14}
                      className="w-full bg-[#0f0f0f] text-white p-3 rounded-lg border border-gray-700 focus:border-[#DC2626] outline-none"
                    />
                    <select
                      value={installments}
                      onChange={(e) => setInstallments(Number(e.target.value))}
                      className="w-full bg-[#0f0f0f] text-white p-3 rounded-lg border border-gray-700 focus:border-[#DC2626] outline-none"
                    >
                      <option value={1}>1x de {formatCurrency(formData.total)} (sem juros)</option>
                      {formData.total >= 20 && (
                        <option value={2}>2x de {formatCurrency(formData.total / 2)} (sem juros)</option>
                      )}
                      {formData.total >= 30 && (
                        <option value={3}>3x de {formatCurrency(formData.total / 3)} (sem juros)</option>
                      )}
                    </select>
                    {cardError && (
                      <div className="bg-red-900/20 border border-red-700 text-red-400 p-3 rounded-lg flex items-center gap-2">
                        <AlertCircle size={18} />
                        <span className="text-sm">{cardError}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* WHATSAPP */}
                <motion.button
                  onClick={() => setFormData({ ...formData, paymentMethod: 'whatsapp' })}
                  className={`w-full p-3 rounded-lg border transition-all text-left ${
                    formData.paymentMethod === 'whatsapp'
                      ? 'border-green-600 bg-green-900/20'
                      : 'border-gray-800 hover:border-gray-600'
                  }`}
                  whileHover={{ scale: 1.01 }}
                >
                  <p className="text-gray-300 font-bold">💬 Pagar via WhatsApp</p>
                  <p className="text-gray-500 text-xs">Combinar pagamento pelo chat</p>
                </motion.button>

                {error && (
                  <div className="bg-red-900/20 border border-red-700 text-red-400 p-3 rounded-lg flex items-center gap-2">
                    <AlertCircle size={18} />
                    <span className="text-sm">{error}</span>
                  </div>
                )}
              </motion.div>
            )}

            {/* PIX QR CODE */}
            {step === 'payment' && pixQrCode && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4">
                <h3 className="text-white text-lg font-bold">Escaneie o QR Code PIX</h3>
                <p className="text-gray-400 text-sm">Use o app do seu banco para pagar</p>
                <div className="flex justify-center">
                  <div className="bg-white p-3 rounded-xl shadow-lg shadow-red-900/20 inline-block">
                    <img src={pixQrCode} alt="QR Code PIX" className="w-56 h-56" />
                  </div>
                </div>
                <div className="bg-[#0f0f0f] border border-gray-700 rounded-xl p-4 text-left">
                  <p className="text-gray-500 text-xs mb-2 font-mono">Pix Copia e Cola:</p>
                  <div className="flex gap-2 items-start">
                    <p className="text-gray-300 text-xs break-all flex-1 font-mono leading-relaxed">
                      {pixCopiaECola}
                    </p>
                    <motion.button
                      onClick={() => {
                        if (!pixCopiaECola) return;
                        if (navigator.clipboard) {
                          navigator.clipboard.writeText(pixCopiaECola).then(() => {
                            setPixCopiado(true);
                            setTimeout(() => setPixCopiado(false), 2500);
                          });
                        } else {
                          const el = document.createElement('textarea');
                          el.value = pixCopiaECola;
                          document.body.appendChild(el);
                          el.select();
                          document.execCommand('copy');
                          document.body.removeChild(el);
                          setPixCopiado(true);
                          setTimeout(() => setPixCopiado(false), 2500);
                        }
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-3 py-1 rounded-lg text-xs font-mono whitespace-nowrap transition-colors ${
                        pixCopiado
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {pixCopiado ? '✓ Copiado!' : 'Copiar'}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* SUCCESS */}
            {step === 'success' && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4">
                <Check size={64} className="text-green-400 mx-auto" />
                <h3 className="text-white text-2xl font-bold">Pedido Confirmado!</h3>
                <p className="text-gray-400">Seu pedido foi recebido e será preparado em breve.</p>
              </motion.div>
            )}

            {/* PROCESSING */}
            {step === 'processing' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-4">
                <Loader size={48} className="text-[#DC2626] mx-auto animate-spin" />
                <p className="text-gray-400">Processando pagamento...</p>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            {step !== 'success' && step !== 'processing' && (
              <div className="flex gap-3 mt-8">
                {step !== 'personal' && (
                  <motion.button
                    onClick={handlePrev}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                  >
                    <ChevronLeft size={20} /> Voltar
                  </motion.button>
                )}
                {step !== 'payment' && (
                  <motion.button
                    onClick={handleNext}
                    className="flex-1 bg-[#DC2626] hover:bg-red-700 text-white py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                  >
                    Próximo <ChevronRight size={20} />
                  </motion.button>
                )}
                {step === 'payment' && (
                  <motion.button
                    onClick={handleProcessPayment}
                    className="flex-1 bg-[#DC2626] hover:bg-red-700 text-white py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                  >
                    Pagar {formatCurrency(formData.total)}
                  </motion.button>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default CheckoutModal;
