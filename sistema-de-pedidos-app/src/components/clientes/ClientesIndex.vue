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
              @click="novoCliente"
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
              @click="deleteItem(item)"
            ></v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';

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
const novoCliente = () => {
  // Implementar lógica para adicionar novo cliente
  console.log('Adicionar novo cliente');
};

const editItem = (item: Cliente) => {
  // Implementar lógica para editar cliente
  console.log('Editar cliente:', item.nome);
};

const deleteItem = (item: Cliente) => {
  // Implementar lógica para excluir cliente
  console.log('Excluir cliente:', item.nome);
};

// Buscar dados quando o componente for montado
onMounted(() => {
  fetchClientes();
});
</script>

<style scoped>
/* Estilos específicos do componente, se necessário */
</style>