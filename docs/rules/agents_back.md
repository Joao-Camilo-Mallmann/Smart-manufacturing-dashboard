# Backend Agent Rules — Dashboard de Monitoramento Industrial

## Escopo

Este arquivo guia agentes IA ao trabalhar no diretório `backend/`. Todas as regras abaixo devem ser seguidas sem exceção.

---

## Estrutura de Pastas

```
backend/src/
├── config/                    # Constantes, thresholds e tipos
│   └── types.ts               # Interfaces, enums, DTOs (única fonte de verdade)
├── core/                      # Lógica pura — NUNCA importa infra
│   ├── oee-calculator.ts      # Cálculo de OEE (availability × performance × quality)
│   ├── rules-engine.ts        # Avalia thresholds → retorna AlertEvent[] (sem persistir)
│   └── state-policy.ts        # Máquina de estados (transições válidas + probabilísticas)
├── controllers/               # Rotas Express (parse req → delega para service)
│   ├── metrics.ts             # GET /current, GET /history
│   ├── alerts.ts              # GET /, PATCH /:id/acknowledge
│   └── health.ts              # GET /health
├── database/                  # Conexão e schema SQLite
│   └── connection.ts          # Singleton: initDatabase(), getDatabase(), closeDatabase()
├── middleware/                 # Middlewares Express
│   └── error-handler.ts       # Handler centralizado de erros (último app.use)
├── repositories/              # Queries SQL isoladas (único lugar com SQL)
│   └── metrics-repository.ts  # CRUD métricas + alertas + pruning
├── routes/                    # Registro centralizado de rotas
│   └── index.ts               # Mapeia /metrics, /alerts, /health → controllers
├── services/                  # Orquestração (Core + Repositories)
│   ├── simulator.ts           # Motor de simulação (random walk + persist + prune)
│   ├── metrics-service.ts     # Monta MetricResponse (estado + trends + OEE)
│   └── alerts-service.ts      # Consulta e acknowledge de alertas
├── __tests__/                 # ★ Testes organizados por tipo
│   └── e2e/
│       └── api.test.ts        # Testes E2E da API REST (Jest + Supertest)
├── app.ts                     # Configuração Express (sem side-effects, testável)
├── data/                      # Arquivo SQLite gerado em runtime (gitignored)
└── index.ts                   # Bootstrapping: DB → Express + routes + error handler → Simulador
```

---

## Regras de Arquitetura

### Separação de Camadas (OBRIGATÓRIO)

| Camada          | Responsabilidade                     | Importa de                          | NUNCA importa                                     |
| --------------- | ------------------------------------ | ----------------------------------- | ------------------------------------------------- |
| `config/`       | Tipos, interfaces, DTOs, constantes  | — (raiz)                            | Nada externo                                      |
| `core/`         | Lógica pura de negócio               | Apenas `config/`                    | `express`, `better-sqlite3`, `fs`, qualquer infra |
| `database/`     | Conexão SQLite, schema               | `better-sqlite3`, `config/`         | Nada de negócio                                   |
| `repositories/` | Queries SQL encapsuladas             | `database/`                         | Lógica de negócio                                 |
| `services/`     | Orquestração (core + repos)          | `core/`, `repositories/`, `config/` | `express`                                         |
| `controllers/`  | Parse HTTP → delega para service     | `services/`, `config/`              | `repositories/`, `database/`                      |
| `routes/`       | Mapeamento de prefixos → controllers | `controllers/`                      | Tudo mais                                         |
| `middleware/`   | Cross-cutting (erros, auth, etc.)    | `express`                           | Negócio, dados                                    |

### Fluxo de Dados

```
Request → routes/index.ts → Controller → Service → Repository ↔ SQLite
                                            ↓
                                          Core (regras puras)
```

### Regras Estritas

1. **`core/`** é puro: funções recebem dados, retornam dados. Sem side-effects de I/O
2. **`repositories/`** são o ÚNICO lugar com SQL. Nenhum outro diretório faz queries
3. **`controllers/`** NUNCA importam de `repositories/`. Sempre delegam para `services/`
4. **`services/`** orquestram: chamam core para lógica e repositories para dados
5. **`config/types.ts`** é a única fonte de verdade para interfaces, enums e DTOs
6. **`routes/index.ts`** centraliza o mapeamento — `index.ts` usa `app.use("/api", routes)`
7. **`middleware/error-handler.ts`** é registrado como último `app.use()` no `index.ts`

---

## Schema do Banco SQLite

