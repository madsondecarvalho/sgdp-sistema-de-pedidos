import { FastifyInstance } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import { Client } from '../entities/cliente.entity';

class ClientService {
  // Listar todos os clientes
  async findAll(fastify: FastifyInstance) {
    try {
      const [rows] = await (fastify as any).mysql.query('SELECT * FROM clientes WHERE deleted_at IS NULL');
      return this.formatClientList(rows as any[]);
    } catch (error) {
      console.error('Error in findAll:', error);
      throw error;
    }
  }

  // Buscar um cliente pelo ID
  async findById(fastify: FastifyInstance, id: string) {
    try {
      const [rows] = await (fastify as any).mysql.query(
        'SELECT * FROM clientes WHERE id = ? AND deleted_at IS NULL',
        [id]
      );

      const clients = rows as any[];
      if (clients.length === 0) return null;

      return this.formatClient(clients[0]);
    } catch (error) {
      console.error(`Error in findById (${id}):`, error);
      throw error;
    }
  }

  // Criar um novo cliente
  async create(fastify: FastifyInstance, clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const id = uuidv4();
      const { nome, email } = clientData;

      await (fastify as any).mysql.query(
        'INSERT INTO clientes (id, nome, email) VALUES (?, ?, ?)',
        [id, nome, email || null]
      );

      return this.findById(fastify, id);
    } catch (error) {
      console.error('Error in create:', error);
      throw error;
    }
  }

  // Atualizar um cliente existente
  async update(fastify: FastifyInstance, id: string, data: Partial<Client>) {
    try {
      // Verificar se o cliente existe
      const existingClient = await this.findById(fastify, id);
      if (!existingClient) return null;

      // Construir a query de atualização dinamicamente
      const updateParts = [];
      const values = [];

      if (data.nome !== undefined) {
        updateParts.push('nome = ?');
        values.push(data.nome);
      }

      if (data.email !== undefined) {
        updateParts.push('email = ?');
        values.push(data.email);
      }

      // Se não houver campos para atualizar, retorne o cliente existente
      if (updateParts.length === 0) {
        return existingClient;
      }

      // Adiciona o ID como último parâmetro
      values.push(id);

      // Executa a query de atualização
      await (fastify as any).mysql.query(
        `UPDATE clientes SET ${updateParts.join(', ')} WHERE id = ?`,
        values
      );

      // Retorna o cliente atualizado
      return this.findById(fastify, id);
    } catch (error) {
      console.error(`Error in update (${id}):`, error);
      throw error;
    }
  }

  // Excluir um cliente
  async delete(fastify: FastifyInstance, id: string): Promise<boolean> {
    try {
      const [result] = await (fastify as any).mysql.query(
        'UPDATE clientes SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL',
        [id]
      );

      return (result as any).affectedRows > 0;
    } catch (error) {
      console.error(`Error in soft delete (${id}):`, error);
      throw error;
    }
  }

  // Função auxiliar para formatar um cliente (converter snake_case para camelCase)
  private formatClient(dbClient: any): Client {
    return {
      id: dbClient.id, // Corrigido: agora usa o campo id em vez de id_cliente
      nome: dbClient.nome,
      email: dbClient.email,
      createdAt: dbClient.created_at ? new Date(dbClient.created_at).toISOString() as string : undefined,
      updatedAt: dbClient.updated_at ? new Date(dbClient.updated_at).toISOString() as string : undefined,
    };
  }

  // Função auxiliar para formatar uma lista de clientes
  private formatClientList(dbClients: any[]): Client[] {
    return dbClients.map(client => this.formatClient(client));
  }
}

// Exportando uma instância única do serviço
export const clientService = new ClientService();