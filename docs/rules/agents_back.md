# Backend Agent Rules — Dashboard de Monitoramento Industrial

## Escopo

Este arquivo guia agentes IA ao trabalhar no diretório `backend/`. Todas as regras abaixo devem ser seguidas sem exceção.

---

## Estrutura de Pastas

```
backend/src/
├── config/              # Constantes, thresholds e tipos
│   └── types.ts         # Interfaces compartilhadas (única fonte de verdade)
├── core/                # Lógica pura — NUNCA importa infra
│   ├── oee-calculator.ts
│   ├── rules-engine.ts
│   └── state-policy.ts
├── controllers/         # Rotas Express (parse req → delega para service)
│   ├── metrics.ts
│   ├── alerts.ts
│   └── health.ts
├── database/            # Conexão e schema SQLite
│   └── connection.ts
├── repositories/        # Queries SQL isoladas
│   └── metrics-repository.ts
├── services/            # Orquestração (Core + Repositories)
│   └── simulator.ts
├── data/                # Arquivo SQLite gerado em runtime (gitignored)
└── index.ts             # Bootstrapping: DB → Simulador → Express
```

---

## Regras de Arquitetura

### Separação de Camadas (OBRIGATÓRIO)

1. **`core/`** é puro: NUNCA importa `express`, `better-sqlite3`, `fs`, ou qualquer dependência de infra
2. **`repositories/`** encapsulam todo SQL: nenhum outro diretório pode fazer queries diretas
3. **`controllers/`** apenas fazem parse do request e delegam para services. Sem lógica de negócio
4. **`services/`** orquestram: pegam dados de repositories, aplicam lógica de core, retornam resultado
5. **`config/types.ts`** é a única fonte de verdade para interfaces TypeScript

### Fluxo de dados

```
Request → Controller → Service → Repository ↔ SQLite
                         ↓
                       Core (regras puras)
```

---

## Schema do Banco SQLite

### Tabela `metric_history`

| Coluna | Tipo | Regra |
|--------|------|-------|
| id | INTEGER PK AUTOINCREMENT | — |
| timestamp | TEXT NOT NULL | `datetime('now')` |
| state | TEXT NOT NULL | CHECK: RUNNING, STOPPED, MAINTENANCE, ERROR |
| temperature | REAL NOT NULL | — |
| rpm | REAL NOT NULL | — |
| uptime | REAL NOT NULL | — |
| efficiency | REAL NOT NULL | — |
| oee_overall | REAL NOT NULL DEFAULT 0 | — |
| oee_availability | REAL NOT NULL DEFAULT 0 | — |
| oee_performance | REAL NOT NULL DEFAULT 0 | — |
| oee_quality | REAL NOT NULL DEFAULT 0 | — |

### Tabela `alerts`

| Coluna | Tipo | Regra |
|--------|------|-------|
| id | INTEGER PK AUTOINCREMENT | — |
| timestamp | TEXT NOT NULL | `datetime('now')` |
| level | TEXT NOT NULL | CHECK: INFO, WARNING, CRITICAL |
| message | TEXT NOT NULL | — |
| component | TEXT NOT NULL | — |
| acknowledged | INTEGER NOT NULL DEFAULT 0 | — |

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

Thresholds de alerta:

| Métrica | Condição | Nível |
|---------|----------|-------|
| Temperatura | > 85°C | CRITICAL |
| Temperatura | > 80°C e ≤ 85°C | WARNING |
| Temperatura | < 20°C | INFO |
| RPM | > 1500 (RUNNING) | CRITICAL |
| RPM | < 800 (RUNNING) | WARNING |
| RPM | = 0 (RUNNING) | CRITICAL |
| Estado | → ERROR | CRITICAL |

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
- Pipeline: Gera dado → Avalia no Core → Salva via Repository

| Estado | Temperatura | RPM |
|--------|-------------|-----|
| RUNNING | 60-90°C, ±2/ciclo | 800-1500, ±50/ciclo |
| STOPPED | Desce para 25°C | Tende a 0 |
| MAINTENANCE | ~30°C estável | 0 |
| ERROR | Pico até 95°C | Queda abrupta |

---

## API REST

| Rota | Método | Retorno |
|------|--------|---------|
| `/api/metrics/current` | GET | Última leitura + estado + OEE |
| `/api/metrics/history` | GET | Últimas 120 leituras |
| `/api/alerts` | GET | Últimos 20 alertas |
| `/api/alerts/:id/acknowledge` | PATCH | Marca alerta como reconhecido |
| `/api/health` | GET | Status do servidor + uptime |

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
