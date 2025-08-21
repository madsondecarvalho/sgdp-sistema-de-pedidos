import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { URL_BASE } from '../common/config.js';
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

export function testarCRUDCliente() {
  const headers = { 'Content-Type': 'application/json' };
  let clienteId; // Variável para armazenar o ID do cliente criado

  // Usamos 'group' para organizar os logs e resultados no K6
  group('1. Criar Cliente', function () {
    // Gera um e-mail único para cada iteração do teste para evitar conflitos
    const emailInicial = `cliente.k6.${uuidv4()}@example.com`;
    const payload = JSON.stringify({
      nome: "Cliente de Teste K6",
      email: emailInicial
    });

    const response = http.post(`${URL_BASE}/clientes`, payload, { headers });

    check(response, {
      '[Criar Cliente] Status é 201': (r) => r.status === 201,
      '[Criar Cliente] Resposta contém a chave "client"': (r) => r.json().hasOwnProperty('client'),
      '[Criar Cliente] Cliente criado tem um ID': (r) => r.json().client.hasOwnProperty('id'),
    });

    // Extrai e armazena o ID do cliente se a requisição foi bem-sucedida
    if (response.status === 201) {
      clienteId = response.json().client.id;
      console.log(`Cliente criado com sucesso. ID: ${clienteId}`);
    } else {
      console.error(`Falha ao criar cliente. Status: ${response.status}, Body: ${response.body}`);
      // Se não conseguir criar, não vale a pena continuar o teste
      return; 
    }
  });

  // Só executa os próximos passos se o clienteId foi obtido com sucesso
  if (!clienteId) {
    return;
  }

  sleep(1); // Pausa para simular tempo entre ações

  group('2. Atualizar Cliente', function () {
    const novoEmail = `cliente.k6.updated.${uuidv4()}@example.com`;
    const payload = JSON.stringify({
      nome: "Cliente de Teste K6 (Atualizado)",
      email: novoEmail
    });

    const response = http.put(`${URL_BASE}/clientes/${clienteId}`, payload, { headers });

    check(response, {
      '[Atualizar Cliente] Status é 200': (r) => r.status === 200,
      '[Atualizar Cliente] E-mail foi atualizado corretamente': (r) => r.json().client.email === novoEmail,
    });

    if (response.status !== 200) {
      console.error(`Falha ao atualizar cliente. Status: ${response.status}, Body: ${response.body}`);
    } else {
      console.log(`Cliente ${clienteId} atualizado com sucesso.`);
    }
  });

  sleep(1);

  group('3. Obter Cliente por ID', function () {
    const response = http.get(`${URL_BASE}/clientes/${clienteId}`);

    check(response, {
      '[Obter Cliente] Status é 200': (r) => r.status === 200,
      '[Obter Cliente] ID do cliente corresponde ao solicitado': (r) => r.json().client.id === clienteId,
    });
    
    if (response.status !== 200) {
      console.error(`Falha ao obter cliente. Status: ${response.status}, Body: ${response.body}`);
    } else {
      console.log(`Cliente ${clienteId} obtido com sucesso.`);
    }
  });

  sleep(1);

  group('4. Deletar Cliente', function () {
    // Para o método DELETE, não enviamos corpo (payload) nem headers especiais
    const response = http.del(`${URL_BASE}/clientes/${clienteId}`);

    check(response, {
      '[Deletar Cliente] Status é 204 (No Content)': (r) => r.status === 204,
    });
    
    if (response.status === 204) {
        console.log(`Cliente ${clienteId} deletado com sucesso.`);
    } else {
        console.error(`Falha ao deletar cliente. Status: ${response.status}, Body: ${response.body}`);
    }
  });

  sleep(1);
}