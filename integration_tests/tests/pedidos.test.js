import http from 'k6/http';
import { check, sleep } from 'k6';
import { URL_BASE } from '../common/config.js';
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

export function testarJornadaDeCompra() {
  const headers = { 'Content-Type': 'application/json' };
  let produtoId;
  let clienteId;

  // ------------------- 1. CRIAR PRODUTO -------------------
  const payloadProduto = JSON.stringify({
    nome: `Produto Teste K6 ${Math.random()}`, // Nome dinâmico para evitar duplicatas
    preco: 15000 + Math.floor(Math.random() * 1000) // Preço dinâmico
  });

  const resProduto = http.post(`${URL_BASE}/produtos`, payloadProduto, { headers });

  check(resProduto, {
    '[Criar Produto] Status é 201': (r) => r.status === 201, // 201 Created é o mais comum para POST
    '[Criar Produto] Resposta contém a chave "produto"': (r) => r.json().hasOwnProperty('produto'),
    '[Criar Produto] Produto criado tem um ID': (r) => r.json().produto.hasOwnProperty('id'),
  });

  // Extrai o ID do produto se a requisição foi bem-sucedida
  if (resProduto.status === 201) {
    produtoId = resProduto.json().produto.id;
    console.log(`Produto criado com sucesso. ID: ${produtoId}`);
  } else {
    console.error(`Falha ao criar produto. Status: ${resProduto.status}, Body: ${resProduto.body}`);
    return; // Interrompe a execução se não for possível criar o produto
  }

  sleep(1); // Pausa de 1 segundo entre as etapas

  // ------------------- 2. CRIAR CLIENTE -------------------
  // Gera um e-mail único para cada iteração do teste
  const emailUnico = `k6.${uuidv4()}@example.com`;
  const payloadCliente = JSON.stringify({
    nome: "Cliente de Teste K6",
    email: emailUnico
  });

  const resCliente = http.post(`${URL_BASE}/clientes`, payloadCliente, { headers });

  check(resCliente, {
    '[Criar Cliente] Status é 201': (r) => r.status === 201,
    '[Criar Cliente] Resposta contém a chave "client"': (r) => r.json().hasOwnProperty('client'),
    '[Criar Cliente] Cliente criado tem um ID': (r) => r.json().client.hasOwnProperty('id'),
  });

  // Extrai o ID do cliente se a requisição foi bem-sucedida
  if (resCliente.status === 201) {
    clienteId = resCliente.json().client.id;
    console.log(`Cliente criado com sucesso. ID: ${clienteId}`);
  } else {
    console.error(`Falha ao criar cliente. Status: ${resCliente.status}, Body: ${resCliente.body}`);
    return; // Interrompe a execução
  }

  sleep(1);

  // ------------------- 3. CRIAR PEDIDO -------------------
  const idempotencyKey = uuidv4(); // Gera uma chave única para idempotência
  const payloadPedido = JSON.stringify({
    pedido: {
      id_cliente: clienteId,
      data: new Date().toISOString() // Usa a data atual
    },
    itens: [
      {
        id_produto: produtoId,
        qtde: Math.floor(Math.random() * 5) + 1 // Quantidade aleatória entre 1 e 5
      }
    ]
  });

  const headersPedido = {
    'Content-Type': 'application/json',
    'idempotency-key': idempotencyKey,
  };

  const resPedido = http.post(`${URL_BASE}/pedidos`, payloadPedido, { headers: headersPedido });

  check(resPedido, {
    '[Criar Pedido] Status é 201': (r) => r.status === 201,
    '[Criar Pedido] Resposta contém a chave "pedido"': (r) => r.json().hasOwnProperty('pedido'),
    '[Criar Pedido] Pedido retornado corresponde ao cliente correto': (r) => r.json().pedido.id_cliente === clienteId,
    '[Criar Pedido] Pedido contém itens': (r) => Array.isArray(r.json().pedido.itens) && r.json().pedido.itens.length > 0,
    '[Criar Pedido] Item do pedido corresponde ao produto correto': (r) => r.json().pedido.itens[0].id_produto === produtoId,
  });

  if (resPedido.status === 201) {
    console.log(`Pedido criado com sucesso. ID: ${resPedido.json().pedido.id}`);
  } else {
    console.error(`Falha ao criar pedido. Status: ${resPedido.status}, Body: ${resPedido.body}`);
  }

  sleep(1);
}