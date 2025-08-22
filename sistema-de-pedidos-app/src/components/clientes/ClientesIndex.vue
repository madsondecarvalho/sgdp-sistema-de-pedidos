<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-4">Clientes</h1>
    
    <!-- Loading indicator -->
    <v-progress-circular
      v-if="loading"
      indeterminate
      color="primary"
      class="ma-4"
    ></v-progress-circular>
    
    <!-- Error message -->
    <v-alert
      v-if="error"
      type="error"
      class="mb-4"
    >
      {{ error }}
    </v-alert>
    
    <!-- Data table -->
    <v-card v-if="!loading && !error">
      <v-data-table
        :headers="headers"
        :items="clientes"
        :items-per-page="10"
        class="elevation-1"
      >
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>Lista de Clientes</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              prepend-icon="mdi-plus"
              @click="abrirNovoClienteModal"
            >
              Novo Cliente
            </v-btn>
          </v-toolbar>
        </template>
        
        <template v-slot:item.actions="{ item }">
          <div class="d-flex">
            <v-btn
              icon="mdi-pencil"
              variant="text"
              density="comfortable"
              class="mr-2"
              @click="editItem(item)"
            ></v-btn>
            <v-btn
              icon="mdi-delete"
              variant="text"
              density="comfortable"
              color="error"
              @click="confirmDeleteItem(item)"
            ></v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Modal de Criar Cliente -->
    <CriarCliente 
      v-model="modalNovoCliente"
      @cliente-criado="handleClienteCriado"
      @error="handleError"
    />

    <!-- Modal de Atualizar Cliente -->
    <AtualizarCliente
      v-model="modalAtualizarCliente"
      :cliente="clienteSelecionado"
      @cliente-atualizado="handleClienteAtualizado"
      @error="handleError"
    />

    <!-- Modal de Excluir Cliente -->
    <DeletarCliente
      v-model="modalDeletarCliente"
      :cliente="clienteSelecionado"
      @cliente-excluido="handleClienteExcluido"
      @error="handleError"
    />

    <!-- Snackbar para mensagens de sucesso/erro -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
    >
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn
          variant="text"
          @click="snackbar.show = false"
        >
          Fechar
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import axios from 'axios';
import CriarCliente from './modals/CriarCliente.vue';
import AtualizarCliente from './modals/AtualizarCliente.vue';
import DeletarCliente from './modals/DeletarCliente.vue';

interface Cliente {
  id: string;
  nome: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

// Estado
const clientes = ref<Cliente[]>([]);
const loading = ref(true);
const error = ref('');
const modalNovoCliente = ref(false);
const modalAtualizarCliente = ref(false);
const modalDeletarCliente = ref(false);
const clienteSelecionado = ref<Cliente>({
  id: '',
  nome: '',
  email: '',
  createdAt: '',
  updatedAt: ''
});

const snackbar = reactive({
  show: false,
  text: '',
  color: 'success'
});

// Definição das colunas da tabela - apenas nome e email serão exibidos
const headers = [
  { title: 'Nome', key: 'nome' },
  { title: 'Email', key: 'email' },
  { title: 'Ações', key: 'actions', sortable: false }
];

// Buscar dados da API
const fetchClientes = async () => {
  try {
    loading.value = true;
    error.value = '';
    
    const response = await axios.get('http://localhost:3333/clientes');
    
    // Acessando a propriedade 'clients' da resposta
    if (response.data && response.data.clients) {
      clientes.value = response.data.clients;
    } else {
      throw new Error('Formato de resposta inválido');
    }
  } catch (err: any) {
    console.error('Erro ao buscar clientes:', err);
    error.value = `Não foi possível carregar os clientes: ${err.message || 'Erro desconhecido'}`;
  } finally {
    loading.value = false;
  }
};

// Métodos para CRUD
const abrirNovoClienteModal = () => {
  modalNovoCliente.value = true;
};

const handleClienteCriado = async () => {
  // Mostrar mensagem de sucesso
  snackbar.text = 'Cliente adicionado com sucesso!';
  snackbar.color = 'success';
  snackbar.show = true;
  
  // Recarregar a lista de clientes
  await fetchClientes();
};

const handleClienteAtualizado = async () => {
  // Mostrar mensagem de sucesso
  snackbar.text = 'Cliente atualizado com sucesso!';
  snackbar.color = 'success';
  snackbar.show = true;
  
  // Recarregar a lista de clientes
  await fetchClientes();
};

const handleClienteExcluido = async () => {
  // Mostrar mensagem de sucesso
  snackbar.text = 'Cliente excluído com sucesso!';
  snackbar.color = 'success';
  snackbar.show = true;
  
  // Recarregar a lista de clientes
  await fetchClientes();
};

const handleError = (mensagem: string) => {
  // Mostrar mensagem de erro
  snackbar.text = `Erro: ${mensagem}`;
  snackbar.color = 'error';
  snackbar.show = true;
};

const editItem = (item: Cliente) => {
  // Definir o cliente selecionado e abrir modal
  clienteSelecionado.value = { ...item }; // Cria uma cópia para não modificar direto
  modalAtualizarCliente.value = true;
};

const confirmDeleteItem = (item: Cliente) => {
  // Definir o cliente selecionado e abrir modal de confirmação
  clienteSelecionado.value = { ...item };
  modalDeletarCliente.value = true;
};

// Buscar dados quando o componente for montado
onMounted(() => {
  fetchClientes();
});
</script>

<style scoped>
/* Estilos específicos do componente, se necessário */
</style>