import { FastifyRequest, FastifyReply } from 'fastify';
import { produtoService } from '../services/produto.service';

export const produtoController = {
  // Listar todos os produtos
  getAll: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const produtos = await produtoService.findAll(request.server);
      return reply.code(200).send({ produtos });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      request.log.error(`Erro ao buscar produtos: ${errorMessage}`);
      return reply.code(500).send({ message: 'Erro interno ao buscar produtos' });
    }
  },

  // Obter um produto pelo ID
  getById: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const produto = await produtoService.findById(request.server, id);

      if (!produto) {
        return reply.code(404).send({ message: 'Produto não encontrado' });
      }

      return reply.code(200).send({ produto });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      request.log.error(`Erro ao buscar produto: ${errorMessage}`);
      return reply.code(500).send({ message: 'Erro interno ao buscar produto' });
    }
  },

  // Criar um novo produto
  create: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const produtoData = request.body as any;

      // Validação manual básica
      if (!produtoData.nome || produtoData.preco === undefined) {
        return reply.code(400).send({
          message: 'Dados inválidos. Nome e preço são obrigatórios.'
        });
      }

      // Validação adicional para preço e estoque
      if (isNaN(produtoData.preco) || produtoData.preco < 0) {
        return reply.code(400).send({
          message: 'O preço deve ser um número válido e maior ou igual a zero.'
        });
      }

      if (produtoData.estoque !== undefined && (isNaN(produtoData.estoque) || produtoData.estoque < 0)) {
        return reply.code(400).send({
          message: 'O estoque deve ser um número válido e maior ou igual a zero.'
        });
      }

      const newProduto = await produtoService.create(request.server, produtoData);
      return reply.code(201).send({ produto: newProduto });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      request.log.error(`Erro ao criar produto: ${errorMessage}`);
      return reply.code(500).send({ message: 'Erro interno ao criar produto' });
    }
  },

  // Atualizar um produto existente
  update: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const produtoData = request.body as any;

      // Validações para campos numéricos
      if (produtoData.preco !== undefined && (isNaN(produtoData.preco) || produtoData.preco < 0)) {
        return reply.code(400).send({
          message: 'O preço deve ser um número válido e maior ou igual a zero.'
        });
      }

      if (produtoData.estoque !== undefined && (isNaN(produtoData.estoque) || produtoData.estoque < 0)) {
        return reply.code(400).send({
          message: 'O estoque deve ser um número válido e maior ou igual a zero.'
        });
      }

      const updatedProduto = await produtoService.update(request.server, id, produtoData);

      if (!updatedProduto) {
        return reply.code(404).send({ message: 'Produto não encontrado' });
      }

      return reply.code(200).send({ produto: updatedProduto });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      request.log.error(`Erro ao atualizar produto: ${errorMessage}`);
      return reply.code(500).send({ message: 'Erro interno ao atualizar produto' });
    }
  },

  // Excluir um produto
  delete: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const deleted = await produtoService.delete(request.server, id);

      if (!deleted) {
        return reply.code(404).send({ message: 'Produto não encontrado' });
      }

      return reply.code(204).send();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      request.log.error(`Erro ao excluir produto: ${errorMessage}`);
      return reply.code(500).send({ message: 'Erro interno ao excluir produto' });
    }
  }
};