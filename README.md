[![Open in Visual Studio Code](https://classroom.github.com/assets/open-in-vscode-2e0aaae1b6195c2367325f4f02e2d04e9abb55f0b24a779b69b11b9e10269abc.svg)](https://classroom.github.com/online_ide?assignment_repo_id=20722314&assignment_repo_type=AssignmentRepo)

# 🏭 PCP Lite - Sistema de Gestão Industrial

O **PCP Lite** é uma plataforma web integrada desenvolvida para o Planejamento e Controle de Produção (PCP). O projeto simula o fluxo real de uma indústria, permitindo a gestão em três níveis hierárquicos: **Estratégico, Tático e Operacional**.

Este projeto foi desenvolvido para a disciplina de **TIAW (Trabalho Interdisciplinar Aplicações Web)** no curso de Engenharia de Software da **PUC Minas**.

---

## 🚀 Funcionalidades Principais

### 📊 Estratégico (BI & Planejamento)
* **Dashboards de Performance:** Visualização de indicadores de OEE (Eficiência Geral) e Yield utilizando Chart.js.
* **Plano Mestre de Produção (PMP):** Controle de metas mensais e análise de capacidade produtiva (Máquinas vs. Pessoas).
* **Análise de Materiais (B.O.M):** Visualização estruturada da Lista de Materiais de cada produto da fábrica.

### ⚙️ Tático (Logística & Lotes)
* **Gestão de Fornecedores:** CRUD completo para cadastro e monitoramento de pedidos de matéria-prima.
* **Controle de Lotes:** Sistema de liberação e programação de lotes produtivos.

### 🛠️ Operacional (Chão de Fábrica)
* **Monitoramento de Máquinas:** Acompanhamento em tempo real do status operacional (Operando, Parada, Manutenção).
* **Execução de OPs:** Registro e acompanhamento das Ordens de Produção.

---

## 🛠️ Tecnologias Utilizadas

* **Front-end:** HTML5, CSS3 (Modularizado), JavaScript (ES6+).
* **Framework CSS:** Bootstrap 5.3.8.
* **Gráficos:** Chart.js.
* **Persistência de Dados:** JSON Server (API Mock) e LocalStorage.
* **Ícones:** Google Material Symbols.

---

## 📂 Estrutura do Projeto

* **codigo/css/:** Estilizações customizadas por módulo.
* **codigo/js/:** Lógica de negócio e injeção dinâmica de componentes.
* **codigo/img/:** Assets e logotipos.
* **codigo/pages/:** Telas do sistema (Estratégico, Tático, Operacional).
* **codigo/Data/:** Banco de dados simulado (db.json).
* **docs/:** Documentação completa do projeto.

---

## ⚙️ Como executar

1. **Pré-requisitos:** Ter o Node.js instalado.
2. **Instalar o JSON Server:** Execute o comando `npm install -g json-server` no terminal.
3. **Iniciar o Servidor de Dados:** Navegue até a pasta do projeto e execute: `json-server --watch codigo/Data/db.json`
4. **Acessar a Aplicação:** Abra o arquivo `codigo/pages/index.html` (Recomendado: Extensão Live Server do VS Code).

---

## 👥 Equipe e Créditos

**Alunos Integrantes:**
* Bernardo Belini Vale
* Christiano Gonçalves Araújo
* João Francisco Ramos Murilo
* Thiago Nobre
* Matheus Nicoli Andrade Coelho
* Charles Henrique de Paula Santos

**Professores Responsáveis:**
* Cleiton Silva Tavares
* João Pedro Oliveira Batisteli
