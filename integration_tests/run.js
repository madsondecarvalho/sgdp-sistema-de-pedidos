import { group } from 'k6';

// Importa as funções de teste dos arquivos separados.
import { testarClientesVazios } from './tests/clientes.test.js';
import { testarPedidosVazios } from './tests/pedidos.test.js';

// As opções globais de execução ficam aqui.
export const options = {
  vus: 1,
  iterations: 1,
  thresholds: {
    'checks': ['rate==1.0'], // Exige que 100% dos checks passem.
  },
};

// A função principal (default) chama os testes importados dentro de 'groups'.
export default function () {
  group('Cenário: Teste de Pedidos', function () {
    testarPedidosVazios();
  });

  group('Cenário: Teste de Clientes', function () {
    testarClientesVazios();
  });
}