import { z } from 'zod/v4';

export const clientSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(3, { message: 'Nome precisa ter pelo menos 3 caracteres' }),
  email: z.string().email({ message: 'Email inválido' }),
  phone: z.string().min(10, { message: 'Telefone inválido' }).optional(),
  // Usando coerce.date() para converter strings em datas automaticamente
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export type Client = {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  createdAt?: Date;
  updatedAt?: Date;
};