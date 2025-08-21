<template>
  <v-app>
    <v-layout>
      <v-app-bar color="primary">
        <v-app-bar-nav-icon></v-app-bar-nav-icon>
        <v-toolbar-title>Minha Aplicação com Vuetify + TS</v-toolbar-title>
      </v-app-bar>

      <v-main>
        <v-container>
          <h1>Bem-vindo ao Vuetify!</h1>
          <p class="my-4">
            Agora você pode usar todos os componentes incríveis com TypeScript.
          </p>

          <v-card
            class="mx-auto my-8"
            max-width="344"
            elevation="16"
          >
            <v-card-item>
              <v-card-title>
                Card de Exemplo
              </v-card-title>
              <v-card-subtitle>
                Este é um v-card
              </v-card-subtitle>
            </v-card-item>

            <v-card-text>
              Componentes como este são fáceis de usar e personalizar.
            </v-card-text>
          </v-card>

          <div class="d-flex ga-4">
            <v-btn prepend-icon="mdi-vuetify" color="primary">
              Botão Primário
            </v-btn>

            <v-btn variant="outlined" color="secondary">
              Botão Secundário
            </v-btn>
          </div>

          <div class="mt-6">
            <v-text-field
              v-model="name"
              label="Digite seu nome"
              variant="solo-filled"
            ></v-text-field>
            <p v-if="name">Olá, {{ name }}!</p>
          </div>
        </v-container>
      </v-main>
    </v-layout>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// O ref do Vue 3 infere o tipo automaticamente.
// Aqui, name será do tipo Ref<string>
const name = ref('');
</script>

<style>
/* Estilos globais */
</style>