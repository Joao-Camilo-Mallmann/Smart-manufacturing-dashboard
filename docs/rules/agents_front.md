# Smart Manufacturing Dashboard — Project Rules

## Project Overview
Dashboard de monitoramento industrial em tempo real, inspirado no design visual da **STW** ([stw.com.br](https://stw.com.br/)). Monitora métricas de máquinas (temperatura, RPM, uptime, eficiência) via WebSocket, com cálculo de OEE e sistema de alertas.

## Tech Stack
| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React | 19.x |
| Build | Vite | 7.x |
| Styling | Tailwind CSS | 4.x (`@theme` syntax) |
| Charts | Chart.js + react-chartjs-2 | 4.x / 5.x |
| Icons | Lucide React | latest |
| Language | TypeScript | ~5.9 |
| Backend | Node.js + Express + WebSocket | — |

## Project Structure
```
frontend/
├── src/
│   ├── App.tsx                    # Root component (dashboard layout)
│   ├── main.tsx                   # Entry point
│   ├── assets/
│   │   ├── index.css              # ⭐ Design system tokens (@theme)
│   │   └── logo.svg               # STW logo
│   ├── components/
│   │   ├── common/                # Reusable components
│   │   │   ├── ConnectionIndicator.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   └── ThemeToggle.tsx
│   │   ├── dashboard/             # Dashboard-specific panels
│   │   │   ├── AlertsPanel.tsx
│   │   │   ├── EfficiencyPanel.tsx
│   │   │   ├── MetricCard.tsx
│   │   │   └── MetricsChart.tsx
│   │   └── layout/
│   │       └── HeaderBar.tsx
│   ├── hooks/
│   │   └── useMachineData.ts      # WebSocket hook
│   ├── plugins/
│   │   └── axios.ts
│   ├── services/                  # API service layer
│   ├── types/                     # TypeScript interfaces
│   └── utils/
│       └── formatters.ts
backend/
├── src/
│   └── server.ts                  # Express + WebSocket server
```

## Design System Rules

### Color Palette (STW Brand)
All color tokens live in `frontend/src/assets/index.css` inside the `@theme` block.

| Token | Hex | Usage |
|-------|-----|-------|
| `stw-primary` | `#00AEEF` | Accent blue — icons, badges, progress bars, links |
| `stw-dark` | `#00334E` | Deep navy — headings, text emphasis |
| `stw-secondary` | `#005A87` | Mid-blue — secondary interactive elements |
| `stw-corporate` | `#004C74` | Corporate blue — header gradient mid-point |
| `stw-light` | `#0085C8` | Light blue — hover states, highlights |
| `stw-navy` | `#001A2E` | Deepest navy — dark mode backgrounds |

### Machine State Colors
| State | Hex | Class |
|-------|-----|-------|
| Running | `#22c55e` | `state-running` |
| Stopped | `#94a3b8` | `state-stopped` |
| Maintenance | `#f59e0b` | `state-maintenance` |
| Error | `#ef4444` | `state-error` |

### Typography
- **Font**: Montserrat (primary), Inter (fallback)
- **Labels**: `.label-stw` — uppercase, `letter-spacing: 0.1em`, `font-size: 0.7rem`, `font-weight: 600`
- **Headings**: `font-bold` or `font-extrabold`, `tracking-tight`

### Card Pattern
Use the `.card-stw` CSS class for all dashboard panels:
- Border: `1px solid var(--color-border-card)`
- Border-radius: `var(--radius-card)` = `1.5rem`
- Shadow: Subtle on rest, deeper on hover
- Hover: `translateY(-2px)` with smooth transition

### Header
- Sticky, full-width
- Uses `.bg-gradient-header` (auto light/dark)
- STW logo + title on left, status/controls on right

## Coding Conventions

### Imports
- Always use `@/` path aliases (configured in `tsconfig.app.json` and `vite.config.ts`)
- Example: `import MetricCard from "@/components/dashboard/MetricCard"`

### Components
- One component per file
- File name matches component name (PascalCase)
- Use `interface Props` for prop types
- Export as `export default function ComponentName`

### Styling
- Use Tailwind utility classes in JSX
- Custom CSS classes go in `index.css` with `.card-stw`, `.label-stw` naming
- Dark mode: use `.dark` class toggled on `<html>`
- No inline styles except for dynamic values (e.g., Chart.js colors, percentage widths)

### Language
- UI text is in **Portuguese (pt-BR)**
- Code comments in Portuguese
- Variable/function names in English

### State Management
- No global state library — local state with React hooks
- WebSocket data via custom `useMachineData` hook

### Dark Mode
- Toggled via `ThemeToggle` component
- Persisted in `localStorage` key `"theme"`
- Applied by toggling `dark` class on `document.documentElement`
- CSS tokens in `.dark {}` block override light mode defaults

## Dev Commands
```bash
# frontend only
cd frontend && npm run dev

# full stack (from root)
npm run dev
```
