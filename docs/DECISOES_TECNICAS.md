# 📋 Decisões Técnicas — Dashboard de Monitoramento Industrial

Documento auxiliar preparado para **responder dúvidas técnicas da banca avaliadora** sobre as escolhas arquiteturais do projeto.

---

## 1. Por que Short Polling e não WebSocket?

**Escolha: Short Polling (fetch a cada 3 segundos)**

**Justificativa para o MVP:**

- Prazo curto de entrega → polling é mais simples de implementar, testar e debugar.
- Backend permanece **stateless** — sem necessidade de gerenciar conexões WebSocket persistentes, heartbeats, ou reconexão de sockets.
- O desafio técnico pede "atualização simulada em tempo real (intervalo de 2-5 segundos)" — polling atende exatamente este requisito.
- Facilita a avaliação do código: o fluxo request-response é linear e previsível.

**Em produção, WebSocket seria o ideal:**

- **Menor latência**: dados pushados instantaneamente, sem overhead de polling.
- **Menor overhead de rede**: conexão TCP mantida, sem re-handshake a cada requisição.
- **Comunicação bidirecional**: permite enviar comandos do dashboard para a máquina.
- **Escalabilidade**: combinado com Redis pub/sub, suporta milhares de dashboards simultâneos.

**Caminho de migração:**
A arquitetura foi desenhada para migrar facilmente. Basta:

1. Adicionar `socket.io` no backend.
2. Emitir eventos no simulador em vez de apenas persistir.
3. Trocar o `setInterval/fetch` no hook `useMachineData` por um listener WebSocket.

O hook encapsula toda a lógica de comunicação, então a mudança não afeta nenhum componente UI.

---

## 4. Por que Chart.js e não D3 ou Recharts?

**Escolha: Chart.js + react-chartjs-2**

- O desafio técnico sugere "Chart.js, Recharts ou similar".
- `react-chartjs-2` oferece **integração nativa com React** via componentes declarativos.
- Chart.js é leve (~200KB gzipped) e performático para gráficos de linha em tempo real.
- Suporte nativo a **dual Y-axes** (temperatura °C + RPM), tooltips, e animações.
- Configuração via options objeto — sem necessidade de código imperativo como D3.

**Quando usar D3:**

- Visualizações customizadas complexas (treemaps, force graphs, etc.).
- Controle total sobre cada pixel SVG.
- Este projeto não precisa desse nível de customização.

---

## 5. Por que simulação Random Walk?

**Escolha: Variação incremental com limites físicos**

- Gera dados com **variação realista e suave** — não são números aleatórios puros.
- Cada leitura é a leitura anterior ± delta pequeno (ex.: temperatura ±2°C/ciclo).
- Respeita **limites físicos** por estado da máquina:
  - RUNNING: temperatura 55-92°C, RPM 750-1550
  - STOPPED: temperatura desce para ambiente, RPM → 0
  - ERROR: pico térmico, queda abrupta de RPM

**Resultado:** Os gráficos mostram curvas suaves que parecem leituras de sensor real, não ruído branco.

---

## 6. Escalabilidade — O que mudaria em produção?

| Aspecto        | MVP (atual)        | Produção                   |
| -------------- | ------------------ | -------------------------- |
| Comunicação    | Short Polling (3s) | WebSocket (Socket.io)      |
| Banco de dados | SQLite (local)     | PostgreSQL / TimescaleDB   |
| Autenticação   | Nenhuma            | JWT + RBAC                 |
| Mensageria     | Direto no processo | Redis pub/sub ou RabbitMQ  |
| Deploy         | `npm run dev`      | Docker + Kubernetes        |
| Monitoramento  | Logs console       | Prometheus + Grafana       |
| Cache          | Nenhum             | Redis para hot data        |
| Testes         | Jest básico        | E2E com Cypress/Playwright |

---

## 7. Tailwind CSS — Por que Tailwind Puro?

**Escolha: Utility classes sem biblioteca de componentes**

- O desafio pede "uso do Tailwind CSS" explicitamente.
- Construir componentes do zero demonstra **domínio real** do Tailwind.
- Controle total sobre responsividade, dark mode, e animações.
- Sem dependência de Shadcn/UI, Headless UI, ou similar — mais leve e customizável.
- Tailwind v4 (usado neste projeto) suporta configuração via CSS `@theme`.

---

## 8. Arquitetura de Componentes React

**Padrão adotado: Componentes presentacionais + hook de estado**

- **`useMachineData`**: hook único que encapsula toda a comunicação, polling, e gestão de estado.
- **Componentes**: recebem dados via props e não fazem fetch direto → facilita testes e reutilização.
- **Separação clara**: `hooks/` para lógica, `components/` para UI, `utils/` para API.

**Benefícios:**

- Trocar polling por WebSocket altera apenas 1 arquivo (`useMachineData.ts`).
- Cada componente pode ser testado isoladamente com dados mock.
- A arquitetura suporta futuras features (múltiplas máquinas) sem refatoração pesada.
