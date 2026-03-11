# Frontend Agent Rules — Dashboard de Monitoramento Industrial

## Escopo

Este arquivo guia agentes IA ao trabalhar no diretório `frontend/`. Todas as regras abaixo devem ser seguidas sem exceção.

---

## Estrutura de Pastas

```
frontend/src/
├── App.tsx                    # Orquestrador do layout (grid principal)
├── main.tsx                   # Ponto de entrada
├── assets/
│   ├── index.css              # ⭐ Design system tokens (@theme + .dark)
│   └── logo.svg               # Logo STW
├── components/
│   ├── common/                # Componentes reutilizáveis (sem lógica de API)
│   │   ├── ConnectionIndicator.tsx
│   │   ├── StatusBadge.tsx
│   │   └── ThemeToggle.tsx
│   ├── dashboard/             # Painéis do dashboard
│   │   ├── AlertsPanel.tsx
│   │   ├── EfficiencyPanel.tsx
│   │   ├── MetricCard.tsx
│   │   └── MetricsChart.tsx
│   └── layout/
│       └── HeaderBar.tsx
├── hooks/
│   └── useMachineData.ts      # Hook de polling/WebSocket
├── plugins/
│   └── axios.ts
├── services/                  # Camada de fetch/API
├── types/                     # Interfaces TypeScript (espelho do backend)
└── utils/
    └── formatters.ts          # Formatação de valores
```

---

## Regras de Arquitetura

### Smart vs. Dumb (OBRIGATÓRIO)

| Diretório     | O QUE pode ter                                         | O QUE NÃO pode ter                                  |
| ------------- | ------------------------------------------------------ | --------------------------------------------------- |
| `components/` | JSX, Tailwind, props, eventos                          | fetch, useEffect com API, useState de dados remotos |
| `hooks/`      | useEffect, useState, chamadas à API, lógica de polling | JSX, renderização                                   |
| `services/`   | Configuração de fetch/axios, base URL                  | Lógica de negócio                                   |
| `utils/`      | Funções puras de formatação/cálculo                    | Chamadas de API, side effects                       |
| `types/`      | Interfaces e type aliases                              | Implementação                                       |

### Princípio Central

Componentes são **"burros"** — recebem dados via props e apenas exibem. Toda a inteligência (polling, tratamento de erro, transformação) fica em `hooks/`.

---

## Design System

### Tokens de Cor (em `index.css`, bloco `@theme`)

**Todas as cores do projeto vivem em `index.css`.** Nunca hardcodar hex em componentes, exceto valores dinâmicos de Chart.js.

#### Paleta STW

| Token                   | Hex       | Uso                                         |
| ----------------------- | --------- | ------------------------------------------- |
| `--color-stw-primary`   | `#00AEEF` | Accent blue — ícones, badges, barras, links |
| `--color-stw-dark`      | `#00334E` | Navy profundo — headings (light mode)       |
| `--color-stw-secondary` | `#005A87` | Mid-blue — interações secundárias           |
| `--color-stw-corporate` | `#004C74` | Corporate — gradiente header, bordas dark   |
| `--color-stw-light`     | `#0085C8` | Azul claro — hovers, destaques              |
| `--color-stw-navy`      | `#001A2E` | Navy profundo — fundo dark mode             |

#### Tokens Semânticos (Light Mode)

| Token                       | Uso                      |
| --------------------------- | ------------------------ |
| `--color-surface-primary`   | Fundo da página          |
| `--color-surface`           | Fundo dos cards          |
| `--color-surface-hover`     | Hover de elementos       |
| `--color-content`           | Texto principal          |
| `--color-content-secondary` | Subtítulos               |
| `--color-content-muted`     | Texto terciário / labels |
| `--color-border-card`       | Borda dos cards          |

#### Dark Mode (`.dark {}` sobrescreve os tokens)

