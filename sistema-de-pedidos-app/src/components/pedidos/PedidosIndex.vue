<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-4">Pedidos</h1>
    
    <v-progress-circular
      v-if="loading"
      indeterminate
      color="primary"
      class="ma-4"
    ></v-progress-circular>
    
    <v-alert
      v-if="error"
      type="error"
      class="mb-4"
      variant="tonal"
      border="start"
    >
      {{ error }}
    </v-alert>
    
    <v-card v-if="!loading && !error" rounded="lg">
      <v-data-table
        :headers="headers"
        :items="pedidos"
        :items-per-page="10"
        class="elevation-1"
      >
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>Lista de Pedidos</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              variant="elevated"
              prepend-icon="mdi-plus"
              @click="abrirNovoPedidoModal"
            >
              Novo Pedido
            </v-btn>
          </v-toolbar>
        </template>
        
        <template v-slot:item.data="{ item }">
          <span>{{ formatDateTime(item.data) }}</span>
        </template>
        
        <template v-slot:item.status="{ item }">
          <v-chip
            :color="getStatusChipProps(item.status).color"
            :text="getStatusChipProps(item.status).text"
            label
            size="small"
          ></v-chip>
        </template>
        
        <template v-slot:item.actions="{ item }">
          <div class="d-flex">
            <v-btn
              icon="mdi-pencil"
              variant="text"
              density="comfortable"
              class="mr-2"
              @click="editItem(item)"
              title="Editar Pedido"
            ></v-btn>
            <v-btn
              icon="mdi-delete"
              variant="text"
              density="comfortable"
              color="error"
              @click="confirmDeleteItem(item)"
              title="Excluir Pedido"
            ></v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <CriarPedido 
      v-model="modalNovoPedido"
      @pedido-criado="handlePedidoCriado"
      @error="handleError"
    />

    <AtualizarPedido
      v-model="modalAtualizarPedido"
      :pedido="pedidoSelecionado"
      @pedido-atualizado="handlePedidoAtualizado"
      @error="handleError"
    />

    <DeletarPedido
      v-model="modalDeletarPedido"
      :pedido="pedidoSelecionado"
      @pedido-excluido="handlePedidoExcluido"
      @error="handleError"
    />

    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
      location="top right"
    >
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn
          icon="mdi-close"
          variant="text"
          @click="snackbar.show = false"
        ></v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import axios from 'axios';
// IMPORTANTE: Modais a serem criados para a entidade 'Pedido'
import CriarPedido from './modals/CriarPedido.vue';
import AtualizarPedido from './modals/AtualizarPedido.vue';
import DeletarPedido from './modals/DeletarPedido.vue';

// 1. Interface atualizada para Pedido
interface Pedido {
  id: string;
  data: string;
  id_cliente: string;
  status: string;
}

// Estado
const pedidos = ref<Pedido[]>([]);
const loading = ref(true);
const error = ref('');
const modalNovoPedido = ref(false);
const modalAtualizarPedido = ref(false);
const modalDeletarPedido = ref(false);
const pedidoSelecionado = ref<Pedido>({
  id: '',
  data: '',
  id_cliente: '',
  status: ''
});

const snackbar = reactive({
  show: false,
  text: '',
  color: 'success'
});

// 2. Colunas da tabela atualizadas para Pedido
const headers = [
  { title: 'Cliente (ID)', key: 'id_cliente', width: '40%' },
  { title: 'Data do Pedido', key: 'data' },
  { title: 'Status', key: 'status' },
  { title: 'Ações', key: 'actions', sortable: false, align: 'end' }
] as const;

// 3. Funções de formatação para os novos tipos de dados
const formatDateTime = (isoString: string) => {
  if (!isoString) return 'N/A';
  return new Date(isoString).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getStatusChipProps = (status: string) => {
  switch (status) {
    case 'EM_ANALISE':
      return { color: 'orange', text: 'Em Análise' };
    case 'APROVADO':
      return { color: 'success', text: 'Aprovado' };
    case 'CANCELADO':
      return { color: 'error', text: 'Cancelado' };
    default:
      return { color: 'grey', text: status };
  }
};

// 4. Lógica da API atualizada para o endpoint de Pedidos
const fetchPedidos = async () => {
  try {
    loading.value = true;
    error.value = '';
    
    const response = await axios.get('http://localhost:3333/pedidos');
    
    if (response.data && response.data.pedidos) {
      pedidos.value = response.data.pedidos;
    } else {
      throw new Error('Formato de resposta da API de pedidos é inválido');
    }
  } catch (err: any) {
    console.error('Erro ao buscar pedidos:', err);
    error.value = `Não foi possível carregar os pedidos: ${err.message || 'Erro desconhecido'}`;
  } finally {
    loading.value = false;
  }
};

// Métodos para CRUD (nomes atualizados)
const abrirNovoPedidoModal = () => {
  modalNovoPedido.value = true;
};

const handlePedidoCriado = async () => {
  snackbar.text = 'Pedido adicionado com sucesso!';
  snackbar.color = 'success';
  snackbar.show = true;
  await fetchPedidos();
};

const handlePedidoAtualizado = async () => {
  snackbar.text = 'Pedido atualizado com sucesso!';
  snackbar.color = 'success';
  snackbar.show = true;
  await fetchPedidos();
};

const handlePedidoExcluido = async () => {
  snackbar.text = 'Pedido excluído com sucesso!';
  snackbar.color = 'success';
  snackbar.show = true;
  await fetchPedidos();
};

const handleError = (mensagem: string) => {
  snackbar.text = `Erro: ${mensagem}`;
  snackbar.color = 'error';
  snackbar.show = true;
};

const editItem = (item: Pedido) => {
  pedidoSelecionado.value = { ...item };
  modalAtualizarPedido.value = true;
};

const confirmDeleteItem = (item: Pedido) => {
  pedidoSelecionado.value = { ...item };
  modalDeletarPedido.value = true;
};

onMounted(() => {
  fetchPedidos();
});
</script>