### Tabela `metric_history`

| Coluna           | Tipo                     | Regra                                       |
| ---------------- | ------------------------ | ------------------------------------------- |
| id               | INTEGER PK AUTOINCREMENT | —                                           |
| timestamp        | TEXT NOT NULL            | `datetime('now')`                           |
| state            | TEXT NOT NULL            | CHECK: RUNNING, STOPPED, MAINTENANCE, ERROR |
| temperature      | REAL NOT NULL            | —                                           |
| rpm              | REAL NOT NULL            | —                                           |
| uptime           | REAL NOT NULL            | —                                           |
| efficiency       | REAL NOT NULL            | —                                           |
| oee_overall      | REAL NOT NULL DEFAULT 0  | —                                           |
| oee_availability | REAL NOT NULL DEFAULT 0  | —                                           |
| oee_performance  | REAL NOT NULL DEFAULT 0  | —                                           |
| oee_quality      | REAL NOT NULL DEFAULT 0  | —                                           |

### Tabela `alerts`

| Coluna       | Tipo                       | Regra                          |
| ------------ | -------------------------- | ------------------------------ |
| id           | INTEGER PK AUTOINCREMENT   | —                              |
| timestamp    | TEXT NOT NULL              | `datetime('now')`              |
| level        | TEXT NOT NULL              | CHECK: INFO, WARNING, CRITICAL |
| message      | TEXT NOT NULL              | —                              |
| component    | TEXT NOT NULL              | —                              |
| acknowledged | INTEGER NOT NULL DEFAULT 0 | —                              |

---

## Regras de Negócio (Core)

### Máquina de Estados (`state-policy.ts`)

Transições PERMITIDAS:

- STOPPED → RUNNING
- RUNNING → STOPPED
- RUNNING → ERROR
- ERROR → MAINTENANCE
- MAINTENANCE → STOPPED
- MAINTENANCE → RUNNING

Transições NÃO LISTADAS são **proibidas**.

### Motor de Regras (`rules-engine.ts`)

**Retorno**: `AlertEvent[]` — array de objetos `{ level, message, component }`.
A persistência é responsabilidade do chamador (simulator.ts → repository).

Thresholds de alerta:

| Métrica     | Condição         | Nível    |
| ----------- | ---------------- | -------- |
| Temperatura | > 85°C           | CRITICAL |
| Temperatura | > 80°C e ≤ 85°C  | WARNING  |
| Temperatura | < 20°C           | INFO     |
| RPM         | > 1500 (RUNNING) | CRITICAL |
| RPM         | < 800 (RUNNING)  | WARNING  |
| RPM         | = 0 (RUNNING)    | CRITICAL |
| Estado      | → ERROR          | CRITICAL |

**Cooldown**: não repetir alerta com mesma chave em 60 segundos.

### OEE (`oee-calculator.ts`)

- `Availability` = tempo RUNNING / tempo planejado
- `Performance` = RPM médio real / 1500 (máximo teórico)
- `Quality` = peças boas / peças totais (simulado ~90-99%)
- `OEE` = Availability × Performance × Quality
- Clamp entre 0% e 100%
- 1 casa decimal

---

## Simulador (`services/simulator.ts`)

- Ciclo: `setInterval` de 3 segundos
- Motor: Random Walk com limites físicos por estado
- Pipeline por ciclo:
  1. `getNextState()` — transição probabilística (core/state-policy)
  2. Simula métricas conforme estado (random walk)
  3. `calculateOEE()` — cálculo de OEE (core/oee-calculator)
  4. `evaluateThresholds()` → recebe `AlertEvent[]` → persiste via `insertAlert()` (repository)
  5. `insertMetric()` — persiste leitura (repository)
  6. `pruneOldRecords()` — a cada 10 ciclos (~30s), limpa registros antigos

| Estado      | Temperatura       | RPM                 |
| ----------- | ----------------- | ------------------- |
| RUNNING     | 60-90°C, ±2/ciclo | 800-1500, ±50/ciclo |
| STOPPED     | Desce para 25°C   | Tende a 0           |
| MAINTENANCE | ~30°C estável     | 0                   |
| ERROR       | Pico até 95°C     | Queda abrupta       |

---

## Services de Domínio

### `metrics-service.ts`

Orquestra a montagem da resposta `MetricResponse`:

- Busca estado atual do simulador (`getCurrentState()`)
- Busca leitura anterior do repository (`getPreviousMetric()`)
- Calcula tendências via core (`getTrend()`)
- Retorna objeto tipado `MetricResponse` pronto para o controller

