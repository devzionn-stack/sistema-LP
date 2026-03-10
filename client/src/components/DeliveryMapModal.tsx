import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Loader, AlertCircle, X, Navigation } from 'lucide-react';

interface DeliveryMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  clienteLat: number | null;
  clienteLng: number | null;
  pizzariaLat: number;
  pizzariaLng: number;
  distancia: number;
  frete: number;
  endereco: string;
}

declare global {
  interface Window {
    google: any;
  }
}

export function DeliveryMapModal({
  isOpen,
  onClose,
  clienteLat,
  clienteLng,
  pizzariaLat,
  pizzariaLng,
  distancia,
  frete,
  endereco
}: DeliveryMapModalProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [directions, setDirections] = useState<any>(null);
  const [apiKey, setApiKey] = useState<string>('');

  // Carregar chave da API do backend
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/delivery/config');
        const data = await response.json();
        setApiKey(data.googleMapsApiKey);
      } catch (err) {
        console.error('Erro ao buscar configuração:', err);
      }
    };
    fetchConfig();
  }, []);

  // Carregar Google Maps quando a modal abre
  useEffect(() => {
    if (!isOpen || !apiKey || !mapRef.current) return;

    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initializeMap();
      } else {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&language=pt-BR`;
        script.async = true;
        script.defer = true;
        script.onload = initializeMap;
        document.head.appendChild(script);
      }
    };

    loadGoogleMaps();
  }, [isOpen, apiKey]);

  const initializeMap = () => {
    if (!mapRef.current) return;

    const center = {
      lat: pizzariaLat,
      lng: pizzariaLng
    };

    const newMap = new window.google.maps.Map(mapRef.current, {
      zoom: 13,
      center,
      mapTypeId: 'roadmap',
      styles: [
        { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
        { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
        {
          featureType: 'administrative.locality',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#d59563' }]
        },
        {
          featureType: 'poi',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#d59563' }]
        },
        {
          featureType: 'poi.park',
          elementType: 'geometry',
          stylers: [{ color: '#263c3f' }]
        },
        {
          featureType: 'poi.park',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#6b9080' }]
        },
        {
          featureType: 'road',
          elementType: 'geometry',
          stylers: [{ color: '#38414e' }]
        },
        {
          featureType: 'road',
          elementType: 'geometry.stroke',
          stylers: [{ color: '#212a37' }]
        },
        {
          featureType: 'road',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#9ca5b3' }]
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry',
          stylers: [{ color: '#746855' }]
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry.stroke',
          stylers: [{ color: '#1f2835' }]
        },
        {
          featureType: 'road.highway',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#f3751ff' }]
        },
        {
          featureType: 'transit',
          elementType: 'geometry',
          stylers: [{ color: '#2f3948' }]
        },
        {
          featureType: 'transit.station',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#d59563' }]
        },
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [{ color: '#17263c' }]
        },
        {
          featureType: 'water',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#515c6d' }]
        },
        {
          featureType: 'water',
          elementType: 'labels.text.stroke',
          stylers: [{ color: '#17263c' }]
        }
      ]
    });

    setMap(newMap);

    // Marcador da pizzaria
    new window.google.maps.Marker({
      position: center,
      map: newMap,
      title: 'Pizzaria',
      icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
    });

    // Marcador do cliente se coordenadas disponíveis
    if (clienteLat && clienteLng) {
      new window.google.maps.Marker({
        position: { lat: clienteLat, lng: clienteLng },
        map: newMap,
        title: 'Seu endereço',
        icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
      });

      // Calcular rota
      calculateRoute(newMap);
    }
  };

  const calculateRoute = async (mapInstance: any) => {
    if (!clienteLat || !clienteLng) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/delivery/directions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clienteLat,
          clienteLng,
          destination: `${clienteLat},${clienteLng}`
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erro ao calcular rota');
        return;
      }

      setDirections(data);

      // Desenhar polyline da rota
      const polylinePoints = window.google.maps.geometry.encoding.decodePath(data.polyline);
      const polyline = new window.google.maps.Polyline({
        path: polylinePoints,
        geodesic: true,
        strokeColor: '#DC2626',
        strokeOpacity: 1.0,
        strokeWeight: 3,
        map: mapInstance
      });

      // Ajustar zoom para mostrar toda a rota
      const bounds = new window.google.maps.LatLngBounds();
      polylinePoints.forEach((point: any) => bounds.extend(point));
      mapInstance.fitBounds(bounds);
    } catch (err) {
      console.error('Erro ao calcular rota:', err);
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenInGoogleMaps = () => {
    if (clienteLat && clienteLng) {
      const url = `https://www.google.com/maps/dir/${pizzariaLat},${pizzariaLng}/${clienteLat},${clienteLng}`;
      window.open(url, '_blank');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-[#1a1a1a] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-[#0f0f0f] border-b border-gray-700 p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <MapPin className="text-[#DC2626]" size={24} />
                <div>
                  <h2 className="text-white font-bold text-lg">Rota de Entrega</h2>
                  <p className="text-gray-400 text-sm">{endereco}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Conteúdo */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* Mapa */}
              <div className="flex-1 min-h-[300px] md:min-h-auto">
                <div
                  ref={mapRef}
                  className="w-full h-full"
                  style={{ minHeight: '400px' }}
                />
              </div>

              {/* Informações */}
              <div className="w-full md:w-80 bg-[#0f0f0f] border-t md:border-t-0 md:border-l border-gray-700 p-6 overflow-y-auto">
                {/* Carregando */}
                {loading && (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Loader className="animate-spin text-[#DC2626] mb-3" size={32} />
                    <p className="text-gray-400">Calculando rota...</p>
                  </div>
                )}

                {/* Erro */}
                {error && (
                  <motion.div
                    className="bg-red-900/20 border border-red-700 text-red-400 p-4 rounded-lg flex gap-3 mb-4"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                    <p className="text-sm">{error}</p>
                  </motion.div>
                )}

                {/* Detalhes da Rota */}
                {directions && !loading && (
                  <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {/* Resumo */}
                    <div className="bg-[#1a1a1a] p-4 rounded-lg border border-gray-700">
                      <h3 className="text-white font-bold mb-3">📍 Resumo da Rota</h3>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Distância:</span>
                          <span className="text-white font-bold">{directions.distanceText}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Tempo estimado:</span>
                          <span className="text-white font-bold">{directions.durationText}</span>
                        </div>
                        <div className="border-t border-gray-700 pt-2 mt-2 flex justify-between">
                          <span className="text-gray-400">Taxa de entrega:</span>
                          <span className="text-[#F59E0B] font-bold">R$ {frete.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Passos da rota */}
                    {directions.steps && directions.steps.length > 0 && (
                      <div className="bg-[#1a1a1a] p-4 rounded-lg border border-gray-700">
                        <h3 className="text-white font-bold mb-3">🛣️ Instruções</h3>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {directions.steps.map((step: any, index: number) => (
                            <div key={index} className="text-xs text-gray-400 pb-2 border-b border-gray-700 last:border-b-0">
                              <p className="font-bold text-white mb-1">{index + 1}. {step.instruction.replace(/<[^>]*>/g, '')}</p>
                              <p className="text-gray-500">{step.distance} • {step.duration}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Botão Google Maps */}
                    <motion.button
                      onClick={handleOpenInGoogleMaps}
                      className="w-full bg-[#DC2626] hover:bg-red-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Navigation size={18} />
                      Abrir no Google Maps
                    </motion.button>
                  </motion.div>
                )}

                {/* Sem dados de rota */}
                {!directions && !loading && !error && (
                  <div className="text-center py-8">
                    <MapPin className="text-gray-600 mx-auto mb-3" size={32} />
                    <p className="text-gray-400 text-sm">Mapa carregado</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default DeliveryMapModal;
