import { FastifyRequest, FastifyReply } from 'fastify';
import { clientService } from '../services/cliente.service';

export const clientController = {
  getAll: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Extrair o parâmetro search da query URL
      const query = request.query as { search?: string };
      const searchTerm = query.search || '';
      
      const clients = await clientService.findAll(request.server, searchTerm);
      return reply.code(200).send({ clients });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      request.log.error(`Erro ao buscar clientes: ${errorMessage}`);
      return reply.code(500).send({ message: 'Erro interno ao buscar clientes' });
    }
  },

  getById: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const client = await clientService.findById(request.server, id);

      if (!client) {
        return reply.code(404).send({ message: 'Cliente não encontrado' });
      }

      return reply.code(200).send({ client });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      request.log.error(`Erro ao buscar cliente: ${errorMessage}`);
      return reply.code(500).send({ message: 'Erro interno ao buscar cliente' });
    }
  },

  create: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const clientData = request.body as any;

      if (!clientData.nome || !clientData.email) {
        return reply.code(400).send({
          message: 'Dados inválidos. Nome e email são obrigatórios.'
        });
      }

      const newClient = await clientService.create(request.server, clientData);
      return reply.code(201).send({ client: newClient });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      request.log.error(`Erro ao criar cliente: ${errorMessage}`);
      return reply.code(500).send({ message: 'Erro interno ao criar cliente' });
    }
  },

  update: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const clientData = request.body as any;

      const updatedClient = await clientService.update(request.server, id, clientData);

      if (!updatedClient) {
        return reply.code(404).send({ message: 'Cliente não encontrado' });
      }

      return reply.code(200).send({ client: updatedClient });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      request.log.error(`Erro ao atualizar cliente: ${errorMessage}`);
      return reply.code(500).send({ message: 'Erro interno ao atualizar cliente' });
    }
  },

  delete: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const deleted = await clientService.delete(request.server, id);

      if (!deleted) {
        return reply.code(404).send({ message: 'Cliente não encontrado' });
      }

      return reply.code(204).send();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      request.log.error(`Erro ao excluir cliente: ${errorMessage}`);
      return reply.code(500).send({ message: 'Erro interno ao excluir cliente' });
    }
  }
};