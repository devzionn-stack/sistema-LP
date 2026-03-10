// Script para testar a nova lógica de cálculo de frete
// Regra: 1-3km = R$5, >3km = +R$1/km

function calcularFrete(distanciaKm) {
  const DISTANCIA_MAXIMA = 15;
  const FRETE_ATE_3KM = 5.00;
  const FRETE_POR_KM_ACIMA_3 = 1.00;

  if (distanciaKm > DISTANCIA_MAXIMA) {
    return { frete: -1, zona: 'fora_area' };
  }
  
  let frete;
  if (distanciaKm <= 3) {
    frete = FRETE_ATE_3KM;
  } else {
    frete = FRETE_ATE_3KM + ((distanciaKm - 3) * FRETE_POR_KM_ACIMA_3);
  }
  
  return {
    distancia: distanciaKm,
    frete: Math.round(frete * 100) / 100,
    zona: distanciaKm <= 3 ? 'proxima' : distanciaKm <= 8 ? 'normal' : 'distante'
  };
}

const casosDeTeste = [1, 2.5, 3, 3.1, 4, 5, 8, 10, 15, 16];

console.log("=== Teste da Nova Regra de Frete ===");
console.log("Regra: 1-3km = R$5, >3km = +R$1/km");
console.log("--------------------------------------------------");
console.log("| Distância | Frete Esperado | Frete Calculado | Zona |");
console.log("--------------------------------------------------");

casosDeTeste.forEach(dist => {
  const result = calcularFrete(dist);
  let esperado;
  if (dist > 15) esperado = "Fora";
  else if (dist <= 3) esperado = "R$ 5.00";
  else esperado = "R$ " + (5 + (dist - 3) * 1).toFixed(2);

  const calcStr = result.frete === -1 ? "Fora" : "R$ " + result.frete.toFixed(2);
  
  console.log(`| ${dist.toString().padEnd(9)} | ${esperado.padEnd(14)} | ${calcStr.padEnd(15)} | ${result.zona.padEnd(4)} |`);
});
console.log("--------------------------------------------------");
