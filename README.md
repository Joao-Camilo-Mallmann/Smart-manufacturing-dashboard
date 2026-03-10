# 🏭 Dashboard de Monitoramento Industrial

<p align="center">
  <img src="https://img.shields.io/badge/Status-Funcional-00A86B?style=for-the-badge" alt="status" />
  <img src="https://img.shields.io/badge/Frontend-React%2018%20%2B%20TypeScript-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="frontend" />
  <img src="https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="backend" />
  <img src="https://img.shields.io/badge/Database-SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="database" />
  <img src="https://img.shields.io/badge/UI-Tailwind%20CSS%20v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="ui" />
  <img src="https://img.shields.io/badge/Charts-Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white" alt="charts" />
</p>

> 🚀 Solução full stack para monitoramento em tempo real de máquina industrial, com simulação contínua de dados, histórico persistente em SQLite, alertas inteligentes com priorização por severidade, e métricas de eficiência (OEE).

---

## 📚 Sumário

1. [Visão Geral](#-visão-geral)
2. [Quick Start](#-quick-start)
3. [Stack Tecnológica](#-stack-tecnológica)
4. [Estrutura do Projeto](#-estrutura-do-projeto)
5. [Funcionalidades](#-funcionalidades)
6. [Regras de Negócio](#-regras-de-negócio)
7. [API REST](#-api-rest)
8. [Componentes React](#-componentes-react)
9. [Decisões de Arquitetura](#-decisões-de-arquitetura)
10. [Testes](#-testes)
11. [Documentação Complementar](#-documentação-complementar)

---

## ✨ Visão Geral

Sistema de monitoramento industrial focado em uma máquina específica da linha de produção. O backend gera leituras contínuas via **simulação Random Walk** e persiste no SQLite. O frontend consome a API via **short polling** (3s) e renderiza o estado operacional em tempo real.

### 🔄 Fluxo do Sistema

```
┌─────────────────┐     setInterval(3s)      ┌──────────┐
│  Simulador      │ ──────────────────────▶   │  SQLite  │
│  (Random Walk)  │                           │  (data/) │
└─────────────────┘                           └─────┬────┘
                                                    │
┌─────────────────┐     GET /api/metrics     ┌──────┴────┐
│  React          │ ◀──────────────────────  │  Express  │
│  Dashboard      │      fetch (3s)          │  API REST │
└─────────────────┘                          └───────────┘
```

---

## 🚀 Quick Start

### Pré-requisitos

- **Node.js** 18+ (recomendado: 22 LTS)
- **npm** 9+

### Instalação

```bash
# 1. Clonar o repositório
git clone https://github.com/seu-usuario/FULLSTACK_CHALLENGER.git
cd FULLSTACK_CHALLENGER

# 2. Instalar dependências (backend + frontend)
cd backend && npm install
cd ../frontend && npm install
cd ..

# 3. Instalar orquestrador (raiz)
npm install
```

### Execução

```bash
# Iniciar backend + frontend simultaneamente
npm run dev
```

- 🖥️ **Frontend**: http://localhost:5173
- 🔌 **API**: http://localhost:3001/api
- 💚 **Health check**: http://localhost:3001/api/health

### Execução separada

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

---

## 🧰 Stack Tecnológica

| Camada      | Tecnologia                              |
| ----------- | --------------------------------------- |
| Frontend    | React 18+, TypeScript, Tailwind CSS v4  |
| Gráficos    | Chart.js + react-chartjs-2              |
| Backend     | Node.js, Express, TypeScript            |
| Banco       | SQLite (better-sqlite3, driver nativo)  |
| Testes      | Jest + React Testing Library            |
| Arquitetura | Monorepo simples (frontend/ + backend/) |

---

## 🗂️ Estrutura do Projeto

```text
FULLSTACK_CHALLENGER/
├── backend/
│   ├── src/
│   │   ├── index.ts              # Ponto de entrada (Express + Simulador)
│   │   ├── database.ts           # Conexão e criação de tabelas SQLite
│   │   ├── simulator.ts          # Motor de simulação (Random Walk)
│   │   ├── state-machine.ts      # Máquina de estados da máquina
│   │   ├── thresholds.ts         # Regras de threshold e alertas
│   │   ├── oee.ts                # Cálculo de OEE
│   │   ├── types.ts              # Interfaces TypeScript
│   │   └── routes/
│   │       ├── metrics.ts        # GET /api/metrics/current e /history
│   │       ├── alerts.ts         # GET /api/alerts, PATCH /acknowledge
│   │       └── health.ts         # GET /api/health
│   ├── data/                     # SQLite gerado em runtime
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── App.tsx               # Layout principal do dashboard
│   │   ├── types.ts              # Interfaces TypeScript (espelho back)
│   │   ├── hooks/
│   │   │   └── useMachineData.ts # Custom hook de polling
│   │   ├── components/
│   │   │   ├── HeaderBar.tsx        # Cabeçalho com status e controles
│   │   │   ├── StatusBadge.tsx      # Badge de estado da máquina
│   │   │   ├── ConnectionIndicator.tsx  # Indicador de conexão
│   │   │   ├── MetricCard.tsx       # Card de métrica com tendência
│   │   │   ├── MetricsChart.tsx     # Gráfico Chart.js (temp + RPM)
│   │   │   ├── AlertsPanel.tsx      # Painel de alertas por severidade
│   │   │   ├── EfficiencyPanel.tsx  # Painel OEE com barras
│   │   │   └── ThemeToggle.tsx      # Toggle dark/light
│   │   └── utils/
│   │       └── api.ts            # Funções fetch centralizadas
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── docs/
│   ├── PLANO_COMPLETO.md         # Plano macro de todas as fases
│   ├── DECISOES_TECNICAS.md      # Justificativas arquiteturais
│   └── plain.md                  # Plano resumido de execução
├── package.json                  # Scripts de orquestração raiz
├── README.md
└── logo.svg
```

---

## ⚙️ Funcionalidades

- ✅ Monitoramento de estado da máquina em **tempo real** (RUNNING, STOPPED, MAINTENANCE, ERROR)
- ✅ Cards de métricas com **tendência** (↑↓→) e **semáforo por threshold**
- ✅ Gráfico histórico de **temperatura** e **RPM** (Chart.js, dual Y-axes)
- ✅ Painel de eficiência com **OEE consolidado** (availability, performance, quality)
- ✅ Sistema de alertas com **3 níveis** (INFO, WARNING, CRITICAL) e cooldown
- ✅ Indicador de **perda de conexão** com banner e retorno automático
- ✅ Tema **dark/light** com persistência em localStorage
- ✅ Layout **responsivo** (desktop, tablet, mobile)
- ✅ Backend com **simulador paralelo** (Random Walk em setInterval)
- ✅ Dados persistidos em **SQLite** com histórico consultável

---

## 🧠 Regras de Negócio

### Máquina de Estados

| De          | Para        | Descrição            |
| ----------- | ----------- | -------------------- |
| STOPPED     | RUNNING     | Ligar máquina        |
| RUNNING     | STOPPED     | Desligar normalmente |
| RUNNING     | ERROR       | Falha operacional    |
| ERROR       | MAINTENANCE | Entrar em manutenção |
| MAINTENANCE | STOPPED     | Concluir manutenção  |
| MAINTENANCE | RUNNING     | Liberar diretamente  |

### Thresholds

| Métrica     | Condição            | Alerta   |
| ----------- | ------------------- | -------- |
| Temperatura | > 85°C              | CRITICAL |
| Temperatura | > 80°C e ≤ 85°C     | WARNING  |
| Temperatura | < 20°C              | INFO     |
| RPM         | > 1500 (em RUNNING) | CRITICAL |
| RPM         | < 800 (em RUNNING)  | WARNING  |
| RPM         | = 0 (em RUNNING)    | CRITICAL |

### Cálculo de OEE

```
availability = tempo_running / tempo_planejado
performance  = rpm_real / rpm_teórico (1500)
quality      = peças_boas / peças_totais
OEE          = availability × performance × quality
```

---

## 🌐 API REST

| Rota                                | Método | Descrição                              |
| ----------------------------------- | ------ | -------------------------------------- |
| `GET /api/metrics/current`          | GET    | Última leitura + estado + OEE + trends |
| `GET /api/metrics/history`          | GET    | Últimas 120 leituras (gráfico)         |
| `GET /api/alerts`                   | GET    | Alertas ordenados por severidade       |
| `PATCH /api/alerts/:id/acknowledge` | PATCH  | Reconhecer alerta                      |
| `GET /api/health`                   | GET    | Status do servidor + uptime            |

---

## 🎨 Componentes React

| Componente            | Função                                                      |
| --------------------- | ----------------------------------------------------------- |
| `HeaderBar`           | Logo, título, status badge, indicador conexão, theme toggle |
| `StatusBadge`         | Estado da máquina com cor e animação por estado             |
| `ConnectionIndicator` | Bolinha verde/vermelha com ping animation                   |
| `MetricCard`          | Valor + tendência + barra de progresso + threshold colors   |
| `MetricsChart`        | Chart.js dual-axis (temperatura °C + RPM)                   |
| `AlertsPanel`         | Lista de alertas com severidade, cores e timestamps         |
| `EfficiencyPanel`     | OEE geral + barras de availability/performance/quality      |
| `ThemeToggle`         | Botão sol/lua com persistência localStorage                 |

---

## 🏗️ Decisões de Arquitetura

As decisões técnicas estão documentadas em detalhes no arquivo [docs/DECISOES_TECNICAS.md](docs/DECISOES_TECNICAS.md). Resumo:

1. **Short Polling** no lugar de WebSocket (MVP, mas preparado para migração)
2. **better-sqlite3** sem ORM (controle total, performance máxima)
3. **Monorepo simples** com `concurrently` (sem Turborepo)
4. **Chart.js** para gráficos (leve, integrado com React)
5. **Tailwind CSS v4 puro** (sem biblioteca de componentes)
6. **Random Walk** para simulação realista de sensores

---

## ✅ Testes

```bash
# Rodar todos os testes
npm test

# Backend apenas
cd backend && npm test

# Frontend apenas
cd frontend && npm test
```

---

## 📎 Documentação Complementar

| Documento                                              | Conteúdo                                    |
| ------------------------------------------------------ | ------------------------------------------- |
| [docs/PLANO_COMPLETO.md](docs/PLANO_COMPLETO.md)       | Plano macro com todas as fases e regras     |
| [docs/DECISOES_TECNICAS.md](docs/DECISOES_TECNICAS.md) | Justificativas de cada escolha arquitetural |
| [docs/plain.md](docs/plain.md)                         | Plano resumido de execução                  |

---

## 🎨 Paleta de Cores (STW)

| Cor           | Hex       | Uso                             |
| ------------- | --------- | ------------------------------- |
| 🔵 Principal  | `#1485C8` | Elementos de destaque, gráficos |
| 🔷 Escuro     | `#081653` | Header, gradientes              |
| 🟢 Running    | `#22C55E` | Estado ligada, conexão OK       |
| 🔴 Error      | `#EF4444` | Estado erro, alertas críticos   |
| 🟡 Warning    | `#EAB308` | Manutenção, alertas warning     |
| ⚪ Background | `#F6F6F6` | Fundo light mode                |
| ⚫ Dark BG    | `#0F172A` | Fundo dark mode                 |

---

## 💬 Mensagem Final

Este projeto demonstra domínio técnico em:

- **Arquitetura**: monorepo, separação de responsabilidades, design patterns.
- **Backend**: simulação assíncrona, SQL nativo, API REST bem definida.
- **Frontend**: componentes reutilizáveis, hooks customizados, responsividade.
- **UX**: animações funcionais, dark mode, alertas priorizados, feedback visual.

Recomendo começar a análise por:

1. [docs/DECISOES_TECNICAS.md](docs/DECISOES_TECNICAS.md) — entenda as escolhas
2. [backend/src/simulator.ts](backend/src/simulator.ts) — o coração do sistema
3. [frontend/src/hooks/useMachineData.ts](frontend/src/hooks/useMachineData.ts) — a ponte front-back
