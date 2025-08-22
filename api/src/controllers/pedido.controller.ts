import { FastifyRequest, FastifyReply } from 'fastify';
import { pedidoService } from '../services/pedido.service';

export const pedidoController = {
    getAll: async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const pedidos = await pedidoService.findAll(request.server);
            return reply.code(200).send({ pedidos });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            request.log.error(`Erro ao buscar pedidos: ${errorMessage}`);
            return reply.code(500).send({ message: 'Erro interno ao buscar pedidos' });
        }
    },

    getById: async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as { id: string };
            const pedido = await pedidoService.findById(request.server, id);

            if (!pedido) {
                return reply.code(404).send({ message: 'Pedido não encontrado' });
            }

            return reply.code(200).send({ pedido });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            request.log.error(`Erro ao buscar pedido: ${errorMessage}`);
            return reply.code(500).send({ message: 'Erro interno ao buscar pedido' });
        }
    },

    create: async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { pedido, itens } = request.body as any;

            const idempotencyKey = request.headers['idempotency-key'] as string;

            const novoPedido = await pedidoService.create(request.server, {
                data: pedido.data || new Date(),
                id_cliente: pedido.id_cliente,
            },
                itens || [],
                idempotencyKey
            );

            return reply.code(201).send({ pedido: novoPedido });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            request.log.error(`Erro ao criar pedido: ${errorMessage}`);
            return reply.code(500).send({ message: 'Erro interno ao criar pedido' });
        }
    },

    update: async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as { id: string };
            const { pedido, itens } = request.body as any;

            console.info(`Iniciando atualização do pedido com ID: ${id} e body: ${JSON.stringify(request.body)}`);

            const updatedPedido = await pedidoService.update(request.server, id, pedido, itens);

            if (!updatedPedido) {
                return reply.code(404).send({ message: 'Pedido não encontrado' });
            }

            return reply.code(200).send({ pedido: updatedPedido });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            request.log.error(`Erro ao atualizar pedido: ${errorMessage}`);
            return reply.code(500).send({ message: 'Erro interno ao atualizar pedido' });
        }
    },

    // Excluir um pedido
    delete: async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as { id: string };
            const deleted = await pedidoService.delete(request.server, id);

            if (!deleted) {
                return reply.code(404).send({ message: 'Pedido não encontrado' });
            }

            return reply.code(204).send();
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            request.log.error(`Erro ao excluir pedido: ${errorMessage}`);
            return reply.code(500).send({ message: 'Erro interno ao excluir pedido' });
        }
    }
};