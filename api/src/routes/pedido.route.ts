import { FastifyInstance } from 'fastify';
import { pedidoController } from '../controllers/pedido.controller';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod/v4';

const pedidoInfoSchema = z.object({
    id_cliente: z.uuid({ message: "O id_cliente deve ser um UUID válido." }),
    data: z.coerce.date({ error: "A data é obrigatória." }),
});

const itemSchema = z.object({
    id_produto: z.uuid({ message: "O id_produto deve ser um UUID válido." }),

    qtde: z.number({ error: "A quantidade (qtde) é obrigatória." })
        .int({ message: "A quantidade deve ser um número inteiro." })
        .positive({ message: "A quantidade deve ser maior que zero." }),
});

const criarPedidoSchema = z.object({
    pedido: pedidoInfoSchema,
    itens: z.array(itemSchema, {
        error: "O campo 'itens' é obrigatório."
    }).nonempty({ message: "O pedido deve ter pelo menos um item." }), 
});

const headerSchemaIdempotencyRequired = z.object({
    'idempotency-key': z.uuid({
        error: "O header 'idempotency-key' deve ser um UUID válido.",
    }).nonempty({ message: "O header 'idempotency-key' não pode ser vazio." })
});

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
    app.withTypeProvider<ZodTypeProvider>().route({
        method: 'POST',
        url: '/pedidos',
        schema: {
            body: criarPedidoSchema,
            headers: headerSchemaIdempotencyRequired
        },
        handler: pedidoController.create
    });

    // Rota para atualizar um pedido 
    // TODO: Ajustar lógica de alterar pedido (itens do pedido)
    app.withTypeProvider<ZodTypeProvider>().route({
        method: 'PUT',
        url: '/pedidos/:id',
        schema: {
            params: z.object({
                id: z.uuid({ message: "O ID fornecido não é um UUID válido." })
            }),
            body: criarPedidoSchema,
        },
        handler: pedidoController.update
    });

    // Rota para excluir um pedido
    app.route({
        method: 'DELETE',
        url: '/pedidos/:id',
        handler: pedidoController.delete
    });
}