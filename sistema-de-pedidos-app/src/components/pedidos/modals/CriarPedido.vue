<template>
    <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="800px"
        persistent transition="dialog-bottom-transition">
        <v-card rounded="lg">
            <v-toolbar class="pl-4" color="primary" density="compact">
                <v-icon start>mdi-cart-plus</v-icon>
                <v-toolbar-title class="text-h6 font-weight-light">
                    Criar Novo Pedido
                </v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn icon @click="fecharModal">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-toolbar>

            <v-card-text class="pa-5">
                <v-list-subheader>DADOS DO CLIENTE</v-list-subheader>
                <v-autocomplete v-model="clienteSelecionado"   no-data-text="Digite para buscar um Cliente" :items="clientesEncontrados" :loading="loadingClientes"
                    @update:search="debouncedBuscaClientes" item-title="nome" item-value="id" return-object
                    label="Buscar cliente por nome ou e-mail"
                    
                    placeholder="Comece a digitar para buscar..." variant="outlined" :error-messages="erros.cliente">
                    <template v-slot:item="{ props, item }">
                        <v-list-item v-bind="props" :subtitle="item.raw.email"></v-list-item>
                    </template>
                </v-autocomplete>

                <v-list-subheader class="mt-4">ITENS DO PEDIDO</v-list-subheader>
                <v-divider class="mb-4"></v-divider>

                <div v-for="(item, index) in itens" :key="item.uniqueId" class="item-row mb-4">
                    <v-row align="center">
                        <v-col cols="12" md="6">
                            <v-autocomplete v-model="item.produto" no-data-text="Digite para buscar um Produto" :items="produtosEncontrados"
                                :loading="loadingProdutos" @update:search="query => debouncedBuscaProdutos(query)"
                                item-title="nome" item-value="id" return-object label="Buscar produto"
                                placeholder="Comece a digitar..." variant="outlined" density="compact" hide-details>
                                <template v-slot:item="{ props, item }">
                                    <v-list-item v-bind="props"
                                        :subtitle="formatCurrency(item.raw.preco)"></v-list-item>
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
                <v-btn color="primary" variant="elevated" :loading="salvando" @click="criarPedido"
                    prepend-icon="mdi-send">
                    Criar Pedido
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
    uniqueId: number; // Para a key do v-for
    produto: Produto | null;
    qtde: number;
}

// --- PROPS E EMITS ---
const props = defineProps({
    modelValue: { type: Boolean, required: true }
});
const emit = defineEmits(['update:modelValue', 'pedido-criado', 'error']);

// --- ESTADO DO COMPONENTE ---
const salvando = ref(false);
const clienteSelecionado = ref<Cliente | null>(null);
const itens = ref<ItemForm[]>([{ uniqueId: Date.now(), produto: null, qtde: 1 }]);
const erros = reactive({ cliente: '' });

// Estados para os autocompletes
const loadingClientes = ref(false);
const clientesEncontrados = ref<Cliente[]>([]);
const loadingProdutos = ref(false);
const produtosEncontrados = ref<Produto[]>([]);
let searchClientQuery = ref('');
let searchProductQuery = ref('');

// --- LÓGICA DE BUSCA COM DEBOUNCE ---
// O Debounce evita que uma nova requisição seja feita a cada tecla digitada,
// esperando um pequeno intervalo para buscar.
watch(searchClientQuery, (newQuery) => {
    if (newQuery && newQuery.length > 2) {
        loadingClientes.value = true;
        buscarClientes(newQuery);
    } else {
        clientesEncontrados.value = [];
    }
});
const debouncedBuscaClientes = debounce((query: string) => searchClientQuery.value = query, 300);

watch(searchProductQuery, (newQuery) => {
    if (newQuery && newQuery.length > 2) {
        loadingProdutos.value = true;
        buscarProdutos(newQuery);
    } else {
        produtosEncontrados.value = [];
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

const criarPedido = async () => {
    if (!validarFormulario()) return;

    try {
        salvando.value = true;

        // Construção do Payload para a API
        const payload = {
            pedido: {
                id_cliente: clienteSelecionado.value!.id,
                data: new Date().toISOString()
            },
            itens: itens.value
                .filter(item => item.produto && item.qtde > 0)
                .map(item => ({
                    id_produto: item.produto!.id,
                    qtde: item.qtde
                }))
        };

        await axios.post('http://localhost:3333/pedidos', payload, {
            headers: {
                'idempotency-key': crypto.randomUUID()
            }
        });

        emit('pedido-criado');
        fecharModal();
    } catch (err: any) {
        console.error('Erro ao criar pedido:', err);
        emit('error', err.response?.data?.message || err.message || 'Erro desconhecido');
    } finally {
        salvando.value = false;
    }
};

// --- FUNÇÕES AUXILIARES ---
const resetForm = () => {
    clienteSelecionado.value = null;
    itens.value = [{ uniqueId: Date.now(), produto: null, qtde: 1 }];
    erros.cliente = '';
};

const fecharModal = () => {
    resetForm();
    emit('update:modelValue', false);
};

watch(() => props.modelValue, (isOpen) => {
    if (isOpen) {
        resetForm();
    }
});

// Função Debounce genérica
function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
    let timeout: number;
    return (...args: Parameters<F>): void => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), waitFor);
    };
}

// Função de formatação (pode ser importada de um arquivo utils)
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