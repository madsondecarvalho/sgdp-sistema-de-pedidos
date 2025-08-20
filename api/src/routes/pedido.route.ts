import { FastifyInstance } from 'fastify';
import { pedidoController } from '../controllers/pedido.controller';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod/v4';

//TODO: ADICIONAR VALIDAÇÕES
export async function pedidoRoutes(app: FastifyInstance) {
    // Rota para listar todos os pedidos
    app.route({
        method: 'GET',
        url: '/pedidos',
        handler: pedidoController.getAll
    });

    // Rota para buscar pedido por ID
    app.withTypeProvider<ZodTypeProvider>().route({
        method: 'GET',
        url: '/pedidos/:id',
        schema: {
            params: z.object({
                id: z.uuid({ message: "O ID fornecido não é um UUID válido." })
            })
        },
        handler: pedidoController.getById
    });

    // Rota para criar um novo pedido
    app.route({
        method: 'POST',
        url: '/pedidos',
        handler: pedidoController.create
    });

    // Rota para atualizar um pedido 
    // TODO: Ajustar lógica de alterar pedido (itens do pedido)
    app.route({
        method: 'PUT',
        url: '/pedidos/:id',
        handler: pedidoController.update
    });

    // Rota para excluir um pedido
    app.route({
        method: 'DELETE',
        url: '/pedidos/:id',
        handler: pedidoController.delete
    });
}