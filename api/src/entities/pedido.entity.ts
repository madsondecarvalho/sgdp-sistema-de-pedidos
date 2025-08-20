import { PedidoItem } from "./pedido_item.entity";

export interface Pedido {
  id: string;
  data: Date;
  id_cliente: string;
  status: 'EM_ANALISE' | 'CONFIRMADO' | 'CANCELADO';
  itens: PedidoItem[];
}
