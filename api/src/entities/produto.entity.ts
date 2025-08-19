export interface Produto {
  id: string;
  nome: string;
  preco: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}
