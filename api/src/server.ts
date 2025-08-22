import 'dotenv/config';
import Fastify from 'fastify';
import fastifyMySQL from '@fastify/mysql';
import fastifyCors from '@fastify/cors'; // Importe o plugin CORS
import { clientRoutes } from './routes/cliente.route';
import { pedidoRoutes } from './routes/pedido.route';
import { produtoRoutes } from './routes/produto.route';

import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';

const app = Fastify({
  logger: true
});

app.register(fastifyCors, {
  origin: true,
  // origin: 'http://seu-frontend.com',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'idempotency-key'],
  credentials: true
});

// Add schema validator and serializer
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

// Tratador de erros global simplificado
app.setErrorHandler((error, request, reply) => {
  request.log.error(error);
  
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Erro interno no servidor';
  
  return reply.status(statusCode).send({ message });
});

// Rota raiz simples
app.get('/', async (request, reply) => {
  return { message: 'API de clientes funcionando!' };
});

// Registro do banco de dados
const connectionString = process.env.NODE_ENV === 'testing' 
  ? process.env.MYSQL_CONNECTION_STRING_TEST 
  : process.env.MYSQL_CONNECTION_STRING;

app.register(fastifyMySQL, {
  connectionString,
  promise: true
});

// Registro de rotas
app.register(clientRoutes);
app.register(pedidoRoutes);
app.register(produtoRoutes);

// Inicialização do servidor
const start = async () => {
  try {
    // Use the PORT environment variable or default to 3333
    const port = parseInt(process.env.PORT || '3333');
    
    await app.listen({ 
      port: port,
      host: '0.0.0.0'
    });
    console.log(`Servidor rodando em http://localhost:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();