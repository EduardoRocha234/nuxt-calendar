# 📅 Calendário Personalizado

![Preview do Calendário](./assets/img/calandar-print.png)

Este é um projeto de um calendário inspirado no Google Calendar, criado com Nuxt 3, TypeScript, PrimeVue v4 e Tailwind CSS. O backend é simulado utilizando o BFF (Backend for Frontend) do próprio Nuxt, com um banco de dados SQLite in-memory.

## 🚀 Motivação

Durante meu trabalho atual, tive que implementar um sistema de calendário completo, tanto no backend quanto no frontend. O projeto foi desafiador e me proporcionou um grande aprendizado. Por isso, decidi replicá-lo, modificando a interface e explorando novas abordagens.

## 🛠️ Tecnologias Utilizadas

- **Frontend:**

  - [Nuxt 3](https://nuxt.com/) (com TypeScript)
  - [PrimeVue v4](https://www.primefaces.org/primevue/) (componentes UI)
  - [Tailwind CSS](https://tailwindcss.com/) (estilização)
  - [Fullcalendar](https://fullcalendar.io/) (componente de calendário)

- **Backend Simulado:**

  - BFF (Backend for Frontend) do Nuxt
  - [SQLite In-Memory](https://www.sqlite.org/inmemory.html) (banco de dados temporário)

## 🎯 Funcionalidades

- 📆 Criação e edição de eventos
- 👥 Gerenciamento de participantes
- 📌 Eventos recorrentes
- 🎨 Interface moderna e responsiva

## 📂 Estrutura do Projeto

```
meu-calendario/
│   ├── assets/        # Estilos e imagens
│   ├── components/    # Componentes reutilizáveis
│   ├── pages/         # Páginas do Nuxt
│   ├── server/        # Backend simulado
│   ├── utils/         # Funções auxiliares
│   ├── app.vue        # Componente raiz
│   ├── nuxt.config.ts # Configuração do Nuxt
│
└── package.json       # Dependências do projeto
```

## 📦 Instalação e Execução

1. Clone o repositório:
   ```sh
   git clone https://github.com/seu-usuario/meu-calendario.git
   ```
2. Instale as dependências:
   ```sh
   pnpm install
   ```
3. Inicie o projeto:
   ```sh
   pnpm dev
   ```
4. Acesse no navegador:
   ```
   http://localhost:3000
   ```

