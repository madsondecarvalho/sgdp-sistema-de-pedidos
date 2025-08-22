<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-4">Pedidos</h1>
    
    <div v-if="loading" class="text-center pa-12">
      <v-progress-circular
        indeterminate
        color="primary"
        size="64"
      ></v-progress-circular>
      <p class="mt-4 text-medium-emphasis">Carregando pedidos...</p>
    </div>
    
    <v-alert
      v-if="!loading && error"
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
        no-data-text="Nenhum pedido encontrado."
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
        
        <template v-slot:item.id="{ item }">
          <a
            href="#"
            class="font-weight-bold text-primary"
            style="text-decoration: underline; cursor: pointer;"
            @click.prevent="abrirModalDetalhes(item)"
          >
            {{ item.id.substring(0, 8) }}...
          </a>
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
            <v-btn icon="mdi-eye" variant="text" density="comfortable" @click="abrirModalDetalhes(item)" title="Ver Detalhes"></v-btn>
            <v-btn icon="mdi-pencil" variant="text" density="comfortable" class="mx-1" @click="editItem(item)" title="Editar Status"></v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <DetalhesPedido
      v-model="modalDetalhes"
      :pedido-id="pedidoSelecionado?.id"
    />
    <CriarPedido 
      v-model="modalNovoPedido" 
      @pedido-criado="handlePedidoCriado" 
      @error="handleError" 
    />
    <AtualizarPedido 
      v-if="pedidoSelecionado"
      v-model="modalAtualizarPedido" 
      :pedido="pedidoSelecionado" 
      @pedido-atualizado="handlePedidoAtualizado" 
      @error="handleError" 
    />

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000" location="top right">
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn icon="mdi-close" variant="text" @click="snackbar.show = false"></v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import axios from 'axios';

import CriarPedido from './modals/CriarPedido.vue';
import AtualizarPedido from './modals/AtualizarPedido.vue';
import DetalhesPedido from './modals/DetalhesPedido.vue';

interface Pedido {
  id: string;
  data: string;
  id_cliente: string;
  status: string;
}

const pedidos = ref<Pedido[]>([]);
const loading = ref(true);
const error = ref('');
const modalNovoPedido = ref(false);
const modalAtualizarPedido = ref(false);
const modalDeletarPedido = ref(false);
const modalDetalhes = ref(false);
const pedidoSelecionado = ref<Pedido | null>(null);

const snackbar = reactive({
  show: false,
  text: '',
  color: 'success'
});

const headers = [
  { title: 'ID do Pedido', key: 'id', width: '25%' },
  { title: 'Data do Pedido', key: 'data' },
  { title: 'Status', key: 'status' },
  { title: 'Ações', key: 'actions', sortable: false, align: 'end', width: '150px' }
] as const;

// --- FUNÇÕES ESSENCIAIS ---

const formatDateTime = (isoString: string) => {
  if (!isoString) return 'N/A';
  return new Date(isoString).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

const getStatusChipProps = (status: string) => {
  switch (status) {
    case 'EM_ANALISE': return { color: 'orange', text: 'Em Análise' };
    case 'APROVADO': return { color: 'success', text: 'Aprovado' };
    case 'CANCELADO': return { color: 'error', text: 'Cancelado' };
    case 'ENVIADO': return { color: 'info', text: 'Enviado' };
    case 'ENTREGUE': return { color: 'primary', text: 'Entregue' };
    default: return { color: 'grey', text: status };
  }
};

const fetchPedidos = async () => {
  // Adicione um log para depuração
  console.log('Iniciando busca de pedidos...');
  try {
    loading.value = true;
    error.value = '';
    
    const response = await axios.get('http://localhost:3333/pedidos');
    
    if (response.data && response.data.pedidos) {
      pedidos.value = response.data.pedidos;
      console.log('Pedidos carregados com sucesso:', response.data.pedidos);
    } else {
      throw new Error('Formato de resposta da API de pedidos é inválido');
    }
  } catch (err: any) {
    console.error('Erro ao buscar pedidos:', err);
    error.value = `Não foi possível carregar os pedidos: ${err.message || 'Erro desconhecido'}`;
  } finally {
    // ESSA LINHA É CRUCIAL e garante que o loading pare
    loading.value = false;
    console.log('Busca de pedidos finalizada.');
  }
};

// --- Funções de Manipulação de CRUD e Modais ---

const abrirNovoPedidoModal = () => { modalNovoPedido.value = true; };
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

const abrirModalDetalhes = (item: Pedido) => {
  pedidoSelecionado.value = item;
  modalDetalhes.value = true;
};

// --- Gatilho Inicial ---

// ESSA É A LINHA QUE INICIA TODO O PROCESSO
onMounted(() => {
  console.log('Componente PedidosIndex montado. Chamando fetchPedidos...');
  fetchPedidos();
});
</script>