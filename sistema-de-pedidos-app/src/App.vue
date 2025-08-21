<template>
  <v-app>
    <v-layout>
      <Header />

      <Sidebar />

      <v-main>
        <v-container>
          <router-view />
        </v-container>
      </v-main>
    </v-layout>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Header from './components/layout/Header.vue';
import Sidebar from './components/layout/Sidebar.vue';

// O ref do Vue 3 infere o tipo automaticamente.
// Aqui, name será do tipo Ref<string>
const name = ref('');
</script>

<style>
/* Estilos globais */
</style>