// Definindo uma interface TypeScript em vez de usar Zod
export interface Client {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}