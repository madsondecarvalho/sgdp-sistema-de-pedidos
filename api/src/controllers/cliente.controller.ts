import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod/v4';
import { clientSchema } from '../models/cliente.model';
import { clientService } from '../services/cliente.service';

// Schema para validação do parâmetro ID
const idParamSchema = z.object({
  id: z.string(),
});

export const clientController = {
  // Listar todos os clientes
  getAll: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const clients = await clientService.findAll(request.server);
      return reply.code(200).send({ clients });
    } catch (error) {
      return reply.code(500).send({ message: 'Erro interno ao buscar clientes' });
    }
  },

  // Obter um cliente pelo ID
  getById: async (request: FastifyRequest<{ Params: z.infer<typeof idParamSchema> }>, reply: FastifyReply) => {
    try {
      const { id } = request.params;
      const client = await clientService.findById(request.server, id);

      if (!client) {
        return reply.code(404).send({ message: 'Cliente não encontrado' });
      }

      return reply.code(200).send({ client });
    } catch (error) {
      request.log.error(`Erro ao buscar cliente ${request.params.id}:`);
      return reply.code(500).send({ message: 'Erro interno ao buscar cliente' });
    }
  },

  // Criar um novo cliente
  create: async (request: FastifyRequest<{ Body: z.infer<typeof clientSchema> }>, reply: FastifyReply) => {
    try {
      const newClient = await clientService.create(request.server, request.body);
      return reply.code(201).send({ client: newClient });
    } catch (error) {
      request.log.error('Erro ao criar cliente:');
      
      return reply.code(500).send({ message: 'Erro interno ao criar cliente' });
    }
  },

  // Atualizar um cliente existente
  update: async (
    request: FastifyRequest<{ 
      Params: z.infer<typeof idParamSchema>,
      Body: Partial<z.infer<typeof clientSchema>> 
    }>, 
    reply: FastifyReply
  ) => {
    try {
      const { id } = request.params;
      const updatedClient = await clientService.update(request.server, id, request.body);

      if (!updatedClient) {
        return reply.code(404).send({ message: 'Cliente não encontrado' });
      }

      return reply.code(200).send({ client: updatedClient });
    } catch (error) {
      request.log.error(`Erro ao atualizar cliente ${request.params.id}:`);
        
      return reply.code(500).send({ message: 'Erro interno ao atualizar cliente' });
    }
  },

  // Excluir um cliente
  delete: async (request: FastifyRequest<{ Params: z.infer<typeof idParamSchema> }>, reply: FastifyReply) => {
    try {
      const { id } = request.params;
      const deleted = await clientService.delete(request.server, id);

      if (!deleted) {
        return reply.code(404).send({ message: 'Cliente não encontrado' });
      }

      return reply.code(204).send();
    } catch (error) {
      request.log.error(`Erro ao excluir cliente ${request.params.id}:`);
      return reply.code(500).send({ message: 'Erro interno ao excluir cliente' });
    }
  }
};