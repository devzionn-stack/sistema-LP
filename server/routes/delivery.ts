import express, { Request, Response } from 'express';
import axios from 'axios';

const router = express.Router();

// Coordenadas fixas da pizzaria (08265-090 - Vila Carmosina, SP)
const PIZZARIA = { lat: -23.5108, lng: -46.4089 };

// Tabela de frete
const FRETE_BASE = 5.00;
const FRETE_POR_KM = 1.80;
const FRETE_TAXA_EXTRA = 3.00; // para >8km
const DISTANCIA_MAXIMA = 15; // km

// Fórmula de Haversine — distância real entre dois pontos lat/lng
function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Calcular frete dado distância
function calcularFrete(distanciaKm: number): { frete: number; tempo: number; zona: string } {
  if (distanciaKm > DISTANCIA_MAXIMA) {
    return { frete: -1, tempo: -1, zona: 'fora_area' };
  }
  let frete = FRETE_BASE + (distanciaKm * FRETE_POR_KM);
  if (distanciaKm > 8) frete += FRETE_TAXA_EXTRA;
  const tempo = Math.round(25 + (distanciaKm * 3)); // 25min preparo + 3min/km
  const zona = distanciaKm <= 3 ? 'proxima' : distanciaKm <= 8 ? 'normal' : 'distante';
  return {
    frete: Math.round(frete * 100) / 100,
    tempo,
    zona
  };
}

// POST /api/delivery/calculate
router.post('/calculate', async (req: Request, res: Response) => {
  const { cep } = req.body;
  if (!cep || !/^\d{5}-?\d{3}$/.test(cep)) {
    return res.status(400).json({ error: 'CEP inválido. Use o formato 00000-000.' });
  }
  const cepLimpo = cep.replace('-', '');

  try {
    // 1. Buscar endereço via ViaCEP
    const viaCep = await axios.get(`https://viacep.com.br/ws/${cepLimpo}/json/`);
    if (viaCep.data.erro) {
      return res.status(404).json({ error: 'CEP não encontrado. Verifique e tente novamente.' });
    }
    const { logradouro, bairro, localidade, uf } = viaCep.data;
    const enderecoCompleto = `${logradouro}, ${bairro}, ${localidade}, ${uf}, Brasil`;

    // 2. Geocodificar via Nominatim (OpenStreetMap) — gratuito
    const geocode = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: enderecoCompleto,
        format: 'json',
        limit: 1,
        countrycodes: 'br'
      },
      headers: { 'User-Agent': 'DeGustaPizzas/1.0' } // Nominatim exige User-Agent
    });

    let clienteLat: number, clienteLng: number;

    if (!geocode.data || geocode.data.length === 0) {
      // Fallback: usar apenas cidade/bairro se endereço exato falhar
      const geocodeFallback = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: `${bairro}, ${localidade}, ${uf}, Brasil`,
          format: 'json',
          limit: 1,
          countrycodes: 'br'
        },
        headers: { 'User-Agent': 'DeGustaPizzas/1.0' }
      });
      if (!geocodeFallback.data || geocodeFallback.data.length === 0) {
        return res.status(422).json({ error: 'Não foi possível localizar o endereço. Verifique o CEP.' });
      }
      clienteLat = parseFloat(geocodeFallback.data[0].lat);
      clienteLng = parseFloat(geocodeFallback.data[0].lon);
    } else {
      clienteLat = parseFloat(geocode.data[0].lat);
      clienteLng = parseFloat(geocode.data[0].lon);
    }

    // 3. Calcular distância com Haversine
    const distanciaKm = haversine(PIZZARIA.lat, PIZZARIA.lng, clienteLat, clienteLng);
    const distanciaArredondada = Math.round(distanciaKm * 10) / 10;

    // 4. Calcular frete e tempo
    const { frete, tempo, zona } = calcularFrete(distanciaArredondada);

    if (zona === 'fora_area') {
      return res.json({
        cep,
        endereco: `${logradouro}, ${bairro}, ${localidade}`,
        distancia: distanciaArredondada,
        frete: -1,
        tempo: -1,
        zona: 'fora_area',
        erro: `Fora da área de entrega (${distanciaArredondada} km)`
      });
    }

    res.json({
      cep,
      endereco: `${logradouro}, ${bairro}, ${localidade}`,
      distancia: distanciaArredondada,
      frete,
      tempo,
      zona
    });
  } catch (error: any) {
    console.error('Erro ao calcular frete:', error.message);
    res.status(500).json({
      error: 'Erro ao calcular frete. Tente novamente.',
      details: error.message
    });
  }
});

export default router;
