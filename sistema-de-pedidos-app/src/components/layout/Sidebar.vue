<template>
    <v-navigation-drawer v-model="drawer" :rail="rail" permanent :expand-on-hover="expandOnHover" :location="location"
        color="primary" class="sidebar">
        <!-- Logo/Header da sidebar -->
        <div class="pa-4">
            <div class="d-flex align-center">
                <v-avatar size="36" color="white" class="mr-3">
                    <v-icon color="primary">mdi-store</v-icon>
                </v-avatar>
                <h2 class="text-white text-h6">SGDP</h2>
            </div>
        </div>

        <v-divider class="border-opacity-25"></v-divider>

        <!-- Menu de navegação -->
        <v-list nav density="compact">
            <v-list-item v-for="(item, index) in menuItems" :key="index" :to="item.to" :prepend-icon="item.icon"
                :title="item.title" :value="item.title" :active="activeRoute === item.to"
                @click="setActiveRoute(item.to)" class="my-1" rounded="lg">
                <template v-if="item.badge" v-slot:append>
                    <v-badge :content="item.badge.content" :color="item.badge.color" inline></v-badge>
                </template>
            </v-list-item>
        </v-list>
    </v-navigation-drawer>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

// Props
const props = defineProps({
    expandOnHover: {
        type: Boolean,
        default: true
    },
    location: {
        type: String,
        default: 'left'
    }
})

// Router
const router = useRouter()
const activeRoute = ref(router.currentRoute.value.path)

// Estado
const drawer = ref(true)
const rail = ref(false)

// Itens do menu
const menuItems = ref([
    { title: 'Início', icon: 'mdi-account-card', to: '/' },
    { title: 'Clientes', icon: 'mdi-account-group', to: '/clientes' },
    { title: 'Produtos', icon: 'mdi-package-variant', to: '/produtos' },
    {
        title: 'Pedidos',
        icon: 'mdi-clipboard-list',
        to: '/pedidos',
    },
])

// Métodos
const setActiveRoute = (route) => {
    activeRoute.value = route
}
</script>

<style scoped>
.sidebar {
    height: 100vh;
}

.v-list-item--active {
    background-color: rgba(255, 255, 255, 0.15) !important;
}
</style>