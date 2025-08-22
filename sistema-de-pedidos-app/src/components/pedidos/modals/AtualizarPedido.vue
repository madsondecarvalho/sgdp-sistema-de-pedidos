<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="800px"
    persistent transition="dialog-bottom-transition">
    <v-card rounded="lg">
      <v-toolbar class="pl-4" color="primary" density="compact">
        <v-icon start>mdi-pencil</v-icon>
        <v-toolbar-title class="text-h6 font-weight-light">
          Atualizar Pedido
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="fecharModal">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-overlay v-model="loadingDetalhes" contained persistent class="align-center justify-center">
        <v-progress-circular indeterminate color="white" size="64"></v-progress-circular>
        <p class="mt-4">Carregando dados do pedido...</p>
      </v-overlay>

      <v-card-text class="pa-5">
        <v-list-subheader>STATUS DO PEDIDO</v-list-subheader>
        <v-select
          v-model="status"
          :items="listaStatus"
          label="Status"
          variant="outlined"
          class="mb-4"
        ></v-select>

        <v-list-subheader>DADOS DO CLIENTE</v-list-subheader>
        <v-autocomplete v-model="clienteSelecionado" :items="clientesEncontrados" :loading="loadingClientes"
          @update:search="debouncedBuscaClientes" item-title="nome" item-value="id" return-object
          label="Buscar cliente por nome ou e-mail" placeholder="Comece a digitar para buscar..." variant="outlined"
          :error-messages="erros.cliente">
          <template v-slot:item="{ props, item }">
            <v-list-item v-bind="props" :subtitle="item.raw.email"></v-list-item>
          </template>
        </v-autocomplete>

        <v-list-subheader class="mt-4">ITENS DO PEDIDO</v-list-subheader>
        <v-divider class="mb-4"></v-divider>

        <div v-for="(item, index) in itens" :key="item.uniqueId" class="item-row mb-4">
          <v-row align="center">
            <v-col cols="12" md="6">
              <v-autocomplete v-model="item.produto" :items="produtosEncontrados"
                :loading="loadingProdutos" @update:search="debouncedBuscaProdutos"
                item-title="nome" item-value="id" return-object label="Buscar produto"
                placeholder="Comece a digitar..." variant="outlined" density="compact" hide-details>
                <template v-slot:item="{ props, item }">
                  <v-list-item v-bind="props" :subtitle="formatCurrency(item.raw.preco)"></v-list-item>
                </template>
              </v-autocomplete>
            </v-col>
            <v-col cols="6" md="3">
              <v-text-field v-model.number="item.qtde" label="Quantidade" type="number" min="1"
                variant="outlined" density="compact" hide-details></v-text-field>
            </v-col>
            <v-col cols="6" md="3" class="text-right">
              <v-btn v-if="itens.length > 1" icon="mdi-delete-outline" variant="text" color="error"
                @click="removerItem(index)" title="Remover item"></v-btn>
            </v-col>
          </v-row>
        </div>
        
        <v-btn @click="adicionarItem" color="primary" variant="tonal" prepend-icon="mdi-plus">
          Adicionar Item
        </v-btn>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="fecharModal" class="me-2">
          Cancelar
        </v-btn>
        <v-btn color="primary" variant="elevated" :loading="salvando" @click="atualizarPedido"
          prepend-icon="mdi-content-save">
          Salvar Alterações
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import type { PropType } from 'vue';
import axios from 'axios';

// --- INTERFACES ---
interface Cliente { id: string; nome: string; email: string; }
interface Produto { id: string; nome: string; preco: number; }
interface ItemForm {
  uniqueId: number;
  produto: Produto | null;
  qtde: number;
}
interface PedidoResumo { id: string; }

// --- PROPS E EMITS ---
const props = defineProps({
  modelValue: { type: Boolean, required: true },
  pedido: { type: Object as PropType<PedidoResumo>, required: true }
});
const emit = defineEmits(['update:modelValue', 'pedido-atualizado', 'error']);

// --- ESTADO DO COMPONENTE ---
const salvando = ref(false);
const loadingDetalhes = ref(false);
const status = ref('');
const clienteSelecionado = ref<Cliente | null>(null);
const itens = ref<ItemForm[]>([]);
const erros = reactive({ cliente: '' });

const listaStatus = ['EM_ANALISE', 'CONFIRMADO', 'CANCELADO'];
const loadingClientes = ref(false);
const clientesEncontrados = ref<Cliente[]>([]);
const loadingProdutos = ref(false);
const produtosEncontrados = ref<Produto[]>([]);
let searchClientQuery = ref('');
let searchProductQuery = ref('');


// --- BUSCA E PREENCHIMENTO INICIAL ---
const fetchAndPopulatePedido = async (pedidoId: string) => {
  loadingDetalhes.value = true;
  resetForm(); // Limpa o formulário antes de preencher
  try {
    const response = await axios.get(`http://localhost:3333/pedidos/${pedidoId}`);
    const pedidoDetalhado = response.data.pedido;

    // Preenche o status
    status.value = pedidoDetalhado.status;
    
    // Preenche o cliente
    const clienteInicial = {
      id: pedidoDetalhado.id_cliente,
      nome: pedidoDetalhado.nome_cliente,
      email: pedidoDetalhado.email_cliente
    };
    clienteSelecionado.value = clienteInicial;
    clientesEncontrados.value = [clienteInicial];

    // Preenche os itens
    if (pedidoDetalhado.itens && pedidoDetalhado.itens.length > 0) {
      // Assumindo que a API retorna 'nome_produto' e 'preco_unitario'
      itens.value = pedidoDetalhado.itens.map((apiItem: any) => {
        const produtoInicial = {
          id: apiItem.id_produto,
          nome: apiItem.nome_produto || 'Produto não encontrado',
          preco: apiItem.preco_unitario || 0
        };
        if (!produtosEncontrados.value.some(p => p.id === produtoInicial.id)) {
          produtosEncontrados.value.push(produtoInicial);
        }
        return {
          uniqueId: Date.now() + Math.random(),
          produto: produtoInicial,
          qtde: apiItem.qtde
        };
      });
    } else {
      itens.value = []; // Garante que a lista de itens fique vazia se não houver itens
    }

  } catch (err: any) {
    emit('error', `Erro ao carregar dados do pedido: ${err.message}`);
    fecharModal();
  } finally {
    loadingDetalhes.value = false;
  }
};

watch(() => props.modelValue, (isOpen) => {
  if (isOpen && props.pedido) {
    fetchAndPopulatePedido(props.pedido.id);
  }
});

// --- LÓGICA DE BUSCA COM DEBOUNCE ---
watch(searchClientQuery, (newQuery) => {
  if (newQuery && newQuery.length > 2) {
    loadingClientes.value = true;
    buscarClientes(newQuery);
  } else if (!clienteSelecionado.value) { // Não limpa se um cliente já estiver selecionado
    clientesEncontrados.value = [];
  }
});
const debouncedBuscaClientes = debounce((query: string) => searchClientQuery.value = query, 300);

watch(searchProductQuery, (newQuery) => {
  if (newQuery && newQuery.length > 2) {
    loadingProdutos.value = true;
    buscarProdutos(newQuery);
  }
});
const debouncedBuscaProdutos = debounce((query: string) => searchProductQuery.value = query, 300);

const buscarClientes = async (query: string) => {
  try {
    const response = await axios.get(`http://localhost:3333/clientes?search=${query}`);
    clientesEncontrados.value = response.data.clients || [];
  } catch (err) {
    console.error("Erro ao buscar clientes:", err);
    clientesEncontrados.value = [];
  } finally {
    loadingClientes.value = false;
  }
};

const buscarProdutos = async (query: string) => {
  try {
    const response = await axios.get(`http://localhost:3333/produtos?search=${query}`);
    produtosEncontrados.value = response.data.produtos || [];
  } catch (err) {
    console.error("Erro ao buscar produtos:", err);
    produtosEncontrados.value = [];
  } finally {
    loadingProdutos.value = false;
  }
};

// --- GERENCIAMENTO DOS ITENS ---
const adicionarItem = () => {
  itens.value.push({ uniqueId: Date.now(), produto: null, qtde: 1 });
};

const removerItem = (index: number) => {
  itens.value.splice(index, 1);
};

// --- VALIDAÇÃO E SUBMISSÃO ---
const validarFormulario = (): boolean => {
  let valido = true;
  if (!clienteSelecionado.value) {
    erros.cliente = "É necessário selecionar um cliente.";
    valido = false;
  } else {
    erros.cliente = "";
  }
  const itensValidos = itens.value.filter(item => item.produto && item.qtde > 0);
  if (itensValidos.length === 0) {
    emit('error', 'É necessário adicionar pelo menos um item válido ao pedido.');
    valido = false;
  }
  return valido;
};

const atualizarPedido = async () => {
  if (!validarFormulario()) return;

  try {
    salvando.value = true;
    
    const payload = {
      pedido: {
        id_cliente: clienteSelecionado.value!.id,
        data: new Date().toISOString(), // A API pode exigir a data original ou a de atualização
        status: status.value
      },
      itens: itens.value
        .filter(item => item.produto && item.qtde > 0)
        .map(item => ({
          id_produto: item.produto!.id,
          qtde: item.qtde
        }))
    };
    
    await axios.put(`http://localhost:3333/pedidos/${props.pedido.id}`, payload);
    
    emit('pedido-atualizado');
    fecharModal();
  } catch (err: any) {
    console.error('Erro ao atualizar pedido:', err);
    emit('error', err.response?.data?.message || err.message || 'Erro desconhecido');
  } finally {
    salvando.value = false;
  }
};

// --- FUNÇÕES AUXILIARES ---
const resetForm = () => {
  clienteSelecionado.value = null;
  itens.value = [];
  status.value = '';
  erros.cliente = '';
  clientesEncontrados.value = [];
  produtosEncontrados.value = [];
};

const fecharModal = () => {
  resetForm();
  emit('update:modelValue', false);
};

function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: number;
  return (...args: Parameters<F>): void => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), waitFor);
  };
}

const formatCurrency = (value: number): string => {
  if (typeof value !== 'number') return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value / 100);
};
</script>

<style scoped>
.item-row {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 16px;
}
</style>