### `alerts-service.ts`

Encapsula operações de alertas:

- `listAlerts(limit)` — delega para repository com ordenação por severidade
- `acknowledgeAlert(id)` — retorna `boolean` (encontrado/não encontrado)

---

## Pruning Automático do Banco

- **Motivação**: simulador insere ~28.800 registros/dia (1 a cada 3s)
- **Trigger**: a cada 10 ciclos do simulador (~30s)
- **Regras**:
  - `metric_history` > 1.000 registros → mantém os últimos **500**
  - `alerts` > 200 registros → mantém os últimos **100**
- **Implementação**: `pruneOldRecords()` em `repositories/metrics-repository.ts`
- **SQL**: `DELETE FROM table WHERE id NOT IN (SELECT id FROM table ORDER BY id DESC LIMIT N)`

---

## Middleware de Erro

- **Arquivo**: `middleware/error-handler.ts`
- **Registro**: último `app.use()` em `index.ts` (após todas as rotas)
- **Comportamento**: captura erros não tratados, loga no console, retorna JSON genérico
- **Assinatura**: `(err: Error, req, res, next) => void`

---

## API REST

| Rota                          | Método | Retorno                       |
| ----------------------------- | ------ | ----------------------------- |
| `/api/metrics/current`        | GET    | Última leitura + estado + OEE |
| `/api/metrics/history`        | GET    | Últimas 120 leituras          |
| `/api/alerts`                 | GET    | Últimos 20 alertas            |
| `/api/alerts/:id/acknowledge` | PATCH  | Marca alerta como reconhecido |
| `/api/health`                 | GET    | Status do servidor + uptime   |

---

## Tipos e DTOs (`config/types.ts`)

### Enums

- `MachineState` — `RUNNING | STOPPED | MAINTENANCE | ERROR`
- `AlertLevel` — `INFO | WARNING | CRITICAL`

### Interfaces de domínio

- `OEEMetrics` — `overall`, `availability`, `performance`, `quality`
- `MachineStatus` — leitura completa (id + timestamp + state + metrics + oee)
- `Alert` — alerta persistido (id + level + message + component + timestamp + acknowledged)
- `MetricHistory` — ponto do gráfico (timestamp + temperature + rpm + efficiency)
- `SimulatorState` — estado interno em memória do simulador

### DTOs de resposta (contrato com o frontend)

- `MetricResponse` — resposta de `GET /api/metrics/current`
- `AlertResponse` — resposta de `GET /api/alerts`
- `AlertEvent` — alerta gerado pelo rules-engine (dados puros, sem persistência)

### Constantes

- `VALID_TRANSITIONS` — mapa de transições permitidas
- `TRANSITION_PROBABILITIES` — probabilidades por estado
- `THRESHOLDS` — limites operacionais (temperatura, RPM, cooldown, max alerts)
- `SIMULATOR_CONFIG` — intervalo, RPM teórico, temperatura ambiente (vem do `.env`)

---

## Testes

### Estrutura

```
backend/src/__tests__/
└── e2e/
    └── api.test.ts          # Testes E2E da API REST (Jest + Supertest)
```

### Padrão de Testabilidade

- **`app.ts`** exporta o Express app configurado **sem side-effects** (sem `listen()`, sem `initDatabase()`, sem `startSimulator()`)
- **`index.ts`** importa o app de `./app` e faz o bootstrap (DB + listen + simulador)
- Testes importam `app` de `@/app` e usam `supertest` para testar endpoints
- `beforeAll()`: chama `initDatabase()` + insere dados de seed via repository
- `afterAll()`: chama `closeDatabase()` para liberar o banco

### Regras para Novos Testes

1. **E2E** (endpoints HTTP) → `__tests__/e2e/`
2. **Unitários** (core/, services/) → `__tests__/unit/` (quando necessário)
3. Sempre usar `@/` alias nos imports
4. Nunca chamar `startSimulator()` em testes — inserir dados via repository
5. Sempre limpar o banco no `afterAll()`

---

## Convenções de Código

- TypeScript estrito (`strict: true`)
- Nomes de variáveis/funções em **inglês**
- Comentários em **português**
- Driver: `better-sqlite3` (síncrono)
- Sem ORM — SQL puro em repositories
- Express na porta `3001`, CORS habilitado

---

## Comandos

```bash
cd backend && npm run dev    # dev com hot reload (tsx)
cd backend && npm test       # testes com Jest
```
