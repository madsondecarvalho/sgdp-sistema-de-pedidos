import { FastifyRequest, FastifyReply } from 'fastify';
import { clientService } from '../services/cliente.service';

export const clientController = {
  // Listar todos os clientes
  getAll: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const clients = await clientService.findAll(request.server);
      return reply.code(200).send({ clients });
    } catch (error) {
      request.log.error('Erro ao buscar clientes:', error);
      return reply.code(500).send({ message: 'Erro interno ao buscar clientes' });
    }
  },

  // Obter um cliente pelo ID
  getById: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const client = await clientService.findById(request.server, id);

      if (!client) {
        return reply.code(404).send({ message: 'Cliente não encontrado' });
      }

      return reply.code(200).send({ client });
    } catch (error) {
      request.log.error(`Erro ao buscar cliente:`, error);
      return reply.code(500).send({ message: 'Erro interno ao buscar cliente' });
    }
  },

  // Criar um novo cliente
  create: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const clientData = request.body as any;
      
      // Validação manual básica
      if (!clientData.name || !clientData.email) {
        return reply.code(400).send({ 
          message: 'Dados inválidos. Nome e email são obrigatórios.' 
        });
      }
      
      const newClient = await clientService.create(request.server, clientData);
      return reply.code(201).send({ client: newClient });
    } catch (error) {
      request.log.error('Erro ao criar cliente:', error);
      return reply.code(500).send({ message: 'Erro interno ao criar cliente' });
    }
  },

  // Atualizar um cliente existente
  update: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const clientData = request.body as any;
      
      const updatedClient = await clientService.update(request.server, id, clientData);

      if (!updatedClient) {
        return reply.code(404).send({ message: 'Cliente não encontrado' });
      }

      return reply.code(200).send({ client: updatedClient });
    } catch (error) {
      request.log.error(`Erro ao atualizar cliente:`, error);
      return reply.code(500).send({ message: 'Erro interno ao atualizar cliente' });
    }
  },

  // Excluir um cliente
  delete: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const deleted = await clientService.delete(request.server, id);

      if (!deleted) {
        return reply.code(404).send({ message: 'Cliente não encontrado' });
      }

      return reply.code(204).send();
    } catch (error) {
      request.log.error(`Erro ao excluir cliente:`, error);
      return reply.code(500).send({ message: 'Erro interno ao excluir cliente' });
    }
  }
};