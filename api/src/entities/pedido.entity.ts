import { PedidoItem } from "./pedido_item.entity";

export enum PedidoStatus {
  EM_ANALISE = 'EM_ANALISE',
  CONFIRMADO = 'CONFIRMADO',
  CANCELADO = 'CANCELADO'
}

export interface Pedido {
  id: string;
  data: Date;
  id_cliente: string;
  status: string; 
  itens: PedidoItem[];
  nome_cliente: string;
  email_cliente: string;
}
