# 🏭 Dashboard de Monitoramento Industrial

## 📌 Visão Geral

Este projeto é uma solução Full Stack para monitoramento em tempo real de uma linha de produção industrial (focado em uma máquina específica). O sistema fornece visibilidade completa sobre o estado da máquina, métricas de performance e alertas operacionais.

## 🛠️ Stack Tecnológica

- **Frontend:** React 18+ (via Vite), TypeScript (Obrigatório), Tailwind CSS (Puro)
- **Backend:** Node.js, Express, SQLite3 (Driver puro, sem ORM)
- **Gráficos:** Recharts (ou Chart.js)
- **Testes:** Jest + React Testing Library
- **Arquitetura:** Monorepo simples (Pastas `frontend` e `backend` na mesma raiz).

## 🎨 Paleta de Cores (STW)

Paleta extraída do site oficial para guiar o branding da interface.

- **Primárias:**
  - `#1485C8` (**Cor principal**)
  - `#081653` (Azul institucional escuro)
  - `#0C24A8` (Azul secundário)
  - `#005A87` (Azul corporativo)
  - `#0085C8` (Azul claro de apoio)
- **Neutras:**
  - `#222222` (Texto principal)
  - `#D9D9D9` (Bordas e divisórias)
  - `#F1F1F1` (Superfícies claras)
  - `#F6F6F6` (Fundos suaves)
  - `#FFFFFF` (Branco)
  - `#1C1C1C` (Fundo escuro)
- **Gradiente de marca:**
  - `radial-gradient(#0A5A87, #033047)`

## 🏗️ Decisões de Arquitetura e Design

1. **Identidade Visual Customizada (Branding):** O design system e a paleta de cores da aplicação foram desenvolvidos com base na identidade visual real da empresa (extraída do logo e de screenshots de referência). O `tailwind.config.js` foi estendido para garantir que a interface pareça uma extensão natural dos produtos que a empresa já desenvolve.
2. **Backend em Paralelo (O "Coração" do Sistema):** O backend executa duas tarefas simultâneas de forma assíncrona. Enquanto a API REST aguarda requisições, um processo autônomo em background usa `setInterval` para gerar novas leituras via _Random Walk_ e inserir no banco SQLite, garantindo a geração contínua de dados realistas.
3. **Comunicação Front/Back (Tempo Real Simulado):** Utilização de API REST com **Short Polling** para simular as atualizações (intervalo de 2 a 5 segundos), mantendo o backend _stateless_ e facilitando a avaliação do código.
4. **Tratamento de Desconexão:** O frontend possui uma rotina que intercepta falhas de rede/API, ativando imediatamente uma indicação visual de perda de conexão na interface.
5. **Estilização (Tailwind Puro):** Criação de componentes do zero utilizando apenas classes utilitárias do Tailwind CSS, garantindo controle sobre a responsividade (Computador e Tablet).

---

## 🚀 Plano de Execução (Prazo: 16/03)

### ⚙️ Fase 1: Fundação Backend (Motor Paralelo e REST)

- [ ] Inicializar pasta `backend` (`npm init -y`) e instalar dependências (`express`, `sqlite3`, `sqlite`, `typescript`).
- [ ] Configurar conexão e criação automática das tabelas no SQLite (`metric_history` e `alerts`).
- [ ] Desenvolver a simulação autônoma: loop infinito que gera variações dinâmicas de Temperatura, RPM e Eficiência.
- [ ] Ligar a simulação **em paralelo** à inicialização do servidor (`app.listen`).
- [ ] Criar rotas REST vitais:
  - `GET /api/metrics/current` (Devolve a última métrica recém-gerada).
  - `GET /api/metrics/history` (Devolve o array histórico).
  - `GET /api/alerts` (Devolve a lista de avisos simulados).

### 🖥️ Fase 2: Estruturação Frontend (Branding, Layout e Componentes)

- [ ] Inicializar pasta `frontend` com Vite (React + TypeScript).
- [ ] **Mapeamento Visual:** Extrair paleta de cores HEX das imagens/logo da empresa e configurar o arquivo `tailwind.config.js`.
- [ ] Configurar o Tailwind CSS puro no projeto.
- [ ] Adicionar os tipos TypeScript obrigatórios no código (`MachineStatus`, `Alert`, `MetricHistory`).
- [ ] Desenvolver Componentes Reutilizáveis Isolados:
  - `MetricCard` (Temperatura, RPM, Tempo de Operação).
  - `StatusBadge` (Indicador visual de Ligada/Erro).
  - `AlertItem` (Priorização por cores).
- [ ] Montar o Grid Principal seguindo o wireframe obrigatório.

### 🔄 Fase 3: Integração e Dinamismo (O Tempo Real)

- [ ] Criar um Custom Hook no React (`useMachineData`) para encapsular a lógica de comunicação.
- [ ] **Carga Inicial:** Disparar chamada para `/history` na montagem do componente para desenhar os gráficos.
- [ ] **O Polling:** Configurar rotina para bater na rota `/current` a cada 3 segundos, atualizando cards e gráficos.
- [ ] **Tratamento de Queda:** Atrelar o erro da requisição a um estado global, disparando o alerta visual de "Sem Conexão".

### ✨ Fase 4: Diferenciais e Entrega (Polimento Sênior)

- [ ] Implementar Modo Dark/Light funcional (salvando no LocalStorage).
- [ ] Configurar Jest + React Testing Library e escrever testes básicos.
- [ ] Gravar a demonstração em vídeo (máx. 3 minutos).
- [ ] Garantir código executável sem erros e com documentação clara no README.
