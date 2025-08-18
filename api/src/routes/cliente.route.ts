import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod/v4';
import { clientController } from '../controllers/cliente.controller';
import { clientSchema } from '../models/cliente.model';

export async function clientRoutes(app: FastifyInstance) {
  // Definir um schema de resposta mais permissivo
  const clientResponseSchema = z.object({
    id: z.string().optional(),
    name: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  });

  // Rota para listar todos os clientes
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/clientes',
    schema: {
      response: {
        200: z.object({
          clients: z.array(clientResponseSchema),
        }),
      },
    },
    handler: clientController.getAll,
  });

  // Rota para buscar um cliente pelo ID
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/clientes/:id',
    schema: {
      params: z.object({
        id: z.string(),
      }),
      response: {
        200: z.object({
          client: clientResponseSchema,
        }),
        404: z.object({
          message: z.string(),
        }),
      },
    },
    handler: clientController.getById,
  });

  // Rota para criar um novo cliente
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/clientes',
    schema: {
      body: clientSchema.omit({ id: true, createdAt: true, updatedAt: true }),
      response: {
        201: z.object({
          client: clientResponseSchema,
        }),
      },
    },
    handler: clientController.create,
  });

  // Rota para atualizar um cliente
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'PUT',
    url: '/clientes/:id',
    schema: {
      params: z.object({
        id: z.string(),
      }),
      body: clientSchema.partial().omit({ id: true, createdAt: true, updatedAt: true }),
      response: {
        200: z.object({
          client: clientResponseSchema,
        }),
        404: z.object({
          message: z.string(),
        }),
      },
    },
    handler: clientController.update,
  });

  // Rota para excluir um cliente
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'DELETE',
    url: '/clientes/:id',
    schema: {
      params: z.object({
        id: z.string(),
      }),
      response: {
        204: z.null(),
        404: z.object({
          message: z.string(),
        }),
      },
    },
    handler: clientController.delete,
  });
}