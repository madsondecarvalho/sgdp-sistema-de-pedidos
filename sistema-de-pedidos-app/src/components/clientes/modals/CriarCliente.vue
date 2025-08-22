<template>
  <v-dialog 
    :model-value="modelValue" 
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="500px"
    persistent
    transition="dialog-bottom-transition"
  >
    <v-card rounded="lg">
      <v-toolbar color="primary" density="compact" class="pl-4">
        <v-icon start>mdi-account-plus</v-icon>
        <v-toolbar-title class="text-h6 font-weight-light">
          Novo Cliente
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="fecharModal">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="pa-5">
        <p class="text-body-2 text-medium-emphasis mb-4">
          Preencha os dados abaixo para cadastrar um novo cliente no sistema.
        </p>
        <v-text-field
          v-model="formData.nome"
          label="Nome completo"
          required
          :error-messages="erros.nome"
          variant="outlined"
          prepend-inner-icon="mdi-account"
          class="mb-2"
        ></v-text-field>

        <v-text-field
          v-model="formData.email"
          label="Endereço de e-mail"
          required
          :error-messages="erros.email"
          type="email"
          variant="outlined"
          prepend-inner-icon="mdi-email"
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
          @click="salvarNovoCliente"
          prepend-icon="mdi-content-save"
        >
          Salvar Cliente
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import axios from 'axios';

interface NovoClienteForm {
  nome: string;
  email: string;
}

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['update:modelValue', 'cliente-criado', 'error']);

// Estado
const salvando = ref(false);
const formData = reactive<NovoClienteForm>({
  nome: '',
  email: ''
});
const erros = reactive({
  nome: '',
  email: ''
});

// Reset do formulário quando o modal é aberto
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    resetForm();
  }
});

// Validar formulário
const validarFormulario = (): boolean => {
  let valido = true;
  
  if (!formData.nome.trim()) {
    erros.nome = 'O nome é obrigatório';
    valido = false;
  } else {
    erros.nome = '';
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!formData.email.trim()) {
    erros.email = 'O email é obrigatório';
    valido = false;
  } else if (!emailRegex.test(formData.email)) {
    erros.email = 'Email inválido';
    valido = false;
  } else {
    erros.email = '';
  }
  
  return valido;
};

// Métodos
const resetForm = () => {
  formData.nome = '';
  formData.email = '';
  erros.nome = '';
  erros.email = '';
};

const fecharModal = () => {
  emit('update:modelValue', false);
};

const salvarNovoCliente = async () => {
  if (!validarFormulario()) {
    return;
  }
  
  try {
    salvando.value = true;
    
    const response = await axios.post('http://localhost:3333/clientes', {
      nome: formData.nome,
      email: formData.email
    });
    
    emit('cliente-criado', response.data);
    emit('update:modelValue', false);
  } catch (err: any) {
    console.error('Erro ao salvar cliente:', err);
    emit('error', err.response?.data?.message || err.message || 'Erro desconhecido');
  } finally {
    salvando.value = false;
  }
};
</script>