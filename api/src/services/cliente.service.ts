import { Client, clientSchema } from '../models/cliente.model';

// Função para serializar um cliente (converte Date para string ISO)
function serializeClient(client: Client) {
  return {
    ...client,
    createdAt: client.createdAt?.toISOString(),
    updatedAt: client.updatedAt?.toISOString(),
  };
}

// Simulando um banco de dados em memória
class ClientService {
  private clients: Client[] = [];

  constructor() {
    // Adicionando alguns clientes para teste
    this.clients = [
      {
        id: '1',
        name: 'João Silva',
        email: 'joao@example.com',
        phone: '11999998888',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        name: 'Maria Souza',
        email: 'maria@example.com',
        phone: '11988887777',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  findAll() {
    // Serializa todos os clientes antes de retornar
    return this.clients.map(serializeClient);
  }

  findById(id: string) {
    const client = this.clients.find(client => client.id === id);
    return client ? serializeClient(client) : undefined;
  }

  create(clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) {
    const newClient: Client = {
      ...clientData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.clients.push(newClient);
    return serializeClient(newClient);
  }

  update(id: string, data: Partial<Client>) {
    const clientIndex = this.clients.findIndex(client => client.id === id);
    
    if (clientIndex === -1) return undefined;
    
    this.clients[clientIndex] = {
      ...this.clients[clientIndex],
      ...data,
      updatedAt: new Date(),
    };
    
    return serializeClient(this.clients[clientIndex]);
  }

  delete(id: string): boolean {
    const initialLength = this.clients.length;
    this.clients = this.clients.filter(client => client.id !== id);
    return initialLength > this.clients.length;
  }
}

// Exportando uma instância única do serviço
export const clientService = new ClientService();