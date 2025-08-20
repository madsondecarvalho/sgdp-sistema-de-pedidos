import { FastifyInstance } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import { Produto } from '../entities/produto.entity';

class ProdutoService {
  // Listar todos os produtos
  async findAll(fastify: FastifyInstance) {
    try {
      const [rows] = await (fastify as any).mysql.query('SELECT * FROM produtos');
      return this.formatProdutoList(rows as any[]);
    } catch (error) {
      console.error('Error in findAll:', error);
      throw error;
    }
  }

  // Buscar um produto pelo ID
  async findById(fastify: FastifyInstance, id: string) {
    try {
      const [rows] = await (fastify as any).mysql.query(
        'SELECT * FROM produtos WHERE id = ?',
        [id]
      );

      const produtos = rows as any[];
      if (produtos.length === 0) return null;

      return this.formatProduto(produtos[0]);
    } catch (error) {
      console.error(`Error in findById (${id}):`, error);
      throw error;
    }
  }

  // Criar um novo produto
  async create(fastify: FastifyInstance, produtoData: Omit<Produto, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const id = uuidv4();
      const { nome, preco } = produtoData;

      await (fastify as any).mysql.query(
        'INSERT INTO produtos (id, nome, preco) VALUES (?, ?, ?)',
        [id, nome, preco]
      );

      return this.findById(fastify, id);
    } catch (error) {
      console.error('Error in create:', error);
      throw error;
    }
  }

  // Atualizar um produto existente
  async update(fastify: FastifyInstance, id: string, data: Partial<Produto>) {
    try {
      // Verificar se o produto existe
      const existingProduto = await this.findById(fastify, id);
      if (!existingProduto) return null;

      // Construir a query de atualização dinamicamente
      const updateParts = [];
      const values = [];

      if (data.nome !== undefined) {
        updateParts.push('nome = ?');
        values.push(data.nome);
      }


      if (data.preco !== undefined) {
        updateParts.push('preco = ?');
        values.push(data.preco);
      }

      // Se não houver campos para atualizar, retorne o produto existente
      if (updateParts.length === 0) {
        return existingProduto;
      }

      // Adiciona o ID como último parâmetro
      values.push(id);

      // Executa a query de atualização
      await (fastify as any).mysql.query(
        `UPDATE produtos SET ${updateParts.join(', ')} WHERE id = ?`,
        values
      );

      // Retorna o produto atualizado
      return this.findById(fastify, id);
    } catch (error) {
      console.error(`Error in update (${id}):`, error);
      throw error;
    }
  }

  // Excluir um produto
  async delete(fastify: FastifyInstance, id: string): Promise<boolean> {
    try {
      const [result] = await (fastify as any).mysql.query(
        'DELETE FROM produtos WHERE id = ?',
        [id]
      );

      return (result as any).affectedRows > 0;
    } catch (error) {
      console.error(`Error in delete (${id}):`, error);
      throw error;
    }
  }

  // Função auxiliar para formatar um produto
  private formatProduto(dbProduto: any): Produto {
    return {
      id: dbProduto.id,
      nome: dbProduto.nome,
      preco: parseFloat(dbProduto.preco),
      createdAt: dbProduto.created_at ? new Date(dbProduto.created_at).toISOString() as string : undefined,
      updatedAt: dbProduto.updated_at ? new Date(dbProduto.updated_at).toISOString() as string : undefined,
    };
  }

  // Função auxiliar para formatar uma lista de produtos
  private formatProdutoList(dbProdutos: any[]): Produto[] {
    return dbProdutos.map(produto => this.formatProduto(produto));
  }
}

// Exportando uma instância única do serviço
export const produtoService = new ProdutoService();