import { FastifyInstance } from 'fastify';
import { produtoController } from '../controllers/produto.controller';
import { z } from 'zod/v4';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

const produtoSchema = z.object({
  nome: z.string().describe('Nome do produto'),
  descricao: z.string().optional().describe('Descrição do produto'),
  preco: z.number().min(0).describe('Preço do produto'),
  estoque: z.number().min(0).default(0).describe('Quantidade em estoque'),
})

export async function produtoRoutes(app: FastifyInstance) {
  // Rota para listar todos os produtos
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/produtos',
    schema: {
      querystring: z.object({
        search: z.string().optional().describe('Termo de busca para filtrar produtos por nome')
      })
    },
    handler: produtoController.getAll
  });

  // Rota para buscar produto por ID
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/produtos/:id',
    schema: {
      params: z.object({
        id: z.uuid({ message: "O ID fornecido não é um UUID válido." })
      })
    },
    handler: produtoController.getById
  });

  // Rota para criar um novo produto
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/produtos',
    schema: {
      body: produtoSchema
    },
    handler: produtoController.create
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'PUT',
    url: '/produtos/:id',
    handler: produtoController.update,
    schema: {
      body: produtoSchema,
      params: z.object({
        id: z.uuid({ message: "O ID fornecido não é um UUID válido." })
      })
    },
  });

  // Rota para excluir um produto
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'DELETE',
    url: '/produtos/:id',
    schema: {
      params: z.object({
        id: z.uuid({ message: "O ID fornecido não é um UUID válido." })
      })
    },
    handler: produtoController.delete
  });
}