| Token               | Valor Dark                             |
| ------------------- | -------------------------------------- |
| `surface-primary`   | `var(--color-stw-navy)` (#001A2E)      |
| `surface`           | `#00263E`                              |
| `surface-hover`     | `var(--color-stw-dark)` (#00334E)      |
| `content`           | `#FFFFFF`                              |
| `content-secondary` | `#BBD2E8`                              |
| `content-muted`     | `#8AAAC9`                              |
| `border-card`       | `var(--color-stw-corporate)` (#004C74) |

#### Cores de Estado

| Estado      | Hex       | Classe Tailwind                                  |
| ----------- | --------- | ------------------------------------------------ |
| Running     | `#22c55e` | `text-state-running`, `bg-state-running`         |
| Stopped     | `#94a3b8` | `text-state-stopped`, `bg-state-stopped`         |
| Maintenance | `#f59e0b` | `text-state-maintenance`, `bg-state-maintenance` |
| Error       | `#ef4444` | `text-state-error`, `bg-state-error`             |

---

## Classes CSS Customizadas

Definidas em `index.css`. SEMPRE preferir estas classes ao invés de recriar o estilo:

| Classe                | Propósito                                                 |
| --------------------- | --------------------------------------------------------- |
| `.card-stw`           | Card completo (borda, sombra, raio, hover com translateY) |
| `.label-stw`          | Label uppercase com tracking e tamanho padronizado        |
| `.bg-gradient-header` | Gradiente STW para o header (adapta light/dark)           |

---

## Componentes — Responsabilidades

| Componente            | Responsabilidade                                              |
| --------------------- | ------------------------------------------------------------- |
| `HeaderBar`           | Logo STW, título, toggle dark/light, indicador de conexão     |
| `StatusBadge`         | Estado (RUNNING/STOPPED/MAINTENANCE/ERROR) com cor e animação |
| `ConnectionIndicator` | Bolinha verde/vermelha + banner de conexão                    |
| `MetricCard`          | Card com valor, tendência (↑↓→), cor por threshold            |
| `MetricsChart`        | Gráfico Chart.js com linhas de temperatura e RPM              |
| `AlertsPanel`         | Lista de alertas por severidade, com cores e timestamp        |
| `EfficiencyPanel`     | Barras de OEE, disponibilidade, performance, qualidade        |
| `ThemeToggle`         | Botão sol/lua com persistência em localStorage                |

---

## Convenções de Código

### Imports

- **SEMPRE** usar alias `@/` (configurado em `tsconfig.app.json` e `vite.config.ts`)
- Exemplo: `import MetricCard from "@/components/dashboard/MetricCard"`

### Componentes

- Um componente por arquivo
- Nome do arquivo = nome do componente (PascalCase)
- Props tipadas com `interface Props`
- Export: `export default function ComponentName`

### Estilização

- Usar classes utilitárias Tailwind no JSX
- Classes CSS customizadas vão em `index.css` com prefixo STW
- `dark:` prefix do Tailwind NÃO é usado — usamos `.dark {}` no CSS
- Inline styles APENAS para valores dinâmicos (cores Chart.js, larguras %)

### Textos, Valores e Formatadores (`utils/formatters.ts`)

- UI text em **português (pt-BR)**
- Comentários de código em **português**
- Nomes de variáveis/funções em **inglês**
- **Sempre utilize os formatadores puros de `frontend/src/utils/formatters.ts`** para exibição de variáveis na UI:
  - `formatUptime(hours: number)`: Formata horas decimais em "Xh Ym" (ex: "5h 23m").
  - `formatTimestamp(ts: string)`: Converte data/hora ISO para o horário local brasileiro (ex: "21:35:33").
  - `timeAgo(ts: string)`: Retorna string de tempo relativo (ex: "5s atrás", "5min atrás", "5h atrás").
  - `formatMetric(value: number, decimals = 1)`: Retorna o número em string com casas decimais fixas.
- Formatar RPM como inteiro.
- Formatar temperatura com 1 decimal + °C (ex: 56.4 °C).
- Formatar OEE com 1 decimal + % (ex: 73.4%).

### Dark Mode

- Toggle via `ThemeToggle` component
- Persistido em `localStorage("theme")`
- Classe `dark` aplicada no `<html>`
- Tokens em `.dark {}` sobrescrevem os light defaults
- Textos principais: usar `text-content` (adapta automaticamente)

### Estado

- Sem biblioteca de state management
- Custom hook `useMachineData` gerencia todo o estado de polling
- Reconexão automática ao voltar online

---

## Layout Responsivo

- **Desktop (≥1024px)**: Grid de 4 colunas para cards + painéis lado a lado
- **Tablet (768-1023px)**: Grid de 2 colunas + painéis empilhados
- **Mobile (<768px)**: Coluna única

---

## Animações

| Nome                    | Uso                    | Regra                |
| ----------------------- | ---------------------- | -------------------- |
| `animate-fade-in`       | Entrada de cards       | Suave, 0.3s          |
| `animate-pulse-slow`    | Indicador de atividade | 3s, infinite         |
| `animate-ping-critical` | Alerta CRITICAL        | Chama atenção visual |
| `animate-slide-up`      | Banners                | Entrada de baixo     |

**Regras gerais:**

- Durações curtas (150-400ms)
- Respeitar `prefers-reduced-motion`
- Não animar áreas de leitura crítica de dados

---

## Storybook (OBRIGATÓRIO)

### Objetivo

Storybook é a fonte de documentação visual dos componentes de `frontend/src/components/`.
Sempre que um componente novo for criado (ou alterado de forma relevante), sua story deve ser criada/atualizada no mesmo PR.

### Estrutura e Descoberta de Stories

- As stories vivem em `frontend/src/stories/`
- Organização por domínio (espelhando `components/`):
  - `stories/common/`
  - `stories/dashboard/`
  - `stories/layout/`
- Nome de arquivo obrigatório: `ComponentName.stories.tsx`
- O Storybook carrega stories via `frontend/.storybook/main.ts` com o glob:
  - `../src/stories/**/*.stories.@(ts|tsx)`

### Regras de Implementação das Stories

- Não duplicar código de componente dentro da story.
- Importar o componente real usando alias `@/`.
- Escrever stories em TypeScript com `Meta` e `StoryObj`.
- Manter stories focadas em apresentação (sem chamadas de API reais).
- Simular estados via `args` (ex.: loading, erro, vazio, sucesso).
- Textos e rótulos da UI em pt-BR, seguindo o padrão do projeto.
- Preservar tokens e classes do design system (`index.css`), sem hardcode de hex.

### Template Recomendado

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import ComponentName from "@/components/path/ComponentName";

const meta = {
  title: "Categoria/ComponentName",
  component: ComponentName,
} satisfies Meta<typeof ComponentName>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // props de exemplo
  },
};
```

### Checklist de Revisão

- Existe story para o componente alterado?
- A story está em `src/stories/` no domínio correto?
- O componente foi importado via alias `@/`?
- Foram cobertos os estados principais de UI?
- A aparência respeita os tokens STW em light/dark?

---

## Comandos

```bash
cd frontend && npm run dev              # Vite + Storybook em paralelo
cd frontend && npm run storybook        # Storybook isolado (porta 6006)
cd frontend && npm run build-storybook  # build estático do Storybook
cd frontend && npm run build            # build de produção
```
