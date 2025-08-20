import http from 'k6/http';
import { check, sleep } from 'k6';
import { URL_BASE } from '../common/config.js';

export function testarPedidosVazios() {
  console.log(`Testando endpoint: ${URL_BASE}/pedidos`);
  
  // Fazendo uma requisição GET para a API de pedidos
  const response = http.get(`${URL_BASE}/pedidos`);
  
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
    
    // Verificações para a chave pedidos
    check(response, {
      '[Pedidos] Corpo da resposta tem a chave "pedidos"': (r) => data.hasOwnProperty('pedidos'),
      '[Pedidos] A propriedade "pedidos" é um array': (r) => Array.isArray(data.pedidos),
    });
    
    // Log adicional para debug
    if (data.hasOwnProperty('pedidos')) {
      console.log(`Tipo de pedidos: ${typeof data.pedidos}`);
      console.log(`É array: ${Array.isArray(data.pedidos)}`);
      console.log(`Quantidade de pedidos: ${Array.isArray(data.pedidos) ? data.pedidos.length : 'N/A'}`);
    }
  } catch (e) {
    console.log(`Erro ao parsear JSON: ${e.message}`);
    console.log(`Body recebido: ${response.body}`);
  }
  
  // Pequena pausa para garantir que logs sejam exibidos
  sleep(0.5);
}