import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { URL_BASE } from '../common/config.js';

// Função principal que testa o ciclo de vida completo de um produto
export function testarCRUDProduto() {
  const headers = { 'Content-Type': 'application/json' };
  let produtoId; // Variável para armazenar o ID do produto criado

  group('1. Criar Produto', function () {
    // Gera dados dinâmicos para o produto para garantir que cada teste seja independente
    const nomeProduto = `Produto K6 - ${__VU}-${__ITER}`;
    const precoProduto = Math.floor(Math.random() * 100000) + 1000; // Preço entre 1000 e 101000
    
    const payload = JSON.stringify({
      nome: nomeProduto,
      preco: precoProduto,
    });

    const response = http.post(`${URL_BASE}/produtos`, payload, { headers });

    check(response, {
      '[Criar Produto] Status é 201': (r) => r.status === 201,
      '[Criar Produto] Resposta contém a chave "produto"': (r) => r.json().hasOwnProperty('produto'),
      '[Criar Produto] Produto criado tem um ID': (r) => r.json().produto.hasOwnProperty('id'),
    });

    if (response.status === 201) {
      produtoId = response.json().produto.id;
      console.log(`Produto criado com sucesso. ID: ${produtoId}`);
    } else {
      console.error(`Falha ao criar produto. Status: ${response.status}, Body: ${response.body}`);
      return; // Interrompe a execução se a criação falhar
    }
  });

  // Só continua se o produto foi criado com sucesso
  if (!produtoId) {
    return;
  }

  sleep(1);

  group('2. Obter Produto por ID', function () {
    const response = http.get(`${URL_BASE}/produtos/${produtoId}`);

    check(response, {
      '[Obter Produto] Status é 200': (r) => r.status === 200,
      '[Obter Produto] ID do produto corresponde ao solicitado': (r) => r.json().produto.id === produtoId,
    });

    if (response.status !== 200) {
        console.error(`Falha ao obter produto ${produtoId}. Status: ${response.status}, Body: ${response.body}`);
    } else {
        console.log(`Produto ${produtoId} obtido com sucesso.`);
    }
  });

  sleep(1);

  group('3. Atualizar Produto', function () {
    const novoNome = `Produto K6 Atualizado - ${__VU}-${__ITER}`;
    const novoPreco = Math.floor(Math.random() * 5000) + 500; // Novo preço aleatório

    const payload = JSON.stringify({
      nome: novoNome,
      preco: novoPreco,
    });

    const response = http.put(`${URL_BASE}/produtos/${produtoId}`, payload, { headers });

    check(response, {
      '[Atualizar Produto] Status é 200': (r) => r.status === 200,
      '[Atualizar Produto] Nome foi atualizado corretamente': (r) => r.json().produto.nome === novoNome,
      '[Atualizar Produto] Preço foi atualizado corretamente': (r) => r.json().produto.preco === novoPreco,
    });

    if (response.status === 200) {
        console.log(`Produto ${produtoId} atualizado com sucesso.`);
    } else {
        console.error(`Falha ao atualizar produto ${produtoId}. Status: ${response.status}, Body: ${response.body}`);
    }
  });

  sleep(1);

  group('4. Deletar Produto', function () {
    const response = http.del(`${URL_BASE}/produtos/${produtoId}`);

    check(response, {
      '[Deletar Produto] Status é 204 (No Content)': (r) => r.status === 204,
    });

    if (response.status === 204) {
        console.log(`Produto ${produtoId} deletado com sucesso.`);
    } else {
        console.error(`Falha ao deletar produto ${produtoId}. Status: ${response.status}, Body: ${response.body}`);
    }
  });

  sleep(1);

  group('5. Verificar Deleção do Produto', function() {
    const response = http.get(`${URL_BASE}/produtos/${produtoId}`);

    check(response, {
      '[Verificar Deleção] Status é 404 (Not Found)': (r) => r.status === 404,
    });
    
    if (response.status === 404) {
        console.log(`Verificação de deleção bem-sucedida para o produto ${produtoId}. Produto não encontrado como esperado.`);
    } else {
        console.error(`Falha na verificação de deleção para o produto ${produtoId}. Status recebido: ${response.status}`);
    }
  });
}