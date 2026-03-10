# Dashboard de Monitoramento Industrial — Plano de Implementação Completo

Plano detalhado para construir o **dashboard industrial full stack** conforme os documentos de referência (`DesafioTécnico.md.txt`, [PLANO_COMPLETO.md](file:///c:/Users/jcami/OneDrive/Documentos/Codes/FULLSTACK_CHALLENGER/docs/PLANO_COMPLETO.md), [plain.md](file:///c:/Users/jcami/OneDrive/Documentos/Codes/FULLSTACK_CHALLENGER/docs/plain.md)). O sistema monitora em tempo real uma máquina de linha de produção, com React + TypeScript + Tailwind no front, Node.js + Express + SQLite no back, em arquitetura monorepo. Gráficos com **Chart.js** (`react-chartjs-2`).

> [!IMPORTANT]
> **Prazo de entrega: 16/03/2026.** Todas as fases devem ser concluídas até esta data.

---

## Estrutura Final do Monorepo

```text
FULLSTACK_CHALLENGER/
├── backend/
│   ├── src/
│   │   ├── index.ts              ← Ponto de entrada (Express + Simulador)
│   │   ├── database.ts           ← Conexão e criação de tabelas SQLite
│   │   ├── simulator.ts          ← Motor de simulação (Random Walk)
│   │   ├── state-machine.ts      ← Máquina de estados da máquina
│   │   ├── thresholds.ts         ← Regras de threshold e geração de alertas
│   │   ├── oee.ts                ← Cálculo de OEE
│   │   ├── routes/
│   │   │   ├── metrics.ts        ← GET /api/metrics/current e /history
│   │   │   ├── alerts.ts         ← GET /api/alerts, PATCH /acknowledge
│   │   │   └── health.ts         ← GET /api/health
│   │   └── types.ts              ← Interfaces TypeScript compartilhadas
│   ├── package.json
│   ├── tsconfig.json
│   └── data/                     ← Arquivo SQLite gerado em runtime
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── index.css             ← Tailwind + animações customizadas
│   │   ├── types.ts              ← Interfaces TypeScript (espelho do back)
│   │   ├── hooks/
│   │   │   └── useMachineData.ts ← Custom hook de polling
│   │   ├── components/
│   │   │   ├── HeaderBar.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── ConnectionIndicator.tsx
│   │   │   ├── MetricCard.tsx
│   │   │   ├── MetricsChart.tsx
│   │   │   ├── AlertsPanel.tsx
│   │   │   ├── EfficiencyPanel.tsx
│   │   │   └── ThemeToggle.tsx
│   │   └── utils/
│   │       └── api.ts            ← Funções fetch centralizadas
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── docs/
├── package.json                  ← Scripts de orquestração raiz
├── README.md
└── logo.svg
```

---

## Proposed Changes

### Componente 1: Raiz do Monorepo

#### [NEW] [package.json](file:///c:/Users/jcami/OneDrive/Documentos/Codes/FULLSTACK_CHALLENGER/package.json)

Scripts de orquestração na raiz:

```json
{
  "name": "fullstack-challenger",
  "private": true,
  "scripts": {
    "dev": "concurrently \"npm run dev:back\" \"npm run dev:front\"",
    "dev:back": "cd backend && npm run dev",
    "dev:front": "cd frontend && npm run dev",
    "build": "cd frontend && npm run build",
    "test": "concurrently \"npm run test:back\" \"npm run test:front\"",
    "test:back": "cd backend && npm test",
    "test:front": "cd frontend && npm test"
  },
  "devDependencies": {
    "concurrently": "^8.2.0"
  }
}
```

---

### Componente 2: Backend (Node.js + Express + SQLite)

#### [NEW] [backend/package.json](file:///c:/Users/jcami/OneDrive/Documentos/Codes/FULLSTACK_CHALLENGER/backend/package.json)

**Dependências:** `express`, `cors`, `better-sqlite3`, `typescript`, `tsx` (dev runner), `@types/*`, `jest`, `ts-jest`

#### [NEW] [backend/tsconfig.json](file:///c:/Users/jcami/OneDrive/Documentos/Codes/FULLSTACK_CHALLENGER/backend/tsconfig.json)

TypeScript estrito com `target: ES2020`, `module: commonjs`, `strict: true`.

---

#### [NEW] [database.ts](file:///c:/Users/jcami/OneDrive/Documentos/Codes/FULLSTACK_CHALLENGER/backend/src/database.ts)

Schema do SQLite (duas tabelas):

```sql
-- Tabela de histórico de métricas (leituras da máquina)
CREATE TABLE IF NOT EXISTS metric_history (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp   TEXT    NOT NULL DEFAULT (datetime('now')),
  state       TEXT    NOT NULL CHECK(state IN ('RUNNING','STOPPED','MAINTENANCE','ERROR')),
  temperature REAL    NOT NULL,
  rpm         REAL    NOT NULL,
  uptime      REAL    NOT NULL,
  efficiency  REAL    NOT NULL,
  oee_overall      REAL NOT NULL DEFAULT 0,
  oee_availability REAL NOT NULL DEFAULT 0,
  oee_performance  REAL NOT NULL DEFAULT 0,
  oee_quality      REAL NOT NULL DEFAULT 0
);

-- Tabela de alertas operacionais
CREATE TABLE IF NOT EXISTS alerts (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp    TEXT    NOT NULL DEFAULT (datetime('now')),
  level        TEXT    NOT NULL CHECK(level IN ('INFO','WARNING','CRITICAL')),
  message      TEXT    NOT NULL,
  component    TEXT    NOT NULL,
  acknowledged INTEGER NOT NULL DEFAULT 0
);
```

- Usa `better-sqlite3` (driver síncrono, mais rápido que `sqlite3` assíncrono)
- Cria tabelas automaticamente no boot

---

#### [NEW] [state-machine.ts](file:///c:/Users/jcami/OneDrive/Documentos/Codes/FULLSTACK_CHALLENGER/backend/src/state-machine.ts)

Máquina de estados da máquina industrial:

| Transição válida      | De → Para            |
| --------------------- | -------------------- |
| STOPPED → RUNNING     | Ligar máquina        |
| RUNNING → STOPPED     | Desligar normalmente |
| RUNNING → ERROR       | Falha operacional    |
| ERROR → MAINTENANCE   | Entrar em manutenção |
| MAINTENANCE → STOPPED | Concluir manutenção  |
| MAINTENANCE → RUNNING | Liberar diretamente  |

- Probabilidades de transição configuráveis (ex: 95% fica RUNNING, 2% vai ERROR, etc.)
- Valida transições incoerentes

---

#### [NEW] [simulator.ts](file:///c:/Users/jcami/OneDrive/Documentos/Codes/FULLSTACK_CHALLENGER/backend/src/simulator.ts)

**Motor de simulação (Random Walk)** — roda em paralelo com o Express:

| Estado      | Temperatura                      | RPM                       | Comportamento           |
| ----------- | -------------------------------- | ------------------------- | ----------------------- |
| RUNNING     | 60–90°C, varia ±2/ciclo          | 800–1500, varia ±50/ciclo | Operação normal         |
| STOPPED     | Desce para 25°C                  | Tende a 0                 | Máquina parada          |
| MAINTENANCE | Estável ~30°C                    | 0                         | Gera INFO de manutenção |
| ERROR       | Pico térmico possível (até 95°C) | Queda abrupta             | Risco operacional       |

- `setInterval` de 3 segundos
- Persiste cada leitura no SQLite
- Chama `thresholds.ts` para gerar alertas quando necessário

---

#### [NEW] [thresholds.ts](file:///c:/Users/jcami/OneDrive/Documentos/Codes/FULLSTACK_CHALLENGER/backend/src/thresholds.ts)

Regras de threshold e geração de alertas:

| Métrica     | Condição         | Nível    | Mensagem                     |
| ----------- | ---------------- | -------- | ---------------------------- |
| Temperatura | > 85°C           | CRITICAL | Temperatura crítica          |
| Temperatura | > 80°C e ≤ 85°C  | WARNING  | Temperatura elevada          |
| Temperatura | < 20°C           | INFO     | Anomalia de temperatura fria |
| RPM         | > 1500 (RUNNING) | CRITICAL | RPM acima do limite          |
| RPM         | < 800 (RUNNING)  | WARNING  | RPM abaixo do normal         |
| RPM         | = 0 (RUNNING)    | CRITICAL | RPM zerado em operação       |
| Estado      | → ERROR          | CRITICAL | Máquina em estado de erro    |

- **Cooldown**: não repete alerta com mesma chave em 60 segundos
- **Limite**: máximo 20 alertas recentes no painel

---

#### [NEW] [oee.ts](file:///c:/Users/jcami/OneDrive/Documentos/Codes/FULLSTACK_CHALLENGER/backend/src/oee.ts)

Cálculo de OEE:

```
availability = tempo_running / tempo_planejado
performance  = rpm_medio_real / rpm_teorico_maximo (1500)
quality      = pecas_boas / pecas_totais (simulado ~90-99%)
oee          = availability × performance × quality
```

- Valores clamped entre 0% e 100%, exibidos com 1 casa decimal
- Calcula tendência (↑ subiu / ↓ desceu / → estável) comparando ao ciclo anterior

---

#### [NEW] Rotas REST

| Rota                          | Método | Retorno                                              |
| ----------------------------- | ------ | ---------------------------------------------------- |
| `/api/metrics/current`        | GET    | Última leitura + estado + OEE                        |
| `/api/metrics/history`        | GET    | Últimas 120 leituras para gráfico                    |
| `/api/alerts`                 | GET    | Últimos 20 alertas, ordenados severidade > timestamp |
| `/api/alerts/:id/acknowledge` | PATCH  | Marca alerta como reconhecido                        |
| `/api/health`                 | GET    | Status do servidor + uptime                          |

---

#### [NEW] [index.ts](file:///c:/Users/jcami/OneDrive/Documentos/Codes/FULLSTACK_CHALLENGER/backend/src/index.ts)

Ponto de entrada:

1. Inicializa banco de dados (cria tabelas)
2. Inicia o simulador em paralelo (`setInterval`)
3. Inicia Express na porta 3001 com CORS habilitado

---

### Componente 3: Frontend (React + Vite + TypeScript + Tailwind)

#### [NEW] Frontend inicializado com Vite

```bash
npx -y create-vite@latest ./ --template react-ts
```

**Dependências**: `chart.js`, `react-chartjs-2`, `lucide-react` (ícones)

---

#### [NEW] [tailwind.config.js](file:///c:/Users/jcami/OneDrive/Documentos/Codes/FULLSTACK_CHALLENGER/frontend/tailwind.config.js)

Paleta de cores STW customizada:

```js
colors: {
  stw: {
    primary: '#1485C8',
    dark: '#081653',
    secondary: '#0C24A8',
    corporate: '#005A87',
    light: '#0085C8',
  },
  neutral: {
    text: '#222222',
    border: '#D9D9D9',
    surface: '#F1F1F1',
    bg: '#F6F6F6',
    white: '#FFFFFF',
    darkbg: '#1C1C1C',
  },
  state: {
    running: '#22C55E',
    stopped: '#6B7280',
    maintenance: '#EAB308',
    error: '#EF4444',
  },
  alert: {
    info: '#3B82F6',
    warning: '#F59E0B',
    critical: '#DC2626',
  }
}
```

Animações customizadas no Tailwind:

```js
animation: {
  'pulse-slow': 'pulse 3s ease-in-out infinite',
  'fade-in': 'fadeIn 0.3s ease-out',
  'slide-up': 'slideUp 0.3s ease-out',
  'ping-critical': 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
}
```

---

#### [NEW] Componentes React principais

| Componente            | Responsabilidade                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------------------ |
| `HeaderBar`           | Logo STW, título, toggle dark/light, indicador de conexão                                        |
| `StatusBadge`         | Mostra estado (RUNNING/STOPPED/MAINTENANCE/ERROR) com cor e animação                             |
| `ConnectionIndicator` | Bolinha verde (conectado) / vermelha pulsando (desconectado) + banner                            |
| `MetricCard`          | Card com valor atual, tendência (↑↓→), cor por threshold                                         |
| `MetricsChart`        | Gráfico Chart.js (via `react-chartjs-2`) com linhas de temperatura e RPM (últimos 60-120 pontos) |
| `AlertsPanel`         | Lista de alertas ordenados por severidade, com cores e timestamp                                 |
| `EfficiencyPanel`     | Barras/gauges de OEE, availability, performance, quality                                         |
| `ThemeToggle`         | Botão sol/lua com persistência em localStorage                                                   |

---

#### [NEW] [useMachineData.ts](file:///c:/Users/jcami/OneDrive/Documentos/Codes/FULLSTACK_CHALLENGER/frontend/src/hooks/useMachineData.ts)

Custom hook de polling:

1. **Carga inicial**: fetch `/api/metrics/history` + `/api/alerts` na montagem
2. **Polling**: fetch `/api/metrics/current` a cada 3 segundos
3. **Detecção de perda**: se fetch falhar, seta `isConnected = false` e congela dados
4. **Reconexão**: ao voltar, restaura banner e retoma atualização
5. Limpa interval no cleanup do componente

---

#### [NEW] [api.ts](file:///c:/Users/jcami/OneDrive/Documentos/Codes/FULLSTACK_CHALLENGER/frontend/src/utils/api.ts)

Funções centralizadas de fetch:

```typescript
const API_BASE = 'http://localhost:3001/api';

export async function fetchCurrentMetrics(): Promise<MachineStatus> { ... }
export async function fetchHistory(): Promise<MetricHistory[]> { ... }
export async function fetchAlerts(): Promise<Alert[]> { ... }
```

---

#### [NEW] Layout Responsivo (Grid CSS)

```
Desktop (≥1024px):
┌──────────────────────────────────────────────────┐
│ HeaderBar                                        │
├────────┬────────┬────────┬───────────────────────┤
│ Estado │ Temp   │ RPM    │ Uptime                │
├────────┴────────┴────────┴───────────────────────┤
│ MetricsChart (linha temperatura + RPM)           │
├─────────────────────┬────────────────────────────┤
│ AlertsPanel         │ EfficiencyPanel            │
└─────────────────────┴────────────────────────────┘

Tablet (768-1023px): Cards em 2 colunas, painéis empilhados
Mobile (<768px): Tudo em coluna única
```

---

### Componente 4: Tema Dark/Light

- **CSS Variables** no `:root` e `.dark`
- Toggle salva preferência no `localStorage`
- Aplica classe `dark` no `<html>`
- Respeita `prefers-color-scheme` como default

---

### Componente 5: README.md (Polido)

#### [MODIFY] [README.md](file:///c:/Users/jcami/OneDrive/Documentos/Codes/FULLSTACK_CHALLENGER/README.md)

Aproveitar a estrutura existente e enriquecer com:

- **Header visual** com badges (status, stack, license)
- **Preview/Screenshot** do dashboard em funcionamento
- **Instalação e execução** passo a passo (`npm install`, `npm run dev`)
- **Estrutura do projeto** com tree atualizada
- **Funcionalidades** com checklist visual ✅
- **Stack tecnológica** em tabela
- **Decisões de arquitetura** (resumo + link para `docs/DECISOES_TECNICAS.md`)
- **Como testar** (`npm test`)
- **Paleta de cores** com swatches visuais
- **Roadmap** atualizado

---

### Componente 6: Documento de Decisões Técnicas

#### [NEW] [DECISOES_TECNICAS.md](file:///c:/Users/jcami/OneDrive/Documentos/Codes/FULLSTACK_CHALLENGER/docs/DECISOES_TECNICAS.md)

Documento auxiliar preparado para **responder dúvidas técnicas da banca avaliadora**. Estrutura:

**1. Por que Short Polling e não WebSocket?**
- MVP com prazo curto → polling é mais simples de implementar e debugar
- Backend permanece stateless (sem gerenciar conexões WS)
- Em ambiente real/produção, **WebSocket seria a escolha ideal**: menor latência, menor overhead de rede, push real bidirecional
- A arquitetura foi desenhada para migrar facilmente: basta trocar o fetch por um listener WS no hook `useMachineData`

**2. Por que `better-sqlite3` e não um ORM?**
- Controle total sobre queries SQL
- Zero overhead de abstração
- Schema simples (2 tabelas) não justifica Prisma/Sequelize
- Driver síncrono = código mais previsível no simulador

**3. Por que Monorepo simples e não Turborepo?**
- Escopo do projeto é 2 pacotes (front + back)
- Scripts `concurrently` resolvem a orquestração
- Evita complexidade de configuração desnecessária para MVP

**4. Por que Chart.js e não D3 ou outra lib?**
- Requisito do desafio sugere Chart.js/Recharts
- `react-chartjs-2` oferece integração nativa com React
- Leve, performático, e suficiente para gráficos de linha em tempo real

**5. Por que simulação Random Walk?**
- Gera dados com variação realista e suave
- Respeita limites físicos por estado da máquina
- Dados não parecem aleatórios — parecem leituras de sensor real

**6. Escalabilidade (o que mudaria em produção?)**
- Trocar polling → WebSocket (Socket.io ou WS nativo)
- Trocar SQLite → PostgreSQL/TimescaleDB
- Adicionar autenticação (JWT)
- Adicionar filas de eventos (Redis/RabbitMQ)
- Containerizar com Docker

---

## Verification Plan

### Testes Automatizados

#### Backend (Jest)

```bash
cd backend && npm test
```

Testes a criar:

- **`thresholds.test.ts`**: Valida que alertas corretos são gerados para cada faixa de temperatura e RPM
- **`oee.test.ts`**: Valida fórmulas de cálculo de OEE e clamping 0-100%
- **`state-machine.test.ts`**: Valida transições válidas e rejeita inválidas
- **`routes.test.ts`**: Testa endpoints via supertest (status 200, formato JSON correto)

#### Frontend (Jest + React Testing Library)

```bash
cd frontend && npm test
```

Testes a criar:

- **`MetricCard.test.tsx`**: Renderiza valor, tendência e cor correta
- **`StatusBadge.test.tsx`**: Renderiza estado correto com classe CSS
- **`AlertsPanel.test.tsx`**: Ordena por severidade, exibe máximo 20

### Verificação Manual

1. **Iniciar o sistema**: `npm run dev` na raiz → backend (porta 3001) + frontend (porta 5173)
2. **Dashboard funcional**: Verificar que cards atualizam a cada ~3 segundos
3. **Gráfico**: Verificar que linhas de temperatura e RPM crescem em tempo real
4. **Alertas**: Aguardar um alerta CRITICAL aparecer (temperatura > 85°C ou estado ERROR)
5. **Desconexão**: Parar o backend → verificar que banner "Sem Conexão" aparece → reiniciar backend → verificar reconexão
6. **Dark/Light**: Clicar toggle → interface muda → recarregar página → preferência persiste
7. **Responsividade**: Redimensionar janela para tablet (768px) e mobile (375px) → layout adapta

### Verificação com Browser (screenshots)

Usarei a ferramenta de browser para abrir `http://localhost:5173` e capturar screenshots do dashboard em funcionamento para incluir no walkthrough.
