import { FastifyRequest, FastifyReply } from 'fastify';
import { pedidoService } from '../services/pedido.service';

export const pedidoController = {
    // Listar todos os pedidos
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

    // Obter um pedido pelo ID
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

    // Criar um novo pedido
    create: async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { pedido, itens } = request.body as any;

            const idempotencyKey = request.headers['idempotency-key'] as string;

            if (!idempotencyKey) {
                return reply.code(400).send({
                    message: 'IDempotency key é obrigatório. Adicione o Header: idempotency-key'
                });
            }

            // Validação manual básica
            if (!pedido || !pedido.id_cliente) {
                return reply.code(400).send({
                    message: 'Dados inválidos. ID do cliente é obrigatório.'
                });
            }

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

    // Atualizar um pedido existente
    update: async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as { id: string };
            const pedidoData = request.body as any;

            const updatedPedido = await pedidoService.update(request.server, id, pedidoData);

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

    // Adicionar item ao pedido
    addItem: async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as { id: string };
            const item = request.body as any;

            // Validação manual básica
            if (!item || !item.id_produto || !item.qtde || !item.preco) {
                return reply.code(400).send({
                    message: 'Dados inválidos. ID do produto, quantidade e preço são obrigatórios.'
                });
            }

            const updatedPedido = await pedidoService.addItemToPedido(request.server, id, item);

            if (!updatedPedido) {
                return reply.code(404).send({ message: 'Pedido não encontrado' });
            }

            return reply.code(200).send({ pedido: updatedPedido });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            request.log.error(`Erro ao adicionar item ao pedido: ${errorMessage}`);
            return reply.code(500).send({ message: 'Erro interno ao adicionar item ao pedido' });
        }
    },

    // Atualizar item do pedido
    updateItem: async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id, produtoId } = request.params as { id: string; produtoId: string };
            const itemData = request.body as any;

            const updatedPedido = await pedidoService.updateItem(
                request.server,
                id,
                produtoId,
                itemData
            );

            if (!updatedPedido) {
                return reply.code(404).send({ message: 'Pedido não encontrado' });
            }

            return reply.code(200).send({ pedido: updatedPedido });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            request.log.error(`Erro ao atualizar item do pedido: ${errorMessage}`);
            return reply.code(500).send({ message: 'Erro interno ao atualizar item do pedido' });
        }
    },

    // Remover item do pedido
    removeItem: async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id, produtoId } = request.params as { id: string; produtoId: string };

            const updatedPedido = await pedidoService.removeItem(request.server, id, produtoId);

            if (!updatedPedido) {
                return reply.code(404).send({ message: 'Pedido não encontrado' });
            }

            return reply.code(200).send({ pedido: updatedPedido });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            request.log.error(`Erro ao remover item do pedido: ${errorMessage}`);
            return reply.code(500).send({ message: 'Erro interno ao remover item do pedido' });
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