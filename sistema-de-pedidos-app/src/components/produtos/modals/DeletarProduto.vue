<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="450px"
    persistent
  >
    <v-card rounded="lg">
      <v-toolbar class="pl-4" color="error" density="compact">
        <v-icon start>mdi-alert-circle</v-icon>
        <v-toolbar-title class="text-h6 font-weight-light">
          Excluir Produto
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="fecharModal">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="pa-5 text-center">
        <v-icon
          color="error"
          size="64"
          class="mb-4"
        >
          mdi-delete-forever
        </v-icon>
        
        <h3 class="text-h5 mb-3">Confirmar exclusão</h3>
        
        <p class="text-body-1 mb-1">
          Tem certeza que deseja excluir o produto:
        </p>
        <p class="text-subtitle-1 font-weight-bold mb-4">
          {{ produto.nome }}
        </p>
        
        <v-alert
          type="warning"
          variant="tonal"
          border="start"
          density="compact"
          class="mb-3 text-left"
        >
          Esta ação não pode ser desfeita. Todos os dados associados a este produto serão removidos permanentemente.
        </v-alert>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn
          variant="text"
          @click="fecharModal"
          class="me-2"
        >
          Cancelar
        </v-btn>
        <v-btn
          color="error"
          variant="elevated"
          :loading="excluindo"
          @click="excluirProduto"
          prepend-icon="mdi-delete"
        >
          Excluir Produto
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { PropType } from 'vue';
import axios from 'axios';

// Interface para o produto recebido via prop
interface Produto {
  id: string;
  nome: string;
  // Outros campos não são necessários para a lógica de exclusão
}

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  produto: {
    type: Object as PropType<Produto>,
    required: true
  }
});

const emit = defineEmits(['update:modelValue', 'produto-excluido', 'error']);

// Estado
const excluindo = ref(false);

const fecharModal = () => {
  emit('update:modelValue', false);
};

const excluirProduto = async () => {
  try {
    excluindo.value = true;

    // Enviar requisição DELETE para a API de produtos
    await axios.delete(`http://localhost:3333/produtos/${props.produto.id}`);

    // Emitir evento de sucesso
    emit('produto-excluido', props.produto.id);
    
    // Fechar modal
    emit('update:modelValue', false);
  } catch (err: any) {
    console.error('Erro ao excluir produto:', err);
    
    // Emitir evento de erro
    emit('error', err.response?.data?.message || err.message || 'Erro desconhecido');
  } finally {
    excluindo.value = false;
  }
};
</script>