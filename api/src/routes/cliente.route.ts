import { FastifyInstance } from 'fastify';
import { clientController } from '../controllers/cliente.controller';

export async function clientRoutes(app: FastifyInstance) {
  // Rota para listar todos os clientes
  app.route({
    method: 'GET',
    url: '/clientes',
    handler: clientController.getAll
  });

  // Rota para buscar cliente por ID
  app.route({
    method: 'GET',
    url: '/clientes/:id',
    handler: clientController.getById
  });

  // Rota para criar um novo cliente
  app.route({
    method: 'POST',
    url: '/clientes',
    handler: clientController.create
  });

  // Rota para atualizar um cliente
  app.route({
    method: 'PUT',
    url: '/clientes/:id',
    handler: clientController.update
  });

  // Rota para excluir um cliente
  app.route({
    method: 'DELETE',
    url: '/clientes/:id',
    handler: clientController.delete
  });
}