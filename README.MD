# 🚀 Sistema de Gerenciamento de Pedidos

![Vue.js](https://img.shields.io/badge/Vue.js-3-4FC08D?style=for-the-badge&logo=vue.js)
![Vuetify](https://img.shields.io/badge/Vuetify-3-1867C0?style=for-the-badge&logo=vuetify)
![Fastify](https://img.shields.io/badge/Fastify-4-000000?style=for-the-badge&logo=fastify)
![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?style=for-the-badge&logo=mysql)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker)

Um sistema full-stack para gerenciamento de clientes, produtos e pedidos, construído com tecnologias modernas e totalmente orquestrado com Docker.

---

## 📜 Sobre o Projeto

Este projeto é uma aplicação web completa projetada para simular um ambiente real de gestão de pedidos. A interface, construída com Vue.js e Vuetify, oferece uma experiência de usuário rica e reativa, enquanto a API backend, desenvolvida com Fastify, garante respostas rápidas e eficientes.

Todo o ambiente é containerizado, permitindo que qualquer desenvolvedor clone o repositório e execute a aplicação com um único comando, sem a necessidade de instalar dependências manualmente.

### ✨ Funcionalidades Implementadas

* **Gestão de Clientes:**
    * CRUD completo (Criar, Listar, Atualizar, Excluir).
    * Modais com design aprimorado para cada ação.

* **Gestão de Produtos:**
    * CRUD completo.
    * Campo de preço inteligente com máscara de moeda (comportamento de "máquina de cartão").

* **Gestão de Pedidos:**
    * Listagem de pedidos com status visual (`v-chip`) e formatação de datas.
    * Criação de pedidos complexos com busca dinâmica e "debounced" de clientes e produtos via API.
    * Adição e remoção de múltiplos itens em um único pedido.
    * Atualização de status e itens de um pedido existente.
    * Visualização de detalhes completos do pedido, incluindo cliente, itens e valor total calculado.

---

## 🛠️ Tecnologias Utilizadas

| Categoria      | Tecnologia                                   |
| :------------- | :------------------------------------------- |
| **Frontend** | Vue.js 3 (Composition API), Vuetify 3, Vite  |
| **Backend** | Fastify, Node.js, TypeScript                 |
| **Banco de Dados** | MySQL 8                                      |
| **Ambiente** | Docker, Docker Compose (com perfis)          |
| **Testes** | k6 (Testes de Integração/Carga para a API)   |

---

## 🚀 Começando

Siga os passos abaixo para ter o ambiente de desenvolvimento rodando localmente.

### Pré-requisitos

Antes de começar, garanta que você tem as seguintes ferramentas instaladas:

* **Docker e Docker Compose**
    * [Instalar Docker Desktop](https://www.docker.com/products/docker-desktop/)
* **k6** (para rodar os testes de integração)
    * **Windows**: Baixe o instalador `.msi` [aqui](https://github.com/grafana/k6/releases).
    * **Outros SO**: Siga as instruções em [k6.io](https://k6.io/docs/getting-started/installation/).
* **Git**
    * [Instalar Git](https://git-scm.com/downloads)

### Instalação

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/](https://github.com/)[SEU_USUARIO_GITHUB]/[NOME_DO_REPOSITORIO].git
    ```
2.  **Navegue até a pasta do projeto:**
    ```bash
    cd [NOME_DO_REPOSITORIO]
    ```
3.  **(Opcional) Configure as variáveis de ambiente:**
    Se houver um arquivo `.env.example`, copie-o para `.env` e ajuste as variáveis se necessário.
    ```bash
    cp .env.example .env
    ```

---

## ▶️ Rodando a Aplicação

### Ambiente de Desenvolvimento

Este comando irá construir as imagens e iniciar os contêineres do frontend, da API e do banco de dados em modo de desenvolvimento.

```bash
docker compose --profile dev up --build
```

Após os contêineres estarem rodando, a aplicação estará disponível em:

Frontend (Aplicação Web): http://localhost:5173

API (Backend): http://localhost:3333

🧪 Rodando os Testes de Integração (k6)
O processo para rodar os testes da API é dividido em duas etapas:

Passo 1: Iniciar o Ambiente de Teste
Primeiro, inicie a API e um banco de dados limpo, específicos para os testes, usando o perfil test.

```bash
docker compose --profile test up --build
```
Nota: Deixe este terminal aberto. A API estará pronta para receber as requisições do k6.

Passo 2: Executar os Scripts do k6
Com o ambiente de teste rodando, abra um novo terminal na pasta do projeto e execute seu script de teste.

Bash

# Exemplo de comando - ajuste o caminho para o seu script
```bash
k6 run ./integration_tests/run.js
```
Os resultados dos testes de performance e carga serão exibidos diretamente no seu terminal.

📄 Licença
Distribuído sob a Licença MIT. Veja LICENSE.txt para mais informações.