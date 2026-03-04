import express, { Request, Response } from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import deliveryRouter from "./routes/delivery.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'dist', 'public')));

// Montar rotas
app.use('/api/delivery', deliveryRouter);

// ============= CONFIGURAÇÕES =============
const ASAAS_API_KEY = process.env.ASAAS_API_KEY || 'seu_asaas_key_aqui';
const ASAAS_API_URL = 'https://api.asaas.com/api/v3';
const WHATSAPP_PHONE = process.env.WHATSAPP_PHONE || '5511934195908';
const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://api.whatsapp.com/send';

// ============= TIPOS =============
interface CheckoutData {
  name: string;
  phone: string;
  email: string;
  deliveryType: 'delivery' | 'pickup';
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    cep: string;
  };
  items: any[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: 'pix' | 'whatsapp';
}

// ============= ROTAS DE CHECKOUT =============

/**
 * POST /api/checkout/create-customer
 * Cria um cliente no Asaas
 */
app.post('/api/checkout/create-customer', async (req, res) => {
  try {
    const { name, mobilePhone, email } = req.body;

    const response = await axios.post(
      `${ASAAS_API_URL}/customers`,
      {
        name,
        mobilePhone,
        email,
        // cpfCnpj é opcional — só incluir se fornecido // Placeholder - implementar validação real
      },
      {
        headers: {
          'access_token': ASAAS_API_KEY,
        },
      }
    );

    res.json({
      customerId: response.data.id,
      success: true,
    });
  } catch (error: any) {
    console.error('Erro ao criar cliente:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Erro ao criar cliente',
      details: error.response?.data || error.message,
    });
  }
});

/**
 * POST /api/checkout/create-charge
 * Cria uma cobrança PIX no Asaas
 */
app.post('/api/checkout/create-charge', async (req, res) => {
  try {
    const { customerId, value, description } = req.body;

    const response = await axios.post(
      `${ASAAS_API_URL}/payments`,
      {
        customer: customerId,
        value,
        description,
        billingType: 'PIX',
        dueDate: new Date().toISOString().split('T')[0],
      },
      {
        headers: {
          'access_token': ASAAS_API_KEY,
        },
      }
    );

    // Gerar QR Code PIX
    const qrCodeResponse = await axios.get(`${ASAAS_API_URL}/payments/${response.data.id}/pixQrCode`,
      {
        headers: {
          'access_token': ASAAS_API_KEY,
        },
      }
    );

    res.json({
      chargeId: response.data.id,
      pixQrCode: `data:image/png;base64,${qrCodeResponse.data.encodedImage}`,
      pixCopiaECola: qrCodeResponse.data.payload,
      success: true,
    });
  } catch (error: any) {
    console.error('Erro ao criar cobrança:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Erro ao criar cobrança',
      details: error.response?.data || error.message,
    });
  }
});

/**
 * GET /api/checkout/charge-status/:chargeId
 * Verifica o status de uma cobrança
 */
app.get('/api/checkout/charge-status/:chargeId', async (req, res) => {
  try {
    const { chargeId } = req.params;

    const response = await axios.get(
      `${ASAAS_API_URL}/payments/${chargeId}`,
      {
        headers: {
          'access_token': ASAAS_API_KEY,
        },
      }
    );

    res.json({
      status: response.data.status,
      value: response.data.value,
      success: true,
    });
  } catch (error: any) {
    console.error('Erro ao verificar status:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Erro ao verificar status',
      details: error.response?.data || error.message,
    });
  }
});

/**
 * POST /api/checkout/generate-message
 * Gera mensagem personalizada para WhatsApp
 */
// Rota para cobrança com cartão de crédito
app.post('/api/checkout/create-charge-card', async (req: any, res: any) => {
  try {
    const {
      customerId,
      value,
      description,
      installmentCount = 1,
      installmentValue,
      creditCard,
      creditCardHolderInfo
    } = req.body;

    // Criar cobrança no Asaas
    const response = await axios.post(
      `${ASAAS_API_URL}/payments`,
      {
        customer: customerId,
        billingType: 'CREDIT_CARD',
        value,
        description,
        installmentCount,
        installmentValue,
        creditCard: {
          holderName: creditCard.holderName,
          number: creditCard.number,
          expiryMonth: creditCard.expiryMonth,
          expiryYear: creditCard.expiryYear,
          ccv: creditCard.ccv
        },
        creditCardHolderInfo
      },
      {
        headers: {
          'access_token': ASAAS_API_KEY
        }
      }
    );

    res.json({
      chargeId: response.data.id,
      status: response.data.status,
      message: 'Cartão processado com sucesso',
      success: true
    });
  } catch (error: any) {
    console.error('Erro ao criar cobrança com cartão:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Erro ao processar cartão',
      message: error.response?.data?.errors?.[0]?.description || error.message
    });
  }
});

app.post('/api/checkout/generate-message', async (req: any, res: any) => {
  try {
    const { checkoutData } = req.body as { checkoutData: CheckoutData };

    // Construir mensagem personalizada
    const pizzasText = checkoutData.items
      .map((item: any) => {
        const tipo = item.type === 'half' ? `${item.flavor1} + ${item.flavor2}` : item.flavor1;
        return `• ${tipo} (${item.size}) x${item.quantity} - R$ ${(item.finalPrice * item.quantity).toFixed(2)}`;
      })
      .join('\n');

    const enderecoText = checkoutData.deliveryType === 'delivery'
      ? `${checkoutData.address?.street}, ${checkoutData.address?.number} ${checkoutData.address?.complement ? `- ${checkoutData.address.complement}` : ''}\n${checkoutData.address?.neighborhood} - ${checkoutData.address?.city}`
      : 'Retirada na loja';

    const mensagem = `Olá! 😍🍕

Quero fazer um pedido:

*Cliente:* ${checkoutData.name}
*Telefone:* ${checkoutData.phone}

*Pizzas:*
${pizzasText}

*Endereço:* ${enderecoText}

*Subtotal:* R$ ${checkoutData.subtotal.toFixed(2)}
${checkoutData.deliveryType === 'delivery' ? `*Taxa Entrega:* R$ ${checkoutData.deliveryFee.toFixed(2)}\n` : ''}*TOTAL:* R$ ${checkoutData.total.toFixed(2)}

Já estou com vontade de garantir a minha 😋🔥`;

    // Gerar URL WhatsApp
    const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(mensagem)}`;

    res.json({
      message: mensagem,
      whatsappUrl,
      success: true,
    });
  } catch (error: any) {
    console.error('Erro ao gerar mensagem:', error.message);
    res.status(500).json({
      error: 'Erro ao gerar mensagem',
      details: error.message,
    });
  }
});

/**
 * POST /api/webhook/asaas
 * Webhook para receber notificações de pagamento do Asaas
 */
app.post('/api/webhook/asaas', async (req, res) => {
  try {
    const { event, payment } = req.body;

    console.log(`[WEBHOOK] Evento: ${event}`);
    console.log(`[WEBHOOK] Pagamento ID: ${payment?.id}`);
    console.log(`[WEBHOOK] Status: ${payment?.status}`);

    // Aqui você pode implementar lógica para:
    // - Atualizar status do pedido no banco de dados
    // - Enviar confirmação por email/WhatsApp
    // - Atualizar dashboard de vendas

    if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') {
      console.log(`✅ Pagamento confirmado: ${payment?.id}`);
      // TODO: Enviar notificação WhatsApp ao cliente
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('Erro no webhook:', error.message);
    res.status(500).json({
      error: 'Erro ao processar webhook',
      details: error.message,
    });
  }
});

// ============= ROTAS AUXILIARES =============

/**
 * GET /api/health
 * Health check
 */
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * GET /api/config
 * Retorna configurações públicas
 */
app.get('/api/config', (_req, res) => {
  res.json({
    whatsappPhone: WHATSAPP_PHONE,
    deliveryFee: 5.00,
    estimatedTime: '30-40 minutos',
  });
});

// ============= FALLBACK PARA SPA =============
app.get('*', (_req: Request, res: Response) => {
  const indexPath = path.join(__dirname, '..', 'dist', 'public', 'index.html');
  res.sendFile(indexPath);
});

// ============= INICIAR SERVIDOR =============
async function startServer() {
  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`\n🚀 De Gusta Pizzas - Servidor rodando!`);
    console.log(`📍 Local: http://localhost:${port}/`);
    console.log(`🌐 Network: http://0.0.0.0:${port}/`);
    console.log(`\n✅ Rotas de Checkout:`);
    console.log(`   POST   /api/checkout/create-customer`);
    console.log(`   POST   /api/checkout/create-charge`);
    console.log(`   GET    /api/checkout/charge-status/:chargeId`);
    console.log(`   POST   /api/checkout/generate-message`);
    console.log(`   POST   /api/webhook/asaas`);
    console.log(`\n`);
  });
}

startServer().catch(console.error);

export default app;
