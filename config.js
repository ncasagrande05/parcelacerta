// ============ Config ============
// Configuração da estimativa usada no simulador.
// Ajuste a taxa média conforme o mercado.
window.APP_CONFIG = {
  productName: 'ParcelaCerta',
  productInitials: 'PC',
  tagline: 'Qualificação de leads em 30 segundos',

  // Taxa média mensal usada para a estimativa (% a.m.)
  // Use uma taxa representativa do mercado do segmento do lojista.
  taxaMediaMensal: 2.00,

  // Spread da faixa aproximada (±%)
  // Ex: 0.08 = ±8% em torno da parcela central
  spreadFaixa: 0.08,

  // Limite de simulações para contas em plano trial
  trialLimit: 5,

  // Plano Pro (pay-as-you-go)
  precoPorSimulacao: 1.00,   // R$ por simulação
  softCapDefault: 300,        // aviso ao atingir (R$)
  ciclosDias: 30,             // duração do ciclo de faturamento (dias)
};
