# 🥩 Espetaria do Gaguinho — Gestão de Pedidos (MVP)

Um sistema de gestão de pedidos interno (POS / KDS) construído sob medida para a **Espetaria do Gaguinho**. O foco deste MVP é oferecer um controle de fluxo de caixa e preparação de pratos de forma **ágil, visual e em tempo real**.

Desenvolvido para atender o ecossistema do bar, conectando simultaneamente o **Garçom**, a **Churrasqueira/Cozinha** e o **Caixa**, sem a necessidade de recarregar páginas ou lidar com delays no salão.

## ✨ Funcionalidades Principais

* **🔄 Sincronização em Tempo Real:** Escuta ativa (WebSockets) via Supabase Realtime, fazendo com que o envio de um pedido pelo celular do garçom apareça instantaneamente na tela da churrasqueira.
* **📱 Visão Garçom (Mobile-First):** Criação de comandas vinculadas à mesa, filtragem visual de cardápio por categorias (espetos, combos, bebidas), adição rápida e gestão de observações ("sem cebola", "mal passado").
* **🔥 Visão Churrasqueira (KDS - Kitchen Display System):** Quadro Kanban visível à distância, gerenciando os estágios `Novo Pedido` ➡️ `Na Brasa`. Apresenta alertas sonoros dinâmicos e destaque em vermelho para observações importantes.
* **💰 Visão Caixa / Fechamento:** Painel consolidado listando todas as contas em aberto agrupadas por mesa. Inclui totalizador dinâmico de valores e a opção de cadastro rápido de novos itens durante a operação.
* **🔔 Notificações Visuais (Toasts):** Feedback moderno para ações críticas sem bloquear o uso (alertas nativos do navegador foram substituídos).

## 🛠️ Tecnologias Utilizadas

* **[React 19](https://react.dev/) + [Vite](https://vitejs.dev/):** Fundação do frontend, focado em alta performance.
* **[Tailwind CSS v4](https://tailwindcss.com/):** Estilização ágil e robusta (variáveis de cor customizadas, glassmorphism e scrollbars personalizadas).
* **[Supabase](https://supabase.com/):** Backend-as-a-Service, provendo Banco de Dados PostgreSQL e serviço robusto de Realtime via `supabase-js`.
* **[Lucide React](https://lucide.dev/):** Iconografia leve, consistente e escalável.
* **[React Hot Toast](https://react-hot-toast.com/):** Sistema de notificações flutuantes.

## 🚀 Como executar o projeto localmente

### 1. Pré-requisitos
* Node.js (v18+)
* Gerenciador de pacotes (`npm`, `yarn`, etc)
* Um projeto configurado no Supabase com as tabelas: `produtos`, `pedidos` e `itens_pedido`.

### 2. Instalação
Clone este repositório para sua máquina local e instale as dependências:

```bash
git clone https://github.com/SEU_USUARIO/espetaria-mvp.git
cd espetaria-mvp
npm install
```

### 3. Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto e preencha com as credenciais fornecidas pelo seu painel do Supabase:

```env
VITE_SUPABASE_URL=sua_url_do_supabase_aqui
VITE_SUPABASE_ANON_KEY=sua_anon_key_do_supabase_aqui
```
*(Nota: O arquivo `.env` é, por questões de segurança, ignorado no versionamento pelo Git).*

### 4. Rodando o app
Execute o servidor de desenvolvimento:

```bash
npm run dev
```

Abra `http://localhost:5173` no seu navegador de preferência. Você pode abrir abas separadas simulando diferentes dispositivos (um celular para o Garçom, uma tela grande para a Cozinha) para ver o tempo real (Realtime) funcionando perfeitamente!

## 📦 Script para Produção
Caso queira gerar um build otimizado para deploy em serviços como **Vercel** ou **Netlify**:

```bash
npm run build
```

---
Feito com 💡 e 🥩 para digitalizar o churrasco perfeito!
