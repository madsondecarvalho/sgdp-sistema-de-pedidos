import { FastifyInstance } from 'fastify';
import { clientController } from '../controllers/cliente.controller';
import { z } from 'zod/v4';
import { ZodTypeProvider } from 'fastify-type-provider-zod';


export async function clientRoutes(app: FastifyInstance) {
  // Rota para listar todos os clientes
  app.route({
    method: 'GET',
    url: '/clientes',
    handler: clientController.getAll
  });

  // Rota para buscar cliente por ID
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/clientes/:id',
    schema: {
      params: z.object({
        id: z.uuid({ message: "O ID fornecido não é um UUID válido." })
      })
    },
    handler: clientController.getById
  });

  // Rota para criar um novo cliente
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/clientes',
    schema: {
      body: z.object({
        nome: z.string().describe('Nome do cliente'),
        email: z.string().describe('E-mail do cliente'),
      })
    },
    handler: clientController.create
  });

  // Rota para atualizar um cliente
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'PUT',
    url: '/clientes/:id',
    handler: clientController.update,
    schema: {
      body: z.object({
        nome: z.string().describe('Nome do cliente'),
        email: z.string().describe('E-mail do cliente'),
      }),
      params: z.object({
        id: z.uuid({ message: "O ID fornecido não é um UUID válido." })
      })
    },
  });

  // Rota para excluir um cliente
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'DELETE',
    url: '/clientes/:id',
    schema: {
      params: z.object({
        id: z.uuid({ message: "O ID fornecido não é um UUID válido." })
      })
    },
    handler: clientController.delete
  });
}