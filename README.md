# 💰 Controle de Gastos Pessoais  
![License](https://img.shields.io/badge/license-MIT-green)  
![Status](https://img.shields.io/badge/status-em%20desenvolvimento-blue)  
![PRs](https://img.shields.io/badge/PRs-bem%20vindos-orange)  

Sistema de **controle de finanças pessoais** desenvolvido para ajudar usuários a gerenciar suas despesas e receitas de forma prática.  
A aplicação permite **registrar transações**, **categorizar gastos**, **definir orçamentos**, **acompanhar metas de poupança** e visualizar tudo em um **dashboard intuitivo**.  

---

## 🚀 Funcionalidades  

- 🔐 **Autenticação de Usuários**: Login e cadastro seguros via Firebase Authentication.  
- 📝 **Registro de Transações**: adição de despesas e receitas com valor, descrição, categoria e data.  
- 🗂️ **Categorização Personalizada**: gerenciamento de categorias de despesas e receitas.  
- 🎯 **Orçamentos**: definição e acompanhamento de limites por categoria.  
- 🏦 **Metas de Poupança**: criação e monitoramento de objetivos financeiros.  
- 📊 **Dashboard Interativo**: gráficos e estatísticas para análise das finanças.  
- 👨‍👩‍👧 **Gerenciamento Familiar**: compartilhamento de gastos em grupo (opcional).  
- ✏️ **Edição e Exclusão**: atualização ou remoção de transações já registradas.  
- 🔒 **Proteção de Rotas**: apenas usuários autenticados acessam áreas restritas.  

---

## 🛠️ Tecnologias Utilizadas  

- **React** → construção da interface de usuário.  
- **Firebase** → autenticação (Authentication) e banco de dados (Firestore).  
- **Chakra UI** → componentes acessíveis e responsivos para o front-end.  
- **Chart.js + React Chart.js 2** → gráficos dinâmicos.  
- **React Router DOM** → gerenciamento de rotas SPA.  
- **date-fns** → manipulação de datas.  
- **React Datepicker** → seleção de datas nos formulários.  
- **React Icons** → biblioteca de ícones para a interface.  

---

## 📂 Estrutura do Projeto  

```bash
controle-de-gastos-pessoais/
│
├── public/            # Arquivos estáticos (index.html, manifest.json, ícones)
├── src/               # Código-fonte principal
│   ├── App.js         # Configuração de rotas
│   ├── components/    # Componentes reutilizáveis (modais, formulários, etc.)
│   ├── pages/         # Páginas principais (Dashboard, Login, Cadastro, etc.)
│   ├── firebase.js    # Configuração e inicialização do Firebase
│   └── index.js       # Ponto de entrada da aplicação
└── README.md          # Documentação do projeto
