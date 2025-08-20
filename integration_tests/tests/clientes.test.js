import http from 'k6/http';
import { check, sleep } from 'k6';
import { URL_BASE } from '../common/config.js';

// Exporta a função de teste para ser chamada pelo script principal.
export function testarClientesVazios() {
  console.log(`Testando endpoint: ${URL_BASE}/clientes`);
  
  // Fazendo uma requisição GET para a API de clientes
  const response = http.get(`${URL_BASE}/clientes`);
  
  // Log para debug
  console.log(`Status: ${response.status}, Body length: ${response.body ? response.body.length : 0}`);
  
  // Verificando status code primeiro
  const statusCheck = check(response, {
    'Status é 200': (r) => r.status === 200,
  });
  
  // Se não passou no status check, não tenta processar o JSON
  if (!statusCheck) {
    console.log(`Erro na requisição: Status ${response.status}`);
    console.log(`Resposta: ${response.body}`);
    return;
  }
  
  // Verificando se o body existe antes de tentar parsear
  if (!response.body) {
    console.log('Resposta recebida com body nulo');
    return;
  }
  
  try {
    const data = JSON.parse(response.body);
    
    // Verificações para a chave clients
    check(response, {
      '[Clientes] Corpo da resposta tem a chave "clients"': (r) => data.hasOwnProperty('clients'),
      '[Clientes] A propriedade "clients" é um array': (r) => Array.isArray(data.clients),
    });
    
    // Log adicional para debug
    if (data.hasOwnProperty('clients')) {
      console.log(`Tipo de clients: ${typeof data.clients}`);
      console.log(`É array: ${Array.isArray(data.clients)}`);
      console.log(`Quantidade de clientes: ${Array.isArray(data.clients) ? data.clients.length : 'N/A'}`);
    }
  } catch (e) {
    console.log(`Erro ao parsear JSON: ${e.message}`);
    console.log(`Body recebido: ${response.body}`);
  }
  
  // Pequena pausa para garantir que logs sejam exibidos
  sleep(0.5);
}