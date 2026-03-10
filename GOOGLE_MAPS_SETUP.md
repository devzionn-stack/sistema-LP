# Configuração do Google Maps API

## Visão Geral

O sistema foi atualizado para integrar o Google Maps API para cálculo de rotas e visualização interativa de entregas. Esta documentação descreve como configurar e usar a integração.

## Configuração da Chave de API

### 1. Variáveis de Ambiente

A chave da Google Maps API deve ser configurada como variável de ambiente. Você pode fazer isso de duas formas:

#### Opção A: Arquivo `.env` (Desenvolvimento)

Crie um arquivo `.env` na raiz do projeto:

```bash
GOOGLE_MAPS_API_KEY=AIzaSyBEjIT-1YZ0nlxHBiFEiGj-I-yDSSmtyws
```

#### Opção B: Variáveis de Sistema (Produção)

```bash
export GOOGLE_MAPS_API_KEY=AIzaSyBEjIT-1YZ0nlxHBiFEiGj-I-yDSSmtyws
```

### 2. Verificação da Configuração

A chave será automaticamente carregada pelo backend em:
- `server/routes/delivery.ts` - Usada para calcular rotas via Google Directions API
- Frontend - Carregada dinamicamente via endpoint `/api/delivery/config`

## APIs do Google Maps Utilizadas

### 1. **Google Maps JavaScript API**
- **Uso**: Renderizar mapa interativo no navegador
- **Recursos**:
  - Visualização de mapa com tema escuro
  - Marcadores de pizzaria (vermelho) e cliente (azul)
  - Desenho de polyline da rota

### 2. **Google Directions API**
- **Uso**: Calcular rota otimizada entre pizzaria e cliente
- **Endpoint**: `POST /api/delivery/directions`
- **Parâmetros**:
  ```json
  {
    "clienteLat": -23.5200,
    "clienteLng": -46.4100,
    "destination": "-23.5200,-46.4100"
  }
  ```
- **Resposta**:
  ```json
  {
    "success": true,
    "distance": 5.2,
    "distanceText": "5,2 km",
    "duration": 15,
    "durationText": "15 mins",
    "polyline": "encoded_polyline_string",
    "steps": [
      {
        "instruction": "Siga pela Rua X",
        "distance": "500 m",
        "duration": "2 mins"
      }
    ]
  }
  ```

## Componentes Atualizados

### Backend: `server/routes/delivery.ts`

#### Novas Constantes
```typescript
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || 'AIzaSyBEjIT-1YZ0nlxHBiFEiGj-I-yDSSmtyws';
const PIZZARIA = { 
  lat: -23.5108, 
  lng: -46.4089,
  endereco: "Rua Gentil Fabriano 182, Vila Carmosina"
};
```

#### Novas Rotas

**POST `/api/delivery/calculate`** (Atualizada)
- Agora retorna coordenadas do cliente para integração com mapa
- Resposta inclui: `pizzariaLat`, `pizzariaLng`, `clienteLat`, `clienteLng`

**POST `/api/delivery/directions`** (Nova)
- Calcula rota via Google Directions API
- Retorna instruções passo a passo e polyline

**GET `/api/delivery/config`** (Nova)
- Retorna configurações de frete e chave da API para o frontend

### Frontend: Novos Componentes

#### `client/src/components/DeliveryMapModal.tsx` (Novo)
Modal que exibe:
- Mapa interativo com Google Maps
- Marcadores de pizzaria e cliente
- Polyline da rota
- Instruções passo a passo
- Botão para abrir no Google Maps

#### `client/src/components/DeliveryCalculator.tsx` (Atualizado)
- Integração com novo componente `DeliveryMapModal`
- Botão "Ver Rota no Mapa" após calcular frete
- Tabela de cobertura atualizada com nova regra de cálculo

## Nova Regra de Cálculo de Frete

### Fórmula Implementada

```
Se distância <= 3 km:
  frete = R$ 5,00

Se distância > 3 km:
  frete = R$ 5,00 + (distância - 3) × R$ 1,00/km
```

### Exemplos

| Distância | Cálculo | Frete |
|-----------|---------|-------|
| 1 km | R$ 5,00 | R$ 5,00 |
| 3 km | R$ 5,00 | R$ 5,00 |
| 4 km | R$ 5,00 + (4-3)×R$1 | R$ 6,00 |
| 5 km | R$ 5,00 + (5-3)×R$1 | R$ 7,00 |
| 8 km | R$ 5,00 + (8-3)×R$1 | R$ 10,00 |
| 15 km | R$ 5,00 + (15-3)×R$1 | R$ 17,00 |
| >15 km | - | Fora da área |

## Ponto de Partida

**Endereço Fixo**: Rua Gentil Fabriano 182, Vila Carmosina
**Coordenadas**: -23.5108, -46.4089
**Distância Máxima**: 15 km

## Instalação e Execução

### 1. Instalar Dependências
```bash
pnpm install
```

### 2. Configurar Variáveis de Ambiente
```bash
echo "GOOGLE_MAPS_API_KEY=AIzaSyBEjIT-1YZ0nlxHBiFEiGj-I-yDSSmtyws" > .env
```

### 3. Desenvolvimento
```bash
pnpm dev
```

### 4. Build para Produção
```bash
pnpm build
pnpm start
```

## Fluxo de Uso

1. **Usuário insere CEP** no calculador de frete
2. **Backend calcula**:
   - Geocodifica o CEP via ViaCEP + Nominatim
   - Calcula distância com Haversine
   - Aplica nova regra de frete
   - Retorna coordenadas do cliente
3. **Frontend exibe**:
   - Frete calculado
   - Botão "Ver Rota no Mapa"
4. **Usuário clica em "Ver Rota no Mapa"**:
   - Modal abre com mapa interativo
   - Google Directions API calcula rota otimizada
   - Exibe instruções passo a passo
   - Oferece link para abrir no Google Maps

## Troubleshooting

### Erro: "Chave de API inválida"
- Verifique se a variável `GOOGLE_MAPS_API_KEY` está configurada
- Confirme que a chave está ativa no Google Cloud Console
- Verifique as restrições de chave (deve permitir Directions API e Maps JavaScript API)

### Erro: "Não foi possível calcular a rota"
- Verifique se as coordenadas são válidas
- Confirme que o modo de transporte é "driving"
- Verifique se há rota disponível entre os pontos

### Mapa não carrega
- Verifique se o script do Google Maps está sendo carregado
- Confirme que a chave de API tem acesso à Maps JavaScript API
- Verifique o console do navegador para erros

## Segurança

### Recomendações

1. **Restrinja a chave de API**:
   - No Google Cloud Console, configure restrições de HTTP Referrer
   - Restrinja a apenas domínios autorizados

2. **Use variáveis de ambiente**:
   - Nunca commite a chave no repositório
   - Use `.env` apenas em desenvolvimento
   - Configure variáveis de ambiente no servidor de produção

3. **Monitore o uso**:
   - Configure alertas no Google Cloud Console
   - Monitore o uso de API para detectar abusos

## Custos

O Google Maps oferece crédito mensal gratuito. Verifique:
- [Google Cloud Pricing](https://cloud.google.com/maps-platform/pricing)
- Directions API: ~$5 por 1000 requisições
- Maps JavaScript API: Gratuita até 28.000 requisições/mês

## Suporte

Para mais informações:
- [Google Maps Documentation](https://developers.google.com/maps/documentation)
- [Directions API Reference](https://developers.google.com/maps/documentation/directions)
- [Maps JavaScript API Reference](https://developers.google.com/maps/documentation/javascript)
