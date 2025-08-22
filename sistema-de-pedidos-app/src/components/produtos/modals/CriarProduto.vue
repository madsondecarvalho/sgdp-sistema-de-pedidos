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
        <v-icon start>mdi-package-variant-plus</v-icon>
        <v-toolbar-title class="text-h6 font-weight-light">
          Novo Produto
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="fecharModal">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="pa-5">
        <p class="text-body-2 text-medium-emphasis mb-4">
          Preencha os dados abaixo para cadastrar um novo produto no sistema.
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
          @click="salvarNovoProduto"
          prepend-icon="mdi-content-save"
        >
          Salvar Produto
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue';
import axios from 'axios';

interface NovoProdutoForm {
  nome: string;
  precoEmCentavos: number | null;
}

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['update:modelValue', 'produto-criado', 'error']);

const salvando = ref(false);
const formData = reactive<NovoProdutoForm>({
  nome: '',
  precoEmCentavos: null
});
const erros = reactive({
  nome: '',
  preco: ''
});

// O "CÉREBRO" DA LÓGICA DE MÁSCARA DE MOEDA
const precoFormatado = computed({
  // GET: Pega o valor em centavos (ex: 1999) e formata para exibição (ex: "19,99")
  get() {
    // Se o valor for nulo ou zero, exibe "0,00"
    const centavos = formData.precoEmCentavos || 0;
    
    // Separa a parte inteira (reais) e a decimal (centavos)
    const reais = Math.floor(centavos / 100);
    const parteDecimal = String(centavos % 100).padStart(2, '0');
    
    return `${reais},${parteDecimal}`;
  },
  
  // SET: Pega a string do input, extrai APENAS os dígitos e salva como centavos
  set(value: string) {
    // Remove tudo que não for um dígito (\D é o oposto de \d)
    const digitos = value.replace(/\D/g, '');

    // Se não houver dígitos, o valor é nulo
    if (!digitos) {
      formData.precoEmCentavos = null;
      return;
    }

    // Converte a string de dígitos para um número inteiro
    formData.precoEmCentavos = parseInt(digitos, 10);
  }
});


watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    resetForm();
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
  
  if (formData.precoEmCentavos === null) {
    erros.preco = 'O preço é obrigatório';
    valido = false;
  } else if (formData.precoEmCentavos <= 0) {
    erros.preco = 'O preço deve ser um valor positivo';
    valido = false;
  } else {
    erros.preco = '';
  }
  
  return valido;
};

const resetForm = () => {
  formData.nome = '';
  formData.precoEmCentavos = null;
  erros.nome = '';
  erros.preco = '';
};

const fecharModal = () => {
  emit('update:modelValue', false);
};

const salvarNovoProduto = async () => {
  if (!validarFormulario()) {
    return;
  }
  
  try {
    salvando.value = true;
    
    const response = await axios.post('http://localhost:3333/produtos', {
      nome: formData.nome,
      preco: formData.precoEmCentavos
    });
    
    emit('produto-criado', response.data);
    emit('update:modelValue', false);
  } catch (err: any) {
    console.error('Erro ao salvar produto:', err);
    emit('error', err.response?.data?.message || err.message || 'Erro desconhecido');
  } finally {
    salvando.value = false;
  }
};
</script>