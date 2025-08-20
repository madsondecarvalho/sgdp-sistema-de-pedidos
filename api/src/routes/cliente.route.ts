import { FastifyInstance } from 'fastify';
import { clientController } from '../controllers/cliente.controller';
import { z } from 'zod/v4';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

const clientSchema = z.object({
  nome: z.string().describe('Nome do cliente'),
  email: z.string().describe('E-mail do cliente'),
})

export async function clientRoutes(app: FastifyInstance) {
  app.route({
    method: 'GET',
    url: '/clientes',
    handler: clientController.getAll
  });

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

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/clientes',
    schema: {
      body: clientSchema
    },
    handler: clientController.create
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'PUT',
    url: '/clientes/:id',
    handler: clientController.update,
    schema: {
      body: clientSchema,
      params: z.object({
        id: z.uuid({ message: "O ID fornecido não é um UUID válido." })
      })
    },
  });

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