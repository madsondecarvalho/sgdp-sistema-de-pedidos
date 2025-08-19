import Fastify from 'fastify';
import fastifyMySQL from '@fastify/mysql';
import { clientRoutes } from './routes/cliente.route';

const app = Fastify({
  logger: true
});

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
  connectionString: 'mysql://znap_user:znap_password@localhost:3306/pedidos_service',
  promise: true
});

// Registro de rotas
app.register(clientRoutes);

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