import { FastifyInstance } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import { Pedido, PedidoStatus } from '../entities/pedido.entity';
import { PedidoItem } from '../entities/pedido_item.entity';
import { Produto } from '../entities/produto.entity';

class PedidoService {
    // Listar todos os pedidos
    async findAll(fastify: FastifyInstance) {
        try {
            const [rows] = await (fastify as any).mysql.query('SELECT * FROM pedidos');
            return this.formatPedidoList(rows as any[]);
        } catch (error) {
            console.error('Error in findAll:', error);
            throw error;
        }
    }

    // Buscar um pedido pelo ID
    async findById(fastify: FastifyInstance, id: string): Promise<any | null> {
        try {
            // Consulta que une pedidos e seus itens
            const sql = `
                SELECT
                    p.id as pedido_id,
                    p.data,
                    p.status,
                    p.id_cliente,
                    i.id_produto,
                    i.qtde,
                    i.preco,
                    pr.nome as nome_produto,
                    pr.preco as preco_unitario,
                    c.nome as nome_cliente,
                    c.email as email_cliente
                FROM
                    pedidos p
                LEFT JOIN
                    pedido_itens i ON p.id = i.id_pedido
                LEFT JOIN
                    clientes c ON p.id_cliente = c.id
                LEFT JOIN
                    produtos pr ON i.id_produto = pr.id
                WHERE
                    p.id = ?
                `;

            const [rows] = await (fastify as any).mysql.query(sql, [id]);
            const results = rows as any[];

            if (results.length === 0) {
                return null;
            }

            const pedidoData = {
                id: results[0].pedido_id,
                data: results[0].data,
                id_cliente: results[0].id_cliente,
                status: results[0].status,
                nome_cliente: results[0].nome_cliente,
                email_cliente: results[0].email_cliente
            };

            const pedido = this.formatPedido(pedidoData);

            const itensMap = new Map<string, any>();

            for (const row of results) {
                if (row.id_produto) {
                    itensMap.set(row.id_produto, {
                        id_pedido: row.pedido_id,
                        id_produto: row.id_produto,
                        qtde: row.qtde,
                        preco: row.preco,
                        preco_unitario: row.preco_unitario,
                        nome_produto: row.nome_produto
                    });
                }
            }

            const itens = Array.from(itensMap.values());

            return {
                ...pedido,
                itens
            };
        } catch (error) {
            console.error(`Error in findById (${id}):`, error);
            throw error;
        }
    }

    // Buscar itens de um pedido
    async findItensByPedidoId(fastify: FastifyInstance, pedidoId: string) {
        try {
            const [rows] = await (fastify as any).mysql.query(
                'SELECT * FROM pedido_itens WHERE id_pedido = ?',
                [pedidoId]
            );

            return (rows as any[]).map(row => ({
                id_pedido: row.id_pedido,
                id_produto: row.id_produto,
                qtde: row.qtde,
                preco: row.preco
            }));
        } catch (error) {
            console.error(`Error in findItensByPedidoId (${pedidoId}):`, error);
            throw error;
        }
    }

    // Criar um novo pedido
    async create(fastify: FastifyInstance, pedidoData: Omit<Pedido, 'id' | 'status' | 'itens' | 'nome_cliente' | 'email_cliente'>, itens: Omit<PedidoItem, 'id_pedido'>[], idempotency_key: string) {
        try {
            // Iniciar transação
            await (fastify as any).mysql.query('START TRANSACTION');

            const id = uuidv4();
            const { data, id_cliente } = pedidoData;

            //buscar produtos no banco
            const produtos = await this.buscaProdutosDoPedido(fastify, itens);
            const produtosMap = new Map<string, Produto>(
                produtos.map((produto: Produto) => [produto.id, produto])
            );

            const dataFormatada = new Date(data).toLocaleString(['sv-SE']);
            // Inserir o pedido
            await (fastify as any).mysql.query(
                'INSERT INTO pedidos (id, data, id_cliente, idempotency_key) VALUES (?, ?, ?, ?)',
                [id, dataFormatada, id_cliente, idempotency_key]
            );

            await (fastify as any).mysql.query(
                'INSERT INTO pedidos_idempotency (idempotency_key, pedido_id) VALUES (?, ?)',
                [idempotency_key, id]
            );

            // Inserir os itens do pedido
            if (itens && itens.length > 0) {
                for (const item of itens) {
                    const itemProduto = produtosMap.get(item.id_produto);

                    if (!itemProduto) {
                        await (fastify as any).mysql.query('ROLLBACK');
                        return null;
                    }

                    const precoCalculado = itemProduto ? itemProduto.preco * item.qtde : 0;

                    await (fastify as any).mysql.query(
                        'INSERT INTO pedido_itens (id_pedido, id_produto, qtde, preco) VALUES (?, ?, ?, ?)',
                        [id, item.id_produto, item.qtde, precoCalculado]
                    );
                }
            }

            // Commit da transação
            await (fastify as any).mysql.query('COMMIT');

            // Retornar o pedido criado com seus itens
            return this.findById(fastify, id);
        } catch (error) {
            // Rollback em caso de erro
            await (fastify as any).mysql.query('ROLLBACK');
            console.error('Error in create:', error);
            throw error;
        }
    }

