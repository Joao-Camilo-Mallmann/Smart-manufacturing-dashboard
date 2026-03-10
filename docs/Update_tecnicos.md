🏗️ Estrutura de Pastas do Frontend (Clean React)
Plaintext

frontend/src/
├── assets/          # Logo da empresa e imagens estáticas
├── components/      # Componentes de UI (Burros/Presentational)
│   ├── common/      # Botões, Badges, Inputs genéricos
│   ├── layout/      # Header, Sidebar, Container do Grid
│   └── dashboard/   # MetricCard, AlertsPanel, MetricsChart
├── config/          # URL da API e constantes de cores do branding
├── hooks/           # A "Inteligência" (Smart Hooks)
│   ├── useMachineData.ts # Lógica de Polling e estado das métricas
│   └── useTheme.ts       # Lógica do Dark Mode e LocalStorage
├── services/        # Camada de Infraestrutura
│   └── api.ts       # Configuração do Fetch/Axios (BaseURL, Interceptors)
├── types/           # Interfaces TypeScript (Espelho do Backend)
├── utils/           # Funções utilitárias e formatadores
│   ├── formatters.ts    # Formatar RPM (1.200) e Temp (85°C)
│   └── calculations.ts  # Lógica de tendência (▲/▼)
├── App.tsx          # Orquestrador da visualização (Grid)
└── main.tsx         # Ponto de entrada

🛠️ Por que organizar assim? (As Regras de Ouro)
1. Separação entre UI e Lógica (Smart vs. Dumb Components)

    O Problema: Colocar o fetch e o setInterval dentro do componente MetricCard.tsx. Se você precisar usar o card em outra tela, ele vai tentar buscar dados sozinho.

    A Solução: O componente deve ser "burro" — ele só recebe o valor e exibe. Toda a "inteligência" de buscar dados e tratar erros de conexão fica no Custom Hook (useMachineData).

2. Camada de Utils (OEE e Formatadores)

Assim como no backend, a lógica matemática deve ser isolada. Se você precisa mostrar a eficiência na tela, use uma função pura em utils/calculations.ts.
OEE=Disponibilidade×Performance×Qualidade

Isso facilita muito os testes unitários no Front.
3. Centralização de Tipos

A pasta types/ deve conter as interfaces que você discutiu no backend. Se mudar uma regra no "Beck", você muda aqui no "Frade" e o TypeScript já vai te avisar onde o código quebrou.
🚀 Checklist de Implementação no Frontend
Pasta	O que deve estar lá dentro?
components/	Apenas código JSX/TSX e CSS do Tailwind. Zero lógica de API.
hooks/	Toda a lógica de useEffect, useState e chamadas ao backend.
services/	Apenas a configuração bruta do fetch. Nada de lógica de negócio aqui.
utils/	Funções que transformam dados (ex: converter segundos para "5h 23m").




🏭 Dashboard Industrial — Arquitetura Sênior (Plano Final)
📌 Visão Geral

Sistema Full Stack para monitoramento de ativos industriais, focado em alta coesão e baixo acoplamento. O backend não é apenas uma API, mas um motor de regras isolado que simula e avalia uma linha de produção.
🏗️ Estrutura do Monorepo (Organização por Camadas)
Plaintext

FULLSTACK_CHALLENGER/
├── backend/
│   ├── src/
│   │   ├── config/          # [NOVO] Thresholds e constantes (A "Lei" do sistema)
│   │   ├── core/            # [NOVO] Lógica Pura (OEE, Rules Engine, State Policy)
│   │   ├── database/        # Conexão e Schema (better-sqlite3)
│   │   ├── repositories/    # Camada de Dados (Queries SQL isoladas)
│   │   ├── services/        # Orquestração (Une o Core com o Banco)
│   │   ├── controllers/     # Interface REST (Express)
│   │   └── index.ts         # Bootstrapping e Simulador
├── frontend/                # React + Vite + Tailwind (O "Frade")
└── package.json             # Maestro (concurrently)

🏗️ Decisões Técnicas de Arquitetura
1. Camada de Regras (Core) — Independente e Testável

A lógica de negócio foi isolada da infraestrutura. O sistema de cálculo de OEE e o Motor de Regras não sabem da existência do banco de dados ou da API. Isso permite testes unitários precisos e trocas rápidas de política industrial.
2. Máquina de Estados e Políticas de Transição

A máquina possui uma "State Policy" que valida movimentos operacionais, impedindo transições ilógicas (ex: STOPPED -> ERROR sem passar por RUNNING).
3. Motor de Regras (Rules Engine)

As métricas geradas pelo simulador passam por um "Juiz" antes de serem salvas. Este componente avalia os limites (Thresholds) e decide, de forma isolada, se um alerta de nível INFO, WARNING ou CRITICAL deve ser disparado.
🚀 Plano de Execução (Fases Ajustadas)
⚙️ Fase 1: Backend — O Coração Industrial (Regras e Dados)

    Definição de Configurações: Criar o config/thresholds.ts com os limites de temperatura, RPM e metas de OEE.

    Lógica Pura (Core):

        oee-calculator.ts: Implementar a fórmula OEE=Disponibilidade×Performance×Qualidade.

        rules-engine.ts: Criar a função que recebe métricas e cospe alertas baseados nos thresholds.

        state-policy.ts: Definir as regras de transição de estado da prensa.

    Repositórios: Criar métodos de acesso ao banco (SQLite puro) isolados, evitando SQL espalhado pelo código.

    Simulador: O motor agora orquestra essas camadas: gera o dado → avalia no Core → salva via Repositório.

🖥️ Fase 2: Frontend — Interface de Alta Fidelidade (Branding)

    Design System: Mapear as cores da empresa no tailwind.config.js.

    Dark Mode Pro: Implementar o toggle com persistência no localStorage.

    Componentes de Monitoramento:

        MetricCard: Com indicação de tendência (▲/▼) e animações de alerta (pulse).

        MetricsChart: Gráfico de histórico consumindo a API REST.

        AlertsPanel: Lista priorizada por severidade.

🔄 Fase 3: Integração e Resiliência

    Custom Hook useMachineData: Lógica de Short Polling a cada 3 segundos.

    Tratamento de Desconexão: Indicação visual clara caso o backend pare de responder (banner de erro e congelamento de métricas).

✨ Fase 4: Entrega e Diferenciais

    Vídeo de Demonstração: Mostrar a máquina trocando de estado e os alertas surgindo ao vivo.

    Documentação Sênior: README detalhando a separação das camadas do backend e as fórmulas utilizadas.