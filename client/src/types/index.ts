export interface PizzaSize {
  label: "P" | "M" | "G";
  price: number;
}

export interface MenuItem {
  id: string;
  category: string;
  name: string;
  desc: string;
  price: number;
  image: string;
  badges: string[];
  sizes: PizzaSize[];
  allowHalf: boolean;
}

// NOVA: Seleção de pizza com tipo (inteira vs metade-metade)
export interface PizzaSelection {
  id: string;
  type: 'whole' | 'half'; // inteira ou metade-metade
  size: 'P' | 'M' | 'G';
  flavor1: string; // nome do sabor 1
  flavor1Price: number; // preço do sabor 1
  flavor2?: string; // nome do sabor 2 (se metade)
  flavor2Price?: number; // preço do sabor 2 (se metade)
  finalPrice: number; // preço calculado
  quantity: number;
  observation?: string;
  image: string; // imagem da pizza
}

export interface CartItem {
  id: string;
  name: string;
  image: string;
  size: string;
  price: number;
  quantity: number;
  halfFlavor?: string;
  observation?: string;
}

export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  cep: string;
}

// NOVA: Dados completos de checkout
export interface CheckoutData {
  name: string;
  phone: string;
  email: string;
  deliveryType: 'pickup' | 'delivery';
  address?: Address;
  items: PizzaSelection[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod?: 'pix' | 'credit_card' | 'whatsapp';
  customerId?: string;
  chargeId?: string;
}

export interface CustomerData {
  name: string;
  phone: string;
  deliveryType: "pickup" | "delivery";
  address?: string;
}

export interface PaymentResponse {
  chargeId: string;
  pixQrCode: string;
  pixCopiaECola: string;
  value: number;
}

export interface MessageResponse {
  message: string;
  whatsappUrl: string;
}

export interface CreditCardData {
  holderName: string;
  number: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
}

export interface CreditCardHolderInfo {
  name: string;
  email: string;
  cpfCnpj: string;
  postalCode: string;
  addressNumber: string;
  phone: string;
}

export interface CreditCardChargeRequest {
  customerId: string;
  value: number;
  description: string;
  creditCardToken: string;
  creditCardHolderInfo: CreditCardHolderInfo;
  installmentCount?: number;
  installmentValue?: number;
}
