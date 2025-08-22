<template>
  <v-dialog 
    :model-value="modelValue" 
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="700px"
    transition="dialog-bottom-transition"
  >
    <v-card rounded="lg">
      <v-toolbar class="pl-4" color="primary" density="compact">
        <v-icon start>mdi-receipt-text</v-icon>
        <v-toolbar-title class="text-h6 font-weight-light">
          Detalhes do Pedido
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="$emit('update:modelValue', false)">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="pa-5">
        <div v-if="loading" class="text-center py-10">
          <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
          <p class="mt-4 text-medium-emphasis">Buscando detalhes do pedido...</p>
        </div>

        <v-alert v-if="error" type="error" variant="tonal" border="start">
          {{ error }}
        </v-alert>

        <div v-if="!loading && !error && detalhes">
          <v-list-subheader>INFORMAÇÕES GERAIS</v-list-subheader>
          <v-row>
            <v-col cols="12" md="4">
              <v-list-item title="ID do Pedido" :subtitle="detalhes.id.substring(0, 18) + '...'" class="px-0"></v-list-item>
            </v-col>
            <v-col cols="12" md="4">
              <v-list-item title="Data" :subtitle="formatDateTime(detalhes.data)" class="px-0"></v-list-item>
            </v-col>
            <v-col cols="12" md="4">
              <v-list-item title="Status" class="px-0">
                <template v-slot:subtitle>
                  <v-chip
                    :color="getStatusChipProps(detalhes.status).color"
                    :text="getStatusChipProps(detalhes.status).text"
                    label
                    size="small"
                  ></v-chip>
                </template>
              </v-list-item>
            </v-col>
          </v-row>

          <v-list-subheader class="mt-4">CLIENTE</v-list-subheader>
          <v-row>
            <v-col cols="12" md="6">
              <v-list-item title="Nome" :subtitle="detalhes.nome_cliente" class="px-0"></v-list-item>
            </v-col>
            <v-col cols="12" md="6">
              <v-list-item title="Email" :subtitle="detalhes.email_cliente" class="px-0"></v-list-item>
            </v-col>
          </v-row>

          <v-list-subheader class="mt-4">ITENS DO PEDIDO</v-list-subheader>
          <v-data-table
            :headers="itemHeaders"
            :items="detalhes.itens"
            density="compact"
            hide-default-footer
            class="mb-2 border rounded"
          >
            <template v-slot:item.preco_unitario="{ item }">
              <span>{{ formatCurrency(item.preco_unitario) }}</span>
            </template>
            <template v-slot:item.preco="{ item }">
              <span class="font-weight-bold">{{ formatCurrency(item.preco) }}</span>
            </template>
          </v-data-table>
          
          <div class="d-flex justify-end align-center mt-4">
            <span class="text-h6 mr-4">Total do Pedido:</span>
            <span class="text-h6 font-weight-bold text-primary">{{ formatCurrency(totalPedido) }}</span>
          </div>
        </div>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="$emit('update:modelValue', false)">
          Fechar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { PropType } from 'vue';
import axios from 'axios';

// MELHORIA 3: Interfaces atualizadas com os novos campos
interface ItemPedido {
  id_pedido: string;
  id_produto: string;
  qtde: number;
  preco: number; // Preço total do item (qtde * preco_unitario)
  preco_unitario: number;
  nome_produto: string;
}
interface PedidoDetalhado {
  id: string;
  data: string;
  id_cliente: string;
  status: string;
  nome_cliente: string;
  email_cliente: string;
  itens: ItemPedido[];
}

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  pedidoId: { type: String as PropType<string | undefined>, default: undefined }
});

defineEmits(['update:modelValue']);

// Estado interno do modal
const loading = ref(false);
const error = ref('');
const detalhes = ref<PedidoDetalhado | null>(null);

// Cabeçalhos para a tabela de itens
const itemHeaders = [
  { title: 'Produto', key: 'nome_produto' },
  { title: 'Qtd.', key: 'qtde', align: 'center' },
  { title: 'Preço Unit.', key: 'preco_unitario', align: 'end' },
  { title: 'Subtotal', key: 'preco', align: 'end' },
] as const;


// MELHORIA 2 (continuação): Propriedade computada para o total
const totalPedido = computed(() => {
  if (!detalhes.value || !detalhes.value.itens) {
    return 0;
  }
  return detalhes.value.itens.reduce((total, item) => total + item.preco, 0);
});

// Funções de formatação
const formatDateTime = (isoString: string): string => {
  if (!isoString) return 'N/A';
  return new Date(isoString).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

const formatCurrency = (value: number): string => {
  if (typeof value !== 'number') return 'R$ 0,00';
  const valueInReais = value / 100;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency', currency: 'BRL'
  }).format(valueInReais);
};

// MELHORIA 3 (continuação): Função para o status
const getStatusChipProps = (status: string) => {
  switch (status) {
    case 'EM_ANALISE': return { color: 'orange', text: 'Em Análise' };
    case 'CONFIRMADO': return { color: 'success', text: 'Confirmado' };
    case 'CANCELADO': return { color: 'error', text: 'Cancelado' };
    default: return { color: 'grey', text: status };
  }
};

// Lógica de busca dos dados (sem alterações)
const fetchDetalhes = async (id: string) => {
  loading.value = true;
  error.value = '';
  detalhes.value = null;
  try {
    const response = await axios.get(`http://localhost:3333/pedidos/${id}`);
    if (response.data && response.data.pedido) {
      detalhes.value = response.data.pedido;
    } else {
      throw new Error("Formato de resposta da API de detalhes inválido.");
    }
  } catch (err: any) {
    error.value = `Não foi possível carregar os detalhes do pedido: ${err.message}`;
  } finally {
    loading.value = false;
  }
};

watch(() => props.modelValue, (isOpen) => {
  if (isOpen && props.pedidoId) {
    fetchDetalhes(props.pedidoId);
  }
});
</script>