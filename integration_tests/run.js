import { group } from 'k6';

// Importa as funções de teste dos arquivos separados.
import { testarCRUDCliente } from './tests/clientes.test.js';
import { testarJornadaDeCompra } from './tests/pedidos.test.js';
import { testarCRUDProduto } from './tests/produto.test.js';

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
  group('Cenário 1: jornada do produto, e cliente até o pedido.', function () {
    testarJornadaDeCompra();
  });

  group('Cenário 2: CRUD para cliente', function () {
    testarCRUDCliente();
  });

  group('Cenário 3: CRUD para produto', function () {
    testarCRUDProduto();
  });
}