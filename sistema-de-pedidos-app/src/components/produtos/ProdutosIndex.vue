<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-4">Produtos</h1>
    
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
        :items="produtos"
        :items-per-page="10"
        class="elevation-1"
      >
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>Lista de Produtos</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              variant="elevated"
              prepend-icon="mdi-plus"
              @click="abrirNovoProdutoModal"
            >
              Novo Produto
            </v-btn>
          </v-toolbar>
        </template>
        
        <template v-slot:item.preco="{ item }">
          <span>{{ formatCurrency(item.preco) }}</span>
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

    <CriarProduto 
      v-model="modalNovoProduto"
      @produto-criado="handleProdutoCriado"
      @error="handleError"
    />

    <AtualizarProduto
      v-model="modalAtualizarProduto"
      :produto="produtoSelecionado"
      @produto-atualizado="handleProdutoAtualizado"
      @error="handleError"
    />

    <DeletarProduto
      v-model="modalDeletarProduto"
      :produto="produtoSelecionado"
      @produto-excluido="handleProdutoExcluido"
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
// IMPORTANTE: Você precisará criar estes componentes de modal para produtos
import CriarProduto from './modals/CriarProduto.vue';
import AtualizarProduto from './modals/AtualizarProduto.vue';
import DeletarProduto from './modals/DeletarProduto.vue';

interface Produto {
  id: string;
  nome: string;
  preco: number; // Preço vem como número (centavos)
  createdAt: string;
  updatedAt: string;
}

// Estado
const produtos = ref<Produto[]>([]);
const loading = ref(true);
const error = ref('');
const modalNovoProduto = ref(false);
const modalAtualizarProduto = ref(false);
const modalDeletarProduto = ref(false);
const produtoSelecionado = ref<Produto>({
  id: '',
  nome: '',
  preco: 0,
  createdAt: '',
  updatedAt: ''
});

const snackbar = reactive({
  show: false,
  text: '',
  color: 'success'
});

// Definição das colunas da tabela
const headers = [
  { title: 'Nome', key: 'nome', width: '60%' },
  { title: 'Preço', key: 'preco' },
  { title: 'Ações', key: 'actions', sortable: false, align: 'end' }
] as const;

// Função para formatar o preço (de centavos para BRL)
const formatCurrency = (value: number) => {
  if (typeof value !== 'number') return 'R$ 0,00';
  // Converte de centavos para reais
  const valueInReais = value / 100;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valueInReais);
};

// Buscar dados da API
const fetchProdutos = async () => {
  try {
    loading.value = true;
    error.value = '';
    
    const response = await axios.get('http://localhost:3333/produtos');
    
    // Acessando a propriedade 'produtos' da resposta
    if (response.data && response.data.produtos) {
      produtos.value = response.data.produtos;
    } else {
      throw new Error('Formato de resposta da API de produtos é inválido');
    }
  } catch (err: any) {
    console.error('Erro ao buscar produtos:', err);
    error.value = `Não foi possível carregar os produtos: ${err.message || 'Erro desconhecido'}`;
  } finally {
    loading.value = false;
  }
};

// Métodos para CRUD
const abrirNovoProdutoModal = () => {
  modalNovoProduto.value = true;
};

const handleProdutoCriado = async () => {
  snackbar.text = 'Produto adicionado com sucesso!';
  snackbar.color = 'success';
  snackbar.show = true;
  await fetchProdutos();
};

const handleProdutoAtualizado = async () => {
  snackbar.text = 'Produto atualizado com sucesso!';
  snackbar.color = 'success';
  snackbar.show = true;
  await fetchProdutos();
};

const handleProdutoExcluido = async () => {
  snackbar.text = 'Produto excluído com sucesso!';
  snackbar.color = 'success';
  snackbar.show = true;
  await fetchProdutos();
};

const handleError = (mensagem: string) => {
  snackbar.text = `Erro: ${mensagem}`;
  snackbar.color = 'error';
  snackbar.show = true;
};

const editItem = (item: Produto) => {
  produtoSelecionado.value = { ...item };
  modalAtualizarProduto.value = true;
};

const confirmDeleteItem = (item: Produto) => {
  produtoSelecionado.value = { ...item };
  modalDeletarProduto.value = true;
};

// Buscar dados quando o componente for montado
onMounted(() => {
  fetchProdutos();
});
</script>

<style scoped>
/* Estilos específicos do componente, se necessário */
</style>