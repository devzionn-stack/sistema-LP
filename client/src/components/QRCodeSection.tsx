import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { Download, Printer } from 'lucide-react';

interface QRCodeSectionProps {
  siteUrl: string;
  phoneNumber: string;
}

export function QRCodeSection({ siteUrl, phoneNumber }: QRCodeSectionProps) {
  const qrRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    const canvas = canvasRef.current?.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) { 
      alert('Erro ao gerar imagem. Tente novamente.'); 
      return; 
    }
    try {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = 'qrcode-degusta-pizzas.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Erro ao baixar QR Code:', error);
      alert('Erro ao baixar QR Code. Tente novamente.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <motion.section
      className="qr-section py-20 px-4 bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a] relative overflow-hidden"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      {/* Canvas oculto apenas para download — QRCodeSVG não é exportável como PNG */}
      <div ref={canvasRef} style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <QRCodeCanvas value={siteUrl} size={400} bgColor="#ffffff" fgColor="#DC2626" />
      </div>

      {/* Decoração de fundo */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/2 w-96 h-96 bg-[#DC2626] rounded-full blur-3xl -translate-x-1/2" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        {/* Título */}
        <motion.h2
          className="text-4xl md:text-5xl font-black text-[#DC2626] mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          ESCANEIE E PEÇA AGORA
        </motion.h2>

        {/* Subtítulo */}
        <motion.p
          className="text-gray-400 text-lg mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          Mostre esse QR Code para seu motoboy ou acesse pelo celular
        </motion.p>

        {/* Card do QR Code */}
        <motion.div
          className="bg-[#1a1a1a] border border-gray-700 rounded-2xl p-8 shadow-2xl inline-block"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6, type: 'spring', stiffness: 200 }}
        >
          {/* QR Code com animação de borda */}
          <motion.div
            ref={qrRef}
            className="bg-white p-4 rounded-lg inline-block relative"
            animate={{
              boxShadow: [
                '0 0 20px rgba(220, 38, 38, 0)',
                '0 0 30px rgba(220, 38, 38, 0.5)',
                '0 0 20px rgba(220, 38, 38, 0)',
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <QRCodeSVG
              value={siteUrl}
              size={200}
              level="H"
              includeMargin={true}
              fgColor="#DC2626"
              bgColor="#FFFFFF"
            />
          </motion.div>

          {/* URL abaixo do QR */}
          <motion.p
            className="text-gray-500 text-sm mt-6 font-mono"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            {siteUrl}
          </motion.p>
        </motion.div>

        {/* Botões de ação */}
        <motion.div
          className="flex gap-4 justify-center mt-8 flex-wrap"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <motion.button
            onClick={handleDownload}
            className="flex items-center gap-2 bg-[#DC2626] hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Download size={20} />
            Baixar QR Code (PNG)
          </motion.button>

          <motion.button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Printer size={20} />
            Imprimir
          </motion.button>
        </motion.div>

        {/* Informações adicionais */}
        <motion.div
          className="mt-12 pt-8 border-t border-gray-700"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <p className="text-gray-400 text-sm">
            📱 Perfeito para panfletos, outdoors e campanhas de marketing
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Telefone: <span className="text-[#F59E0B] font-bold">{phoneNumber}</span>
          </p>
        </motion.div>
      </div>

      {/* CSS para modo print */}
      <style>{`
        @media print {
          body > *:not(.qr-section) {
            display: none !important;
          }
          .qr-section {
            background: white !important;
            padding: 40px !important;
            margin: 0 !important;
          }
          .qr-section h2 {
            color: #000 !important;
          }
          .qr-section p {
            color: #333 !important;
          }
          .qr-section button {
            display: none !important;
          }
          .qr-section div[class*="rounded-2xl"] {
            border: 2px solid #000 !important;
            background: white !important;
          }
          .qr-section svg {
            filter: none !important;
          }
        }
      `}</style>
    </motion.section>
  );
}

export default QRCodeSection;
