<template>
  <v-dialog 
    :model-value="modelValue" 
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="500px"
    persistent
    transition="dialog-bottom-transition"
  >
    <v-card rounded="lg">
      <v-toolbar class="pl-4" color="primary" density="compact">
        <v-icon start>mdi-pencil</v-icon>
        <v-toolbar-title class="text-h6 font-weight-light">
          Atualizar Produto
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="fecharModal">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="pa-5">
        <p class="text-body-2 text-medium-emphasis mb-4">
          Altere os dados abaixo para atualizar o produto.
        </p>
        <v-text-field
          v-model="formData.nome"
          label="Nome do Produto"
          required
          :error-messages="erros.nome"
          variant="outlined"
          prepend-inner-icon="mdi-tag-text"
          class="mb-4"
        ></v-text-field>

        <v-text-field
          v-model="precoFormatado"
          label="Preço"
          required
          :error-messages="erros.preco"
          variant="outlined"
          prefix="R$"
        ></v-text-field>
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
          color="primary"
          variant="elevated"
          :loading="salvando"
          @click="atualizarProduto"
          prepend-icon="mdi-content-save"
        >
          Salvar Alterações
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue';
import type { PropType } from 'vue';
import axios from 'axios';

interface Produto {
  id: string;
  nome: string;
  preco: number;
}

interface UpdateProdutoForm {
  nome: string;
  precoEmCentavos: number | null;
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

const emit = defineEmits(['update:modelValue', 'produto-atualizado', 'error']);

const salvando = ref(false);
const formData = reactive<UpdateProdutoForm>({
  nome: '',
  precoEmCentavos: null
});
const erros = reactive({
  nome: '',
  preco: ''
});

const precoFormatado = computed({
  get() {
    const centavos = formData.precoEmCentavos || 0;
    const reais = Math.floor(centavos / 100);
    const parteDecimal = String(centavos % 100).padStart(2, '0');
    return `${reais},${parteDecimal}`;
  },
  set(value: string) {
    const digitos = value.replace(/\D/g, '');
    if (!digitos) {
      formData.precoEmCentavos = null;
      return;
    }
    formData.precoEmCentavos = parseInt(digitos, 10);
  }
});

/**
 * PONTO-CHAVE 1: Preenchendo o formulário com os dados do produto selecionado.
 * Esta função é chamada sempre que o modal é aberto.
 */
const inicializarFormulario = () => {
  if (props.produto) {
    formData.nome = props.produto.nome;
    formData.precoEmCentavos = props.produto.preco; // O preço já vem em centavos
  }
  erros.nome = '';
  erros.preco = '';
};

watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    inicializarFormulario();
  }
});

const validarFormulario = (): boolean => {
  let valido = true;
  if (!formData.nome.trim()) {
    erros.nome = 'O nome é obrigatório';
    valido = false;
  } else {
    erros.nome = '';
  }
  if (formData.precoEmCentavos === null || formData.precoEmCentavos <= 0) {
    erros.preco = 'O preço é obrigatório e deve ser positivo';
    valido = false;
  } else {
    erros.preco = '';
  }
  return valido;
};

const fecharModal = () => {
  emit('update:modelValue', false);
};

/**
 * PONTO-CHAVE 2: Enviando a requisição PUT com o ID do produto na URL.
 */
const atualizarProduto = async () => {
  if (!validarFormulario()) {
    return;
  }
  
  try {
    salvando.value = true;
    
    // A mágica acontece aqui: usamos `axios.put` com a URL dinâmica
    const response = await axios.put(`http://localhost:3333/produtos/${props.produto.id}`, {
      nome: formData.nome,
      preco: formData.precoEmCentavos
    });
    
    emit('produto-atualizado', response.data);
    emit('update:modelValue', false);
  } catch (err: any) {
    console.error('Erro ao atualizar produto:', err);
    emit('error', err.response?.data?.message || err.message || 'Erro desconhecido');
  } finally {
    salvando.value = false;
  }
};
</script>