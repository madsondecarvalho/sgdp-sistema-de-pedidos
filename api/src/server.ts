import 'dotenv/config';
import Fastify from 'fastify';
import fastifyMySQL from '@fastify/mysql';
import { clientRoutes } from './routes/cliente.route';
import { pedidoRoutes } from './routes/pedido.route';
import { produtoRoutes } from './routes/produto.route';

import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';

const app = Fastify({
  logger: true
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
app.register(fastifyMySQL, {
  connectionString: process.env.MYSQL_CONNECTION_STRING,
  promise: true
});

// Registro de rotas
app.register(clientRoutes);
app.register(pedidoRoutes);
app.register(produtoRoutes);

// Inicialização do servidor
const start = async () => {
  try {
    await app.listen({ port: 3333 });
    console.log('Servidor rodando em http://localhost:3333');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();