    // Atualizar um pedido existente
    async update(fastify: FastifyInstance, id: string, data: Partial<Omit<Pedido, 'id'>>, itens: Omit<PedidoItem, 'id_pedido'>[]) {
        const connection = await (fastify as any).mysql.getConnection();
        console.info(`Iniciando atualização do pedido com ID: ${id} e dados: ${JSON.stringify(data)} com itens: ${JSON.stringify(itens)}`);
        try {
            await connection.query('START TRANSACTION');

            const existingPedido = await this.findById(fastify, id);
            if (!existingPedido) {
                await connection.query('ROLLBACK');
                await connection.release();
                return null;
            }

            const updateParts = [];
            const values = [];

            if (data.data !== undefined) {
                updateParts.push('data = ?');
                values.push(new Date(data.data).toLocaleString(['sv-SE']));
            }

            if (data.id_cliente !== undefined) {
                updateParts.push('id_cliente = ?');
                values.push(data.id_cliente);
            }

            // Verificar explicitamente o status e garantir que seja um dos valores válidos do enum
            if (data.status !== undefined) {
                // Validar o valor do status
                const statusValue = data.status.toString();
                if (!Object.values(PedidoStatus).includes(statusValue as PedidoStatus)) {
                    await connection.query('ROLLBACK');
                    await connection.release();
                    throw new Error(`Status inválido: ${statusValue}. Valores permitidos: ${Object.values(PedidoStatus).join(', ')}`);
                }
                
                updateParts.push('status = ?');
                values.push(statusValue);
                console.log(`Atualizando status para: ${statusValue}`);
            }

            // Se houver campos para atualizar
            if (updateParts.length > 0) {
                // Adiciona o ID como último parâmetro
                values.push(id);

                const sql = `UPDATE pedidos SET ${updateParts.join(', ')} WHERE id = ?`
                // Executa a query de atualização
                console.info(`Executando query: ${sql} com valores ${JSON.stringify(values)}`);
                await connection.query(
                    sql,
                    values
                );
            }

            // Atualiza os itens do pedido se foram fornecidos
            if (itens && itens.length > 0) {
                // Primeiro, excluir TODOS os itens existentes de uma vez só
                await connection.query('DELETE FROM pedido_itens WHERE id_pedido = ?', [id]);
                
                // Buscar informações dos produtos para calcular preços
                const idsProdutos = itens.map(item => item.id_produto);
                const [produtos] = await connection.query(
                    'SELECT * FROM produtos WHERE id IN (?)',
                    [idsProdutos]
                );
                
                // Criar mapa de produtos para fácil acesso
                const produtosMap = new Map();
                for (const produto of produtos) {
                    produtosMap.set(produto.id, produto);
                }
                
                // Inserir todos os itens novamente
                for (const item of itens) {
                    const produto = produtosMap.get(item.id_produto);
                    if (!produto) {
                        await connection.query('ROLLBACK');
                        await connection.release();
                        throw new Error(`Produto com ID ${item.id_produto} não encontrado`);
                    }
                    
                    const precoCalculado = produto.preco * item.qtde;
                    
                    await connection.query(
                        'INSERT INTO pedido_itens (id_pedido, id_produto, qtde, preco) VALUES (?, ?, ?, ?)',
                        [id, item.id_produto, item.qtde, precoCalculado]
                    );
                }
            }

            // Commit da transação
            await connection.query('COMMIT');
            await connection.release();

            return this.findById(fastify, id);
        } catch (error) {
            // Rollback em caso de erro
            await connection.query('ROLLBACK');
            await connection.release();
            
            console.error(`Error in update (${id}):`, error);
            throw error;
        }
    }

    async delete(fastify: FastifyInstance, id: string): Promise<boolean> {
        try {
            await (fastify as any).mysql.query('START TRANSACTION');

            // Excluir os itens do pedido
            await (fastify as any).mysql.query(
                'DELETE FROM pedido_itens WHERE id_pedido = ?',
                [id]
            );

            // Excluir o pedido
            const [result] = await (fastify as any).mysql.query(
                'DELETE FROM pedidos WHERE id = ?',
                [id]
            );

            await (fastify as any).mysql.query('COMMIT');

            return (result as any).affectedRows > 0;
        } catch (error) {
            await (fastify as any).mysql.query('ROLLBACK');
            console.error(`Error in delete (${id}):`, error);
            throw error;
        }
    }

    private formatPedido(dbPedido: any): Omit<Pedido, 'itens'> {
        return {
            id: dbPedido.id,
            data: new Date(dbPedido.data),
            id_cliente: dbPedido.id_cliente,
            status: dbPedido.status,
            nome_cliente: dbPedido.nome_cliente,
            email_cliente: dbPedido.email_cliente
        };
    }

    private formatPedidoList(dbPedidos: any[]): Omit<Pedido, 'itens'>[] {
        return dbPedidos.map(pedido => this.formatPedido(pedido));
    }

    private async buscaProdutosDoPedido(fastify: FastifyInstance, itens: Omit<PedidoItem, 'id_pedido'>[]) {
        const idsProdutos = itens.map(item => item.id_produto);
        const [produtos] = await (fastify as any).mysql.query(
            'SELECT * FROM produtos WHERE id IN (?)',
            [idsProdutos]
        );
        return produtos;
    }
}

export const pedidoService = new PedidoService();