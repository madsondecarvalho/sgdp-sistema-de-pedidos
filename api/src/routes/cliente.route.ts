import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
// Altere a importação do Zod
import { z } from 'zod'; // Remova a parte "/v4"
import { clientController } from '../controllers/cliente.controller';

export async function clientRoutes(app: FastifyInstance) {
  // Definir os schemas com Zod
  const errorSchema = z.object({
    message: z.string()
  });

  // Definir um schema de resposta
  const clientResponseSchema = z.object({
    id: z.string().optional(),
    name: z.string().optional(),
    email: z.string().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  });

  // Rota para listar todos os clientes
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/clientes',
    schema: {
      tags: ['clientes'],
      description: 'Retorna a lista de todos os clientes',
      response: {
        200: {
          $ref: '#/components/schemas/ClientesResponse'
        },
        500: errorSchema // Usar schema Zod para erros
      },
    },
    handler: clientController.getAll,
  });

  // Rota para buscar um cliente pelo ID
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/clientes/:id',
    schema: {
      tags: ['clientes'],
      description: 'Retorna um cliente específico pelo ID',
      params: z.object({
        id: z.string().describe('ID do cliente'),
      }),
      response: {
        200: {
          $ref: '#/components/schemas/ClienteResponse'
        },
        404: errorSchema, // Definição direta
        500: errorSchema  // Definição direta
      },
    },
    handler: clientController.getById,
  });

  // Rota para criar um novo cliente
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/clientes',
    schema: {
      tags: ['clientes'],
      description: 'Cria um novo cliente',
      body: {
        $ref: '#/components/schemas/CreateClienteRequest'
      },
      response: {
        201: {
          $ref: '#/components/schemas/ClienteResponse'
        },
        409: errorSchema, // Definição direta
        500: errorSchema  // Definição direta
      },
    },
    handler: clientController.create,
  });

  // Rota para atualizar um cliente
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'PUT',
    url: '/clientes/:id',
    schema: {
      tags: ['clientes'],
      description: 'Atualiza um cliente existente',
      params: z.object({
        id: z.string().describe('ID do cliente'),
      }),
      body: {
        $ref: '#/components/schemas/CreateClienteRequest'
      },
      response: {
        200: {
          $ref: '#/components/schemas/ClienteResponse'
        },
        404: errorSchema, // Definição direta
        409: errorSchema, // Definição direta
        500: errorSchema  // Definição direta
      },
    },
    handler: clientController.update,
  });

  // Rota para excluir um cliente
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'DELETE',
    url: '/clientes/:id',
    schema: {
      tags: ['clientes'],
      description: 'Remove um cliente existente',
      params: z.object({
        id: z.string().describe('ID do cliente'),
      }),
      response: {
        204: {
          type: 'null',
          description: 'Cliente removido com sucesso'
        },
        404: errorSchema, // Definição direta
        500: errorSchema  // Definição direta
      },
    },
    handler: clientController.delete,
  });
}