import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

// Importando os componentes
import ClientesIndex from '../components/clientes/ClientesIndex.vue'
import ProdutosIndex from '../components/produtos/ProdutosIndex.vue'
import PedidosIndex from '../components/pedidos/PedidosIndex.vue'
import Index from '../components/Index.vue'

// Definindo as rotas
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Início',
    component: Index
  },
  {
    path: '/clientes',
    name: 'Clientes',
    component: ClientesIndex
  },
  {
    path: '/produtos',
    name: 'Produtos',
    component: ProdutosIndex
  },
  {
    path: '/pedidos',
    name: 'Pedidos',
    component: PedidosIndex
  }
]

// Criando o router
const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
