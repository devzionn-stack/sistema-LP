import express, { Request, Response } from 'express';
import axios from 'axios';

const router = express.Router();

// Coordenadas fixas da pizzaria (Rua Gentil Fabriano 182, Vila Carmosina, SP)
// Geocodificadas manualmente para precisão
const PIZZARIA = { 
  lat: -23.5108, 
  lng: -46.4089,
  endereco: "Rua Gentil Fabriano 182, Vila Carmosina"
};

// Chave da Google Maps API
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || 'AIzaSyBEjIT-1YZ0nlxHBiFEiGj-I-yDSSmtyws';

// Tabela de frete - NOVA REGRA
// 1-3km = R$5
// >3km = +R$1/km
const FRETE_ATE_3KM = 5.00;
const FRETE_POR_KM_ACIMA_3 = 1.00;
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

// Calcular frete dado distância - NOVA LÓGICA
function calcularFrete(distanciaKm: number): { frete: number; tempo: number; zona: string } {
  if (distanciaKm > DISTANCIA_MAXIMA) {
    return { frete: -1, tempo: -1, zona: 'fora_area' };
  }
  
  let frete: number;
  
  // Nova regra: 1-3km = R$5, >3km = +R$1/km
  if (distanciaKm <= 3) {
    frete = FRETE_ATE_3KM;
  } else {
    // Para distâncias acima de 3km: R$5 (até 3km) + R$1 por km adicional
    frete = FRETE_ATE_3KM + ((distanciaKm - 3) * FRETE_POR_KM_ACIMA_3);
  }
  
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
        erro: `Fora da área de entrega (${distanciaArredondada} km)`,
        pizzariaLat: PIZZARIA.lat,
        pizzariaLng: PIZZARIA.lng,
        clienteLat,
        clienteLng
      });
    }

    res.json({
      cep,
      endereco: `${logradouro}, ${bairro}, ${localidade}`,
      distancia: distanciaArredondada,
      frete,
      tempo,
      zona,
      pizzariaLat: PIZZARIA.lat,
      pizzariaLng: PIZZARIA.lng,
      clienteLat,
      clienteLng
    });
  } catch (error: any) {
    console.error('Erro ao calcular frete:', error.message);
    res.status(500).json({
      error: 'Erro ao calcular frete. Tente novamente.',
      details: error.message
    });
  }
});

// POST /api/delivery/directions
// Obter rota via Google Maps Directions API
router.post('/directions', async (req: Request, res: Response) => {
  const { clienteLat, clienteLng, destination } = req.body;

  if (!clienteLat || !clienteLng) {
    return res.status(400).json({ error: 'Coordenadas do cliente inválidas.' });
  }

  try {
    const origin = `${PIZZARIA.lat},${PIZZARIA.lng}`;
    const destino = destination || `${clienteLat},${clienteLng}`;

    const directionsResponse = await axios.get(
      'https://maps.googleapis.com/maps/api/directions/json',
      {
        params: {
          origin,
          destination: destino,
          key: GOOGLE_MAPS_API_KEY,
          mode: 'driving',
          language: 'pt-BR'
        }
      }
    );

    if (directionsResponse.data.status !== 'OK') {
      return res.status(400).json({ 
        error: 'Não foi possível calcular a rota.',
        status: directionsResponse.data.status 
      });
    }

    const route = directionsResponse.data.routes[0];
    const leg = route.legs[0];

    res.json({
      success: true,
      distance: leg.distance.value / 1000, // converter para km
      distanceText: leg.distance.text,
      duration: leg.duration.value / 60, // converter para minutos
      durationText: leg.duration.text,
      polyline: route.overview_polyline.points,
      steps: leg.steps.map((step: any) => ({
        instruction: step.html_instructions,
        distance: step.distance.text,
        duration: step.duration.text
      }))
    });
  } catch (error: any) {
    console.error('Erro ao obter rota:', error.message);
    res.status(500).json({
      error: 'Erro ao obter rota. Tente novamente.',
      details: error.message
    });
  }
});

// GET /api/delivery/config
// Retornar configurações de frete para o frontend
router.get('/config', (req: Request, res: Response) => {
  res.json({
    pizzaria: PIZZARIA,
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    freteConfig: {
      ateTresKm: FRETE_ATE_3KM,
      porKmAcimaDeTres: FRETE_POR_KM_ACIMA_3,
      distanciaMaxima: DISTANCIA_MAXIMA
    }
  });
});

export default router;
