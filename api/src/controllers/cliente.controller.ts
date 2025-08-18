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
  getAll: async (_request: FastifyRequest, reply: FastifyReply) => {
    const clients = clientService.findAll();
    return reply.code(200).send({ clients });
  },

  // Obter um cliente pelo ID
  getById: async (request: FastifyRequest<{ Params: z.infer<typeof idParamSchema> }>, reply: FastifyReply) => {
    const { id } = request.params;
    const client = clientService.findById(id);

    if (!client) {
      return reply.code(404).send({ message: 'Cliente não encontrado' });
    }

    return reply.code(200).send({ client });
  },

  // Criar um novo cliente
  create: async (request: FastifyRequest<{ Body: z.infer<typeof clientSchema> }>, reply: FastifyReply) => {
    const newClient = clientService.create(request.body);
    return reply.code(201).send({ client: newClient });
  },

  // Atualizar um cliente existente
  update: async (
    request: FastifyRequest<{ 
      Params: z.infer<typeof idParamSchema>,
      Body: Partial<z.infer<typeof clientSchema>> 
    }>, 
    reply: FastifyReply
  ) => {
    const { id } = request.params;
    const updatedClient = clientService.update(id, request.body);

    if (!updatedClient) {
      return reply.code(404).send({ message: 'Cliente não encontrado' });
    }

    return reply.code(200).send({ client: updatedClient });
  },

  // Excluir um cliente
  delete: async (request: FastifyRequest<{ Params: z.infer<typeof idParamSchema> }>, reply: FastifyReply) => {
    const { id } = request.params;
    const deleted = clientService.delete(id);

    if (!deleted) {
      return reply.code(404).send({ message: 'Cliente não encontrado' });
    }

    return reply.code(204).send();
  }
};