# Dashboard de Monitoramento Industrial — Blueprint Completo

> Documento unificado e exaustivo de referência para recriar ou evoluir projetos similares de dashboard industrial.
> Consolida: `implementation_plan.md`, `plain.md`, `PLANO_COMPLETO.md` e `Update_tecnicos.md`.
> Sem exemplos de código — apenas regras, estrutura, decisões, convenções e critérios de aceite.

---

## 1. Objetivo do Projeto

Construir um **dashboard industrial Full Stack** para monitoramento em tempo real de uma máquina específica de linha de produção, oferecendo:

- **Visibilidade operacional imediata**: estado atual da máquina, temperatura, RPM, uptime
- **Histórico de métricas**: gráficos de linha com dados dos últimos 60-120 ciclos
- **Sistema de alertas por severidade**: INFO, WARNING, CRITICAL com priorização visual
- **Eficiência (OEE)**: cálculo e exibição de Overall Equipment Effectiveness, Availability, Performance e Quality
- **Interface responsiva**: desktop, tablet e mobile com modo escuro/claro
- **Identidade visual STW**: design system extraído da marca ([stw.com.br](https://stw.com.br/))
- **Confiabilidade visual**: detecção de perda de conexão com estado de dados congelados e banner de alerta

---

## 2. Stack Tecnológica

| Camada      | Tecnologia                   | Versão      | Observações                                            |
| ----------- | ---------------------------- | ----------- | ------------------------------------------------------ |
| Frontend    | React + TypeScript           | 19.x / ~5.9 | Vite 7 como bundler, template `react-ts`               |
| Estilização | Tailwind CSS                 | 4.x         | Sintaxe `@theme`, sem CSS-in-JS, sem styled-components |
| Gráficos    | Chart.js + react-chartjs-2   | 4.x / 5.x   | Gráficos de linha em tempo real                        |
| Ícones      | Lucide React                 | latest      | Ícones SVG limpos e consistentes                       |
| Backend     | Node.js + Express            | —           | API REST + processo paralelo de simulação              |
| Banco       | SQLite (better-sqlite3)      | —           | Driver síncrono, sem ORM, zero overhead                |
| Testes      | Jest + React Testing Library | —           | Unitários e de componentes                             |
| Monorepo    | Scripts `concurrently`       | ^8.2        | Orquestração simples front+back                        |
| Runner      | tsx                          | latest      | Dev runner TypeScript para backend                     |

### Dependências Backend

`express`, `cors`, `better-sqlite3`, `typescript`, `tsx` (dev), `@types/*`, `jest`, `ts-jest`

### Dependências Frontend

`react`, `react-dom`, `chart.js`, `react-chartjs-2`, `lucide-react`, `axios` (opcional), `tailwindcss`

---

## 3. Estrutura do Monorepo

```
projeto/
├── backend/
│   ├── src/
│   │   ├── config/                  # Constantes, thresholds e tipos
│   │   │   └── types.ts            # ★ Interfaces TypeScript (única fonte de verdade)
│   │   ├── core/                    # ★ Lógica PURA — nunca importa infra
│   │   │   ├── oee-calculator.ts   # Fórmula OEE = Disp × Perf × Qual
│   │   │   ├── rules-engine.ts     # Motor de regras (thresholds → alertas)
│   │   │   └── state-policy.ts     # Política de transição de estados
│   │   ├── controllers/            # Interface REST (rotas Express)
│   │   │   ├── metrics.ts          # GET /api/metrics/current e /history
│   │   │   ├── alerts.ts           # GET /api/alerts, PATCH /acknowledge
│   │   │   └── health.ts           # GET /api/health
│   │   ├── database/               # Conexão e schema SQLite
│   │   │   └── connection.ts       # Criação automática de tabelas no boot
│   │   ├── repositories/           # Queries SQL isoladas
│   │   │   └── metrics-repository.ts
│   │   ├── services/               # Orquestração (Core + Repositories)
│   │   │   └── simulator.ts        # ★ Motor de simulação (Random Walk)
│   │   ├── data/                    # Arquivo SQLite gerado em runtime (gitignored)
│   │   └── index.ts                # Bootstrapping: DB → Simulador → Express
│   ├── package.json
│   └── tsconfig.json               # strict: true, target: ES2020, module: commonjs
├── frontend/
│   ├── src/
│   │   ├── App.tsx                  # Orquestrador do layout (grid principal)
│   │   ├── main.tsx                 # Ponto de entrada do React
│   │   ├── assets/
│   │   │   ├── index.css            # ★ Design system tokens (@theme + .dark)
│   │   │   └── logo.svg            # Logo STW
│   │   ├── components/
│   │   │   ├── common/              # Componentes reutilizáveis (sem lógica de API)
│   │   │   │   ├── ConnectionIndicator.tsx   # Bolinha verde/vermelha + banner
│   │   │   │   ├── StatusBadge.tsx           # Estado com cor e animação
│   │   │   │   └── ThemeToggle.tsx           # Sol/lua + localStorage
│   │   │   ├── dashboard/           # Painéis especializados do dashboard
│   │   │   │   ├── MetricCard.tsx            # Card: valor, tendência, cor
│   │   │   │   ├── MetricsChart.tsx          # Chart.js: linhas temp + RPM
│   │   │   │   ├── AlertsPanel.tsx           # Lista de alertas por severidade
│   │   │   │   └── EfficiencyPanel.tsx       # Barras OEE + breakdown
│   │   │   └── layout/
│   │   │       └── HeaderBar.tsx             # Header sticky com gradient
│   │   ├── hooks/
│   │   │   └── useMachineData.ts    # ★ Hook de polling (Smart Layer)
│   │   ├── plugins/
│   │   │   └── axios.ts             # Configuração base do HTTP client
│   │   ├── services/                # Camada de fetch/API (infra pura)
│   │   ├── types/                   # Interfaces TypeScript (espelho do backend)
│   │   └── utils/
│   │       └── formatters.ts        # Formatação (RPM, Temp, Uptime, %)
│   ├── package.json
│   ├── tsconfig.app.json            # Paths: @/ → ./src
│   └── vite.config.ts               # Alias @/ resolve
├── docs/
│   ├── PROJECT_BLUEPRINT.md         # ← Este documento
│   └── rules/
│       ├── agents_front.md          # Regras IA para frontend
│       └── agents_back.md           # Regras IA para backend
├── agents.md                        # Ponto de entrada para os agents
├── package.json                     # Scripts raiz (concurrently)
└── README.md
```

---

## 4. Schema do Banco de Dados (SQLite)

O banco é criado automaticamente no boot do backend em `database/connection.ts`.

### Tabela `metric_history` — Leituras da máquina

| Coluna             | Tipo    | Restrição                                          | Descrição                   |
| ------------------ | ------- | -------------------------------------------------- | --------------------------- |
| `id`               | INTEGER | PK AUTOINCREMENT                                   | Identificador único         |
| `timestamp`        | TEXT    | NOT NULL, default `datetime('now')`                | Momento da leitura          |
| `state`            | TEXT    | NOT NULL, CHECK(RUNNING/STOPPED/MAINTENANCE/ERROR) | Estado da máquina           |
| `temperature`      | REAL    | NOT NULL                                           | Temperatura em °C           |
| `rpm`              | REAL    | NOT NULL                                           | Rotações por minuto         |
| `uptime`           | REAL    | NOT NULL                                           | Tempo de operação acumulado |
| `efficiency`       | REAL    | NOT NULL                                           | Eficiência instantânea      |
| `oee_overall`      | REAL    | NOT NULL, default 0                                | OEE geral                   |
| `oee_availability` | REAL    | NOT NULL, default 0                                | Disponibilidade             |
| `oee_performance`  | REAL    | NOT NULL, default 0                                | Performance                 |
| `oee_quality`      | REAL    | NOT NULL, default 0                                | Qualidade                   |

### Tabela `alerts` — Alertas operacionais

| Coluna         | Tipo    | Restrição                              | Descrição                                     |
| -------------- | ------- | -------------------------------------- | --------------------------------------------- |
| `id`           | INTEGER | PK AUTOINCREMENT                       | Identificador único                           |
| `timestamp`    | TEXT    | NOT NULL, default `datetime('now')`    | Momento do alerta                             |
| `level`        | TEXT    | NOT NULL, CHECK(INFO/WARNING/CRITICAL) | Severidade                                    |
| `message`      | TEXT    | NOT NULL                               | Mensagem descritiva                           |
| `component`    | TEXT    | NOT NULL                               | Componente afetado (ex: "Temperatura", "RPM") |
| `acknowledged` | INTEGER | NOT NULL, default 0                    | Se foi reconhecido (0 = não, 1 = sim)         |

---

## 5. Regras de Negócio (Core)

### 5.1 Máquina de Estados

Estados válidos: `RUNNING`, `STOPPED`, `MAINTENANCE`, `ERROR`

**Transições permitidas:**

| De → Para             | Descrição            | Probabilidade Sugerida      |
| --------------------- | -------------------- | --------------------------- |
| STOPPED → RUNNING     | Ligar máquina        | Automática após cooldown    |
| RUNNING → STOPPED     | Desligar normalmente | ~3% por ciclo               |
| RUNNING → ERROR       | Falha operacional    | ~2% por ciclo               |
| ERROR → MAINTENANCE   | Entrar em manutenção | Automática após detecção    |
| MAINTENANCE → STOPPED | Concluir manutenção  | Após N ciclos de manutenção |
| MAINTENANCE → RUNNING | Liberar diretamente  | Alternativa à parada        |

**Probabilidades de permanência (quando RUNNING):**

- ~95% permanece RUNNING
- ~2% transita para ERROR
- ~3% transita para STOPPED

**Regra rígida**: Transições não listadas acima são **proibidas**. Ex: STOPPED → ERROR é inválido sem passar por RUNNING. A `state-policy.ts` deve validar e rejeitar transições incoerentes.

### 5.2 Thresholds Operacionais

#### Temperatura

| Faixa           | Nível    | Mensagem de Alerta             |
| --------------- | -------- | ------------------------------ |
| ≤ 80°C          | Normal   | —                              |
| > 80°C e ≤ 85°C | WARNING  | "Temperatura elevada"          |
| > 85°C          | CRITICAL | "Temperatura crítica"          |
| < 20°C          | INFO     | "Anomalia de temperatura fria" |

#### RPM (quando RUNNING)

| Faixa             | Nível    | Mensagem de Alerta       |
| ----------------- | -------- | ------------------------ |
| 800 – 1500        | Normal   | —                        |
| < 800             | WARNING  | "RPM abaixo do normal"   |
| > 1500            | CRITICAL | "RPM acima do limite"    |
| = 0 por > 1 ciclo | CRITICAL | "RPM zerado em operação" |

#### Uptime

- Cresce somente em RUNNING (soma de tempo a cada ciclo)
- Pausa em STOPPED (não reseta, apenas congela)
- Não soma durante MAINTENANCE
- Reset opcional por turno (parametrizável no config)

#### Transição de Estado

| Evento                 | Nível    | Mensagem                    |
| ---------------------- | -------- | --------------------------- |
| Transição para ERROR   | CRITICAL | "Máquina em estado de erro" |
| Entrada em MAINTENANCE | INFO     | "Manutenção iniciada"       |

### 5.3 Sistema de Alertas

**Níveis de criticidade:**
| Nível | Significado | Indicação Visual |
|-------|------------|------------------|
| `CRITICAL` | Risco operacional imediato | Vermelho forte, animação `ping`, pulso |
| `WARNING` | Degradação de performance | Amarelo/âmbar, destaque moderado |
| `INFO` | Evento informativo relevante | Azul suave, sem destaque especial |

**Regras de disparo:**

1. Ao cruzar qualquer threshold de temperatura ou RPM
2. Ao transitar para estado ERROR
3. Ao se aproximar de manutenção preventiva
4. Ao perder conexão com o backend (gerado pelo frontend)

**Controle de ruído:**

- **Cooldown**: não repetir alerta com mesma chave de evento em 30-120 segundos (padrão: 60s)
- **Agregação**: eventos iguais em curto intervalo são agrupados
- **Limite visual**: máximo 20 alertas recentes no painel
- **Ordenação**: severidade (CRITICAL > WARNING > INFO), desempate por timestamp mais recente

### 5.4 OEE (Overall Equipment Effectiveness)

**Fórmulas:**

- `Availability` = tempo em RUNNING / tempo planejado (total - paradas planejadas)
- `Performance` = RPM médio real / RPM teórico máximo (1500)
- `Quality` = peças boas / peças totais (simulado entre ~90-99%)
- `OEE` = Availability × Performance × Quality

**Regras de exibição:**

- Valores em percentual com **1 casa decimal** (ex: 73.4%)
- **Clamp** entre 0% e 100% — nunca exibir valores negativos ou > 100
- **Tendência**: comparar ao ciclo anterior e exibir ↑ (subiu), ↓ (desceu), → (estável)
- **Cores por faixa de OEE**: ≥ 85% = verde, ≥ 70% = azul, ≥ 50% = amarelo, < 50% = vermelho

### 5.5 Simulação de Dados (Random Walk)

O motor de simulação roda em paralelo ao Express usando `setInterval`.

#### Comportamento por estado

| Estado      | Temperatura                      | RPM                          | Comportamento Especial             |
| ----------- | -------------------------------- | ---------------------------- | ---------------------------------- |
| RUNNING     | 60-90°C, variação ±2°C/ciclo     | 800-1500, variação ±50/ciclo | Operação normal, dados fluem       |
| STOPPED     | Desce gradualmente até ~25°C     | Tende a 0 lentamente         | Máquina parada, sem alertas de RPM |
| MAINTENANCE | Estável ~30°C                    | 0 fixo                       | Gera alertas INFO de manutenção    |
| ERROR       | Pico térmico possível (até 95°C) | Queda abrupta repentina      | Risco operacional máximo           |

#### Parâmetros do simulador

| Parâmetro                     | Valor                                                               |
| ----------------------------- | ------------------------------------------------------------------- |
| Ciclo de simulação            | 3 segundos (`setInterval`)                                          |
| Persistência                  | Cada leitura é salva no SQLite com timestamp                        |
| Janela de exibição (frontend) | Últimos 60-120 pontos no gráfico                                    |
| Variação suave                | Random Walk com limites físicos para parecer leitura de sensor real |

#### Pipeline do simulador por ciclo

1. Verificar estado atual da máquina
2. Gerar novos valores de temperatura/RPM com random walk
3. Avaliar transição de estado (via `state-policy.ts`)
4. Avaliar thresholds e gerar alertas (via `rules-engine.ts`)
5. Calcular OEE atualizado (via `oee-calculator.ts`)
6. Persistir no SQLite (via `metrics-repository.ts`)

---

## 6. Arquitetura Detalhada

### 6.1 Backend — Padrão em Camadas

| Camada          | Responsabilidade                              | Regra de Importação                                           |
| --------------- | --------------------------------------------- | ------------------------------------------------------------- |
| `config/`       | Constantes, thresholds, types compartilhados  | Pode ser importado por qualquer camada                        |
| `core/`         | Lógica pura de negócio (OEE, regras, estados) | **NUNCA** importa database, express, ou qualquer lib de infra |
| `database/`     | Conexão SQLite, criação de schema             | Importa apenas `better-sqlite3` e `config/`                   |
| `repositories/` | Queries SQL isoladas                          | Importa `database/` e `config/`                               |
| `services/`     | Orquestração: une core com repositories       | Importa `core/`, `repositories/`, `config/`                   |
| `controllers/`  | Parse de request + delegação para services    | Importa `services/` e `config/`                               |
| `index.ts`      | Bootstrapping (inicializa tudo na ordem)      | Importa tudo                                                  |

**Fluxo de dados:**

```
HTTP Request → Controller → Service → { Core (regras) + Repository (dados) } → Response
                                         ↑                    ↑
                                     Lógica pura          SQL isolado
```

**Fluxo do simulador (paralelo ao Express):**

```
setInterval(3s) → Simulator Service → { State Policy → Rules Engine → OEE Calculator } → Repository → SQLite
```

### 6.2 Bootstrapping do Backend (`index.ts`)

Ordem de inicialização:

1. Inicializar banco de dados (criar tabelas se não existirem)
2. Iniciar o simulador em paralelo (`setInterval` de 3 segundos)
3. Configurar Express com CORS habilitado
4. Registrar rotas REST
5. Iniciar Express na porta `3001`

### 6.3 API REST — Rotas e Formatos

| Rota                          | Método | Descrição                 | Retorno Esperado                                                                                                         |
| ----------------------------- | ------ | ------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `/api/metrics/current`        | GET    | Última leitura da máquina | `{ state, temperature, rpm, uptime, efficiency, oee: { overall, availability, performance, quality }, trends: { ... } }` |
| `/api/metrics/history`        | GET    | Histórico para gráfico    | `Array<{ timestamp, temperature, rpm, state, oee_overall }>` (últimas 120 leituras)                                      |
| `/api/alerts`                 | GET    | Alertas recentes          | `Array<{ id, timestamp, level, message, component, acknowledged }>` (últimos 20, ordenados por severidade > timestamp)   |
| `/api/alerts/:id/acknowledge` | PATCH  | Reconhecer alerta         | `{ success: true }`                                                                                                      |
| `/api/health`                 | GET    | Health check              | `{ status: "ok", uptime: number, version: string }`                                                                      |

### 6.4 Frontend — Padrão Smart vs. Dumb

| Diretório     | O que PODE conter                                                                    | O que NÃO pode conter                                                  |
| ------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| `components/` | JSX/TSX, classes Tailwind, recebimento de props, eventos de UI                       | fetch, useEffect com API, useState de dados remotos, lógica de negócio |
| `hooks/`      | useEffect, useState, chamadas à API, lógica de polling/WebSocket, tratamento de erro | JSX, renderização, CSS                                                 |
| `services/`   | Configuração de fetch/axios, base URL, interceptors                                  | Lógica de negócio, transformação de dados                              |
| `utils/`      | Funções puras de formatação e cálculo (RPM, Temp, OEE)                               | Chamadas de API, side effects, estado                                  |
| `types/`      | Interfaces e type aliases (espelho do backend)                                       | Qualquer implementação                                                 |

**Princípio central**: O componente é **"burro"** — recebe dados via props e apenas exibe. Se precisar usar o MetricCard em outra tela, ele não deve tentar buscar dados sozinho.

### 6.5 Hook `useMachineData` — Pipeline de Comunicação

| Etapa                    | Descrição                                                                                                |
| ------------------------ | -------------------------------------------------------------------------------------------------------- |
| 1. Carga inicial         | Na montagem do componente, fetch `/api/metrics/history` + `/api/alerts` para preencher gráficos e painel |
| 2. Polling contínuo      | `setInterval` que faz fetch `/api/metrics/current` a cada 3 segundos                                     |
| 3. Detecção de perda     | Se o fetch falhar (timeout, erro de rede), seta `isConnected = false` e congela os dados na tela         |
| 4. Banner de disconneção | Quando `isConnected = false`, exibe banner visual "Sem Conexão" na interface                             |
| 5. Reconexão automática  | Ao fetch voltar a funcionar, restaura `isConnected = true`, remove banner, retoma atualização            |
| 6. Cleanup               | Limpa o `setInterval` no cleanup do useEffect ao desmontar o componente                                  |

**Estados expostos pelo hook:**

- `status`: dados atuais da máquina (MachineStatus)
- `history`: array histórico para gráficos
- `alerts`: lista de alertas ativos
- `isConnected`: boolean de conectividade
- `isLoading`: boolean de carregamento inicial

---

## 7. Design System (Identidade STW)

### 7.1 Paleta de Cores Completa

#### Cores STW (extraídas da marca)

| Token           | Hex       | Uso Detalhado                                                         |
| --------------- | --------- | --------------------------------------------------------------------- |
| `stw-primary`   | `#00AEEF` | Accent blue — ícones, badges, barras de progresso, links, gráfico RPM |
| `stw-dark`      | `#00334E` | Navy profundo — cabeçalhos em light mode, ênfase em texto claro       |
| `stw-secondary` | `#005A87` | Mid-blue — elementos interativos secundários                          |
| `stw-corporate` | `#004C74` | Corporate blue — ponto médio do gradiente header, bordas dark mode    |
| `stw-light`     | `#0085C8` | Azul claro — hover states, destaques, links secundários               |
| `stw-navy`      | `#001A2E` | Navy mais profundo — fundo principal em dark mode                     |

#### Gradiente de Marca

- **Light mode**: `linear-gradient(135deg, #00334E 0%, #004C74 50%, #005A87 100%)`
- **Dark mode**: `linear-gradient(135deg, #001020 0%, #001A2E 50%, #00334E 100%)`
- **Gradiente radial** (referência original da marca): `radial-gradient(#0A5A87, #033047)`

#### Cores de Estado da Máquina

| Estado      | Hex       | Classes Tailwind    | Comportamento Visual                               |
| ----------- | --------- | ------------------- | -------------------------------------------------- |
| Running     | `#22c55e` | `state-running`     | Verde com pulsação discreta de atividade           |
| Stopped     | `#94a3b8` | `state-stopped`     | Cinza neutro, informação de máquina parada         |
| Maintenance | `#f59e0b` | `state-maintenance` | Amarelo/âmbar com badge explicativo                |
| Error       | `#ef4444` | `state-error`       | Vermelho com animação de atenção e foco em alertas |

#### Cores de Alerta

| Nível    | Hex       | Uso                                     |
| -------- | --------- | --------------------------------------- |
| Info     | `#3B82F6` | Badge e borda azul suave                |
| Warning  | `#F59E0B` | Badge e borda amarelo/âmbar             |
| Critical | `#DC2626` | Badge vermelho forte, com animação ping |

#### Cores Neutras

| Token            | Hex       | Uso                                     |
| ---------------- | --------- | --------------------------------------- |
| texto principal  | `#222222` | Corpo de texto em light mode            |
| bordas           | `#D9D9D9` | Divisórias e bordas em light mode       |
| superfície clara | `#F1F1F1` | Cards e superfícies em light mode       |
| fundo suave      | `#F6F6F6` | Fundo da página em light mode           |
| branco           | `#FFFFFF` | Cards em light mode, texto em dark mode |
| fundo escuro     | `#1C1C1C` | Referência de dark mode alternativo     |

### 7.2 Tokens Semânticos — Light vs. Dark

Todos definidos em `index.css` (bloco `@theme` para light; `.dark {}` para dark):

| Token CSS                   | Light Mode              | Dark Mode                      | Propósito                        |
| --------------------------- | ----------------------- | ------------------------------ | -------------------------------- |
| `--color-surface-primary`   | `#F6F6F6` (fundo suave) | `#001A2E` (STW Navy)           | Fundo geral da página            |
| `--color-surface`           | `#FFFFFF` (branco)      | `#00263E` (navy + 1 tom)       | Fundo dos cards                  |
| `--color-surface-hover`     | `#F1F1F1` (cinza claro) | `#00334E` (STW Dark)           | Estados de hover                 |
| `--color-surface-secondary` | `#E8E8E8`               | `#001020` (navy profundíssimo) | Fundos secundários               |
| `--color-content`           | `#1a202c` (chumbo)      | `#FFFFFF` (branco puro)        | Texto principal — alto contraste |
| `--color-content-secondary` | `#4a5568`               | `#BBD2E8` (azul pálido)        | Subtítulos e descrições          |
| `--color-content-muted`     | `#718096`               | `#8AAAC9` (azul suave)         | Labels, hints, texto terciário   |
| `--color-border-default`    | `#E2E8F0`               | `#004C74` (STW Corporate)      | Bordas gerais                    |
| `--color-border-card`       | `#D9D9D9`               | `#004C74` (STW Corporate)      | Bordas dos cards                 |
| `--shadow-card`             | Sombra leve             | `0 4px 12px rgba(0,0,0,0.4)`   | Sombra dos cards                 |
| `--shadow-card-hover`       | Sombra média            | `0 12px 32px rgba(0,0,0,0.5)`  | Sombra no hover                  |

### 7.3 Tipografia

| Elemento         | Fonte                                             | Tamanho  | Peso    | Extras                               |
| ---------------- | ------------------------------------------------- | -------- | ------- | ------------------------------------ |
| Corpo            | Montserrat (fallback: Inter, Segoe UI, system-ui) | 1rem     | 400     | `antialiased`                        |
| Labels STW       | Montserrat                                        | 0.7rem   | 600     | `uppercase`, `letter-spacing: 0.1em` |
| Headings         | Montserrat                                        | varies   | 700-800 | `tracking-tight`                     |
| Valores métricos | Montserrat                                        | 2.25rem+ | 800     | `tracking-tighter`                   |
| Subtítulos       | Inter                                             | 0.875rem | 500     | —                                    |

**Classe `.label-stw`**: aplica automaticamente uppercase, tracking, tamanho e peso para labels de categorias (TEMPERATURA, RPM, EFICIÊNCIA, etc.)

### 7.4 Padrões de Card

Classe CSS: `.card-stw` (aplicar em todo painel do dashboard)

| Propriedade      | Valor                                   |
| ---------------- | --------------------------------------- |
| Background       | `var(--color-surface)`                  |
| Border           | `1px solid var(--color-border-card)`    |
| Border-radius    | `var(--radius-card)` = `1.5rem` (24px)  |
| Shadow (repouso) | `var(--shadow-card)`                    |
| Shadow (hover)   | `var(--shadow-card-hover)`              |
| Hover transform  | `translateY(-2px)`                      |
| Transition       | `all 0.3s cubic-bezier(0.4, 0, 0.2, 1)` |

### 7.5 Header

| Propriedade | Descrição                                                                                                  |
| ----------- | ---------------------------------------------------------------------------------------------------------- |
| Posição     | Sticky, `top: 0`, largura total                                                                            |
| Background  | Classe `.bg-gradient-header` (adapta automaticamente light/dark)                                           |
| Layout      | Esquerda: logo SVG da STW + título "Dashboard de Monitoramento" + subtítulo "LINHA DE PRODUÇÃO INDUSTRIAL" |
| Direita     | StatusBadge (estado da máquina) + ConnectionIndicator + ThemeToggle                                        |
| Texto       | Branco em ambos os modos (sobre gradiente)                                                                 |

---

## 8. UX por Estado da Máquina

| Estado      | Cor Dominante        | Comportamento Visual                                                                          |
| ----------- | -------------------- | --------------------------------------------------------------------------------------------- |
| RUNNING     | Verde (`#22c55e`)    | StatusBadge verde com pulsação discreta; dados fluindo normalmente; gráfico atualizando       |
| STOPPED     | Cinza (`#94a3b8`)    | StatusBadge cinza estático; dados congelados no último valor; gráfico parado                  |
| MAINTENANCE | Amarelo (`#f59e0b`)  | StatusBadge amarelo com badge "Manutenção"; alertas INFO aparecendo; RPM zerado               |
| ERROR       | Vermelho (`#ef4444`) | StatusBadge vermelho com animação `ping`; alerta CRITICAL no topo; foco visual em AlertsPanel |

### Comportamento do ConnectionIndicator

| Estado       | Visual                                                   |
| ------------ | -------------------------------------------------------- |
| Conectado    | Bolinha verde sólida                                     |
| Desconectado | Bolinha vermelha pulsando + banner "Sem Conexão" no topo |
| Reconectando | Transição suave de vermelha → verde ao restabelecer      |

---

## 9. Animações (Plano em 3 Camadas)

### Camada 1 — Tailwind Puro (Base)

| Aplicação                   | Detalhes                              |
| --------------------------- | ------------------------------------- |
| Transições de cor/opacidade | Em mudança de estado da máquina       |
| Hover/focus states          | Cards e botões com `transition-all`   |
| Pulse leve                  | Indicador de conexão ativa            |
| Ping/pulse                  | Alerta CRITICAL para capturar atenção |

**Padrão**: durações curtas (150ms - 400ms), easing suave, zero ruído visual.

### Camada 2 — Intermediária (tailwindcss-animate ou keyframes customizados)

| Aplicação             | Detalhes                                                |
| --------------------- | ------------------------------------------------------- |
| Entrada escalonada    | Cards aparecem com `fade-in` sequencial no carregamento |
| Slide/fade de banners | Banner de conexão entra/sai com animação                |
| Lista de alertas      | Entrada animada de novos alertas                        |

### Camada 3 — Avançada (opcional — Framer Motion)

| Aplicação          | Detalhes                                               |
| ------------------ | ------------------------------------------------------ |
| Reorder de alertas | Animação suave ao reorganizar por severidade           |
| Transição numérica | Contagem animada de valores métricos (ex: 56.4 → 57.2) |
| AnimatePresence    | Remoção elegante de itens da lista                     |

**Regra**: usar Framer Motion **apenas** onde Tailwind puro não cobrir a interação.

### Acessibilidade de Animação

- Respeitar `prefers-reduced-motion`: degradar para transições mínimas
- Limitar animações simultâneas em tela (máx 2-3 animando ao mesmo tempo)
- Não animar áreas de leitura crítica de dados numéricos

---

## 10. Layout Responsivo

```
Desktop (≥1024px):
┌──────────────────────────────────────────────────┐
│ HeaderBar (sticky + gradient STW)                │
├────────┬────────┬────────┬───────────────────────┤
│ Temp   │ RPM    │ Uptime │ Eficiência            │
│ (card) │ (card) │ (card) │ (card)                │
├────────┴────────┴────────┴───────────────────────┤
│ MetricsChart (gráfico de linhas: Temp + RPM)     │
├─────────────────────┬────────────────────────────┤
│ AlertsPanel         │ EfficiencyPanel (OEE)      │
│ (lista de alertas)  │ (barras + breakdown)       │
└─────────────────────┴────────────────────────────┘

Tablet (768-1023px):
┌──────────────────────────────────────┐
│ HeaderBar                            │
├──────────────┬───────────────────────┤
│ Temp         │ RPM                   │
├──────────────┼───────────────────────┤
│ Uptime       │ Eficiência            │
├──────────────┴───────────────────────┤
│ MetricsChart                         │
├──────────────────────────────────────┤
│ AlertsPanel                          │
├──────────────────────────────────────┤
│ EfficiencyPanel                      │
└──────────────────────────────────────┘

Mobile (<768px):
┌──────────────────┐
│ HeaderBar        │
├──────────────────┤
│ Temp             │
├──────────────────┤
│ RPM              │
├──────────────────┤
│ Uptime           │
├──────────────────┤
│ Eficiência       │
├──────────────────┤
│ MetricsChart     │
├──────────────────┤
│ AlertsPanel      │
├──────────────────┤
│ EfficiencyPanel  │
└──────────────────┘
```

---

## 11. Componentes — Responsabilidades Detalhadas

| Componente            | Localização  | Responsabilidade                                                                                     | Props Principais                                                |
| --------------------- | ------------ | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `HeaderBar`           | `layout/`    | Logo STW, título, subtítulo, StatusBadge, ConnectionIndicator, ThemeToggle                           | `status`, `isConnected`                                         |
| `StatusBadge`         | `common/`    | Mostra estado (RUNNING/STOPPED/MAINTENANCE/ERROR) com cor, ícone e animação                          | `state`                                                         |
| `ConnectionIndicator` | `common/`    | Bolinha verde/vermelha + banner de desconexão                                                        | `isConnected`                                                   |
| `ThemeToggle`         | `common/`    | Botão sol/lua com persistência em localStorage                                                       | — (auto-gerencia)                                               |
| `MetricCard`          | `dashboard/` | Card com: ícone, label, valor atual, unidade, tendência (↑↓→), barra de progresso, cor por threshold | `title`, `value`, `unit`, `trend`, `max`, `warning`, `critical` |
| `MetricsChart`        | `dashboard/` | Gráfico Chart.js com 2 linhas: Temperatura (vermelho) e RPM (azul STW). Eixos Y duais.               | `history` (array de pontos)                                     |
| `AlertsPanel`         | `dashboard/` | Lista de alertas ordenados por severidade > timestamp, com ícone, cor, mensagem e hora               | `alerts` (array)                                                |
| `EfficiencyPanel`     | `dashboard/` | Valor OEE geral grande colorido + barras individuais de Availability, Performance, Quality           | `oee` (objeto com 4 valores)                                    |

---

## 12. Convenções de Código

### 12.1 Geral

- TypeScript estrito em **todo** o projeto (`strict: true`)
- Nomes de variáveis, funções e interfaces em **inglês**
- Comentários de código em **português**
- UI text (labels, títulos, mensagens) em **português (pt-BR)**

### 12.2 Frontend

- Imports com alias `@/` (mapeado em `tsconfig.app.json` e `vite.config.ts`)
- Um componente por arquivo, nome do arquivo = nome do componente (PascalCase)
- Props tipadas com `interface Props { ... }`
- Export padrão: `export default function ComponentName({ props }: Props)`
- Estilização: classes Tailwind no JSX, sem CSS-in-JS
- Classes CSS customizadas vão em `index.css` com nomes STW (`.card-stw`, `.label-stw`, `.bg-gradient-header`)
- Inline styles **apenas** para valores dinâmicos (cores Chart.js, larguras percentuais)
- Dark mode via `.dark {}` no CSS, **não** via `dark:` prefix do Tailwind

### 12.3 Backend

- Padrão de camadas: config → core → repositories → services → controllers
- `core/` é puro — **nunca** importa dependências de infraestrutura
- Queries SQL isoladas em `repositories/` — nenhum SQL em controllers ou services
- Controllers apenas fazem parse de request e delegam para services
- Tipos compartilhados centralizados em `config/types.ts`
- Express na porta `3001`, CORS habilitado para `localhost:5173`

### 12.4 Formatação de Valores

| Tipo        | Formato         | Exemplo     |
| ----------- | --------------- | ----------- |
| Temperatura | 1 decimal + °C  | `56.4 °C`   |
| RPM         | Inteiro + rpm   | `1.200 rpm` |
| Uptime      | Horas + minutos | `2h 35m`    |
| OEE/%       | 1 decimal + %   | `73.4%`     |
| Timestamps  | HH:MM:SS        | `10:01:59`  |

### 12.5 Dark Mode

- Toggle via `ThemeToggle` component (sol ↔ lua)
- Persistido em `localStorage` key `"theme"`
- Aplica classe `dark` no `<html>` via `document.documentElement`
- Respeita `prefers-color-scheme` como default na primeira visita
- Tokens CSS em `.dark {}` sobrescrevem defaults light automaticamente
- Textos principais usam `text-content` (adaptativo a ambos os modos)

### 12.6 Estado Global

- Sem biblioteca de state management (sem Redux, Zustand, etc.)
- Estado local com React hooks (`useState`, `useEffect`, `useRef`)
- Dados de máquina via custom hook `useMachineData`
- Tema via custom hook `useTheme` (ou diretamente no ThemeToggle)

---

## 13. Riscos e Mitigações

| Risco                                 | Impacto                               | Mitigação                                                              |
| ------------------------------------- | ------------------------------------- | ---------------------------------------------------------------------- |
| Excesso de alertas repetidos          | Ruído visual, UX degradada            | Cooldown 60s, agregação de eventos, limite de 20 itens                 |
| Animações pesadas em hardware fraco   | Travamento, lag de UI                 | Reduzir simultâneas, respeitar `prefers-reduced-motion`                |
| Descompasso entre simulação e UI      | Dados inconsistentes na tela          | Contrato de tipos compartilhado, testes de integração                  |
| Regressão em tratamento de desconexão | Banner não aparece, dados corrompidos | Testes específicos de fallback e reconexão                             |
| Polling sobrecarregando backend       | Latência alta com muitos clientes     | Usar cache em memória para última leitura; em produção, migrar para WS |

---

## 14. Plano de Execução por Fases

### Fase 1 — Fundação do Monorepo

- Criar estrutura `frontend/` + `backend/`
- Configurar scripts de dev/build/test na raiz
- Padronizar TypeScript e ambientes

**Critério de saída**: Projeto sobe com comandos unificados (`npm run dev`).

### Fase 2 — Backend: Motor de Regras e Dados

- Modelar tabelas SQLite (metric_history + alerts)
- Implementar simulador paralelo (`setInterval` + Random Walk)
- Implementar core puro: OEE calculator, rules engine, state policy
- Publicar endpoints REST (metrics, alerts, health)

**Critério de saída**: API responde com dados consistentes e histórico realista.

### Fase 3 — Frontend: Branding e Componentes

- Estruturar layout conforme wireframe
- Configurar design system STW no Tailwind (`@theme`)
- Montar componentes reutilizáveis: MetricCard, StatusBadge, AlertsPanel
- Integrar gráfico Chart.js e painel OEE
- Configurar tema dark/light

**Critério de saída**: Dashboard funcional com dados reais da API.

### Fase 4 — Tempo Real, Conexão e Alertas

- Implementar polling 2-5s via custom hook
- Tratar estados de erro e reconexão (banner)
- Ordenar e exibir alertas por prioridade
- Acionar efeitos visuais de severidade

**Critério de saída**: Fluxo de monitoramento contínuo e robusto em queda de conexão.

### Fase 5 — Animações e Polimento

- Aplicar plano de animações por camadas (Tailwind base → intermediária → avançada)
- Revisar responsividade desktop/tablet/mobile
- Calibrar legibilidade e acessibilidade
- Ajustar contraste em dark mode

**Critério de saída**: UX fluida sem comprometer leitura operacional.

### Fase 6 — Qualidade e Entrega

- Testes unitários (backend: OEE, thresholds, state machine, endpoints)
- Testes de componentes (frontend: MetricCard, AlertsPanel, StatusBadge)
- Checklist final de requisitos
- Documentação (README + decisões técnicas)
- Screenshot/vídeo de demonstração

**Critério de saída**: Entrega completa e avaliável sem ajustes bloqueantes.

---

## 15. Plano de Testes

### Backend (Jest + ts-jest)

| Arquivo de Teste         | O que Valida                                                         |
| ------------------------ | -------------------------------------------------------------------- |
| `oee-calculator.test.ts` | Fórmulas de OEE, clamping 0-100%, edge cases                         |
| `rules-engine.test.ts`   | Alertas corretos para cada faixa de temperatura e RPM                |
| `state-policy.test.ts`   | Transições válidas aceitas, inválidas rejeitadas                     |
| `routes.test.ts`         | Endpoints retornam status 200 e formato JSON correto (via supertest) |
| `simulator.test.ts`      | Consistência de dados gerados em múltiplos ciclos                    |

### Frontend (Jest + React Testing Library)

| Arquivo de Teste       | O que Valida                                          |
| ---------------------- | ----------------------------------------------------- |
| `MetricCard.test.tsx`  | Renderiza valor, tendência, cor correta por threshold |
| `StatusBadge.test.tsx` | Renderiza estado correto com classe CSS adequada      |
| `AlertsPanel.test.tsx` | Ordena por severidade, exibe máximo 20                |
| `ThemeToggle.test.tsx` | Toggle funciona, persiste em localStorage             |

### E2E (Desejável)

- Jornada completa de monitoramento (máquina ligada → alerta → reconhecimento)
- Validação de alerta CRITICAL na tela
- Verificação de responsividade básica (desktop → tablet → mobile)

---

## 16. Checklist Final de Aprovação

| #   | Requisito                                                | Status |
| --- | -------------------------------------------------------- | ------ |
| 1   | TypeScript presente em frontend e backend                | ☐      |
| 2   | Tailwind CSS aplicado na interface                       | ☐      |
| 3   | Monorepo organizado com responsabilidades separadas      | ☐      |
| 4   | Atualização em tempo real entre 2 e 5 segundos           | ☐      |
| 5   | Estados da máquina implementados e visíveis              | ☐      |
| 6   | Alertas com níveis INFO, WARNING e CRITICAL              | ☐      |
| 7   | Histórico de alertas e métricas disponível               | ☐      |
| 8   | OEE, disponibilidade, performance e qualidade calculados | ☐      |
| 9   | Tratamento de erro e perda de conexão funcional          | ☐      |
| 10  | Dashboard responsivo: desktop, tablet e mobile           | ☐      |
| 11  | Testes básicos configurados e executáveis                | ☐      |
| 12  | README/documentação com instruções claras                | ☐      |
| 13  | Modo dark/light funcional com persistência               | ☐      |
| 14  | Identidade visual STW aplicada (paleta + gradientes)     | ☐      |
| 15  | Código executável sem erros bloqueantes                  | ☐      |

---

## 17. Definições de Pronto

### Pronto por funcionalidade

- Regra de negócio definida e documentada
- Comportamento visual definido
- Validação prevista em teste
- Critério de aceite objetivo e mensurável

### Pronto para entrega final

- Todos os itens obrigatórios do checklist atendidos
- Sem erro bloqueante
- Demonstração preparada (vídeo ou screenshots)
- Documentação de decisões técnicas atualizada
- README com instruções de instalação e execução

---

## 18. Comandos de Desenvolvimento

```bash
# Full stack (da raiz)
npm run dev                  # Inicia backend (3001) + frontend (5173) em paralelo

# Frontend isolado
cd frontend && npm run dev   # Vite dev server com HMR
cd frontend && npm run build # Build de produção
cd frontend && npm test      # Testes com Jest

# Backend isolado
cd backend && npm run dev    # tsx com hot reload
cd backend && npm test       # Testes com Jest

# Testes completos
npm test                     # Executa testes de ambos os pacotes
```
