# Plano Completo - Dashboard de Monitoramento Industrial

## 1. Objetivo do Projeto

Construir um dashboard industrial full stack para monitoramento em tempo real de uma maquina especifica da linha de producao, com:

- visibilidade operacional imediata,
- historico de metricas,
- sistema de alertas por severidade,
- metricas de eficiencia (OEE),
- interface responsiva e animacoes com Tailwind CSS (puro ou com biblioteca de apoio).

---

## 2. Escopo Funcional (MVP Obrigatorio)

1. Monitoramento em tempo real da maquina:

- estado atual: RUNNING, STOPPED, MAINTENANCE, ERROR,
- metricas atuais: temperatura, rpm, uptime, eficiencia,
- atualizacao de dados a cada 2-5 segundos.

2. Visualizacao de dados:

- cards com valor atual e tendencia,
- grafico historico de temperatura e rpm,
- painel de eficiencia (overall, availability, performance, quality),
- responsividade para desktop, tablet e mobile.

3. Sistema de alertas:

- niveis INFO, WARNING, CRITICAL,
- ordenacao por severidade e timestamp,
- historico consultavel,
- indicacao visual forte para criticos e opcao de feedback sonoro.

4. Confiabilidade visual:

- deteccao de perda de conexao com banner e estado de dados congelados,
- retorno visual de reconexao.

---

## 3. Regras de Negocio (Core do Sistema)

## 3.1 Maquina de Estados

Estados validos:

- RUNNING,
- STOPPED,
- MAINTENANCE,
- ERROR.

Transicoes recomendadas:

- STOPPED -> RUNNING,
- RUNNING -> STOPPED,
- RUNNING -> ERROR,
- ERROR -> MAINTENANCE,
- MAINTENANCE -> STOPPED,
- MAINTENANCE -> RUNNING (somente quando liberada).

Regra:

- evitar transicoes incoerentes (ex.: STOPPED -> ERROR sem evento intermediario).

## 3.2 Regras de Threshold de Operacao

Temperatura:

- normal: <= 80 C,
- warning: > 80 C e <= 85 C,
- critical: > 85 C,
- info de anomalia fria: < 20 C.

RPM:

- normal: 800 a 1500 quando RUNNING,
- warning: < 800 quando RUNNING,
- critical: > 1500,
- critical: = 0 quando RUNNING por janela maior que 1 ciclo.

Uptime:

- cresce somente em RUNNING,
- pausa em STOPPED,
- nao soma durante MAINTENANCE,
- reset opcional por turno (parametrizavel).

## 3.3 Regras de Alertas

Criticidade:

- CRITICAL: risco operacional imediato,
- WARNING: degradacao de performance,
- INFO: evento informativo relevante.

Disparo de alerta:

- ao cruzar threshold,
- ao mudar para ERROR,
- ao aproximar manutencao preventiva,
- ao perder conexao com backend.

Controle de ruido:

- cooldown de alerta repetido por chave de evento (30-120s),
- agregacao de eventos iguais em curto intervalo,
- limite de alertas visiveis por vez no painel (ex.: 20 ultimos).

Priorizacao visual:

- ordenar por severidade (CRITICAL > WARNING > INFO),
- desempate por timestamp mais recente.

## 3.4 Regras de OEE

Formulas:

- availability = tempo em RUNNING / tempo planejado,
- performance = rpm medio real / rpm teorico maximo,
- quality = pecas boas / pecas totais,
- oee = availability x performance x quality.

Regras de exibicao:

- valores em percentual com 1 casa decimal,
- clamp entre 0% e 100%,
- exibir tendencia (subiu/desceu/estavel) em relacao ao ciclo anterior.

## 3.5 Regras de Simulacao de Dados

Modelo:

- random walk com limites fisicos,
- variacao suave a cada ciclo para parecer leitura real.

Comportamento por estado:

- RUNNING: rpm e temperatura variam dentro da faixa operacional,
- STOPPED: rpm tende a 0 e temperatura desce para nivel ambiente,
- MAINTENANCE: rpm 0, temperatura estavel, eventos INFO de manutencao,
- ERROR: queda abrupta de rpm e possibilidade de pico termico.

Persistencia:

- salvar historico em SQLite com timestamp,
- manter janela de exibicao no frontend (ex.: ultimos 60-120 pontos).

---

## 4. Arquitetura Planejada

## 4.1 Monorepo

Estrutura alvo:

- /frontend,
- /backend,
- /docs,
- package.json na raiz com scripts de orquestracao.

## 4.2 Backend

Responsabilidades:

- simular dados continuamente,
- persistir metricas e alertas no SQLite,
- disponibilizar API REST para consumo do dashboard.

Rotas essenciais:

- GET /api/metrics/current,
- GET /api/metrics/history,
- GET /api/alerts,
- GET /api/health.

Rotas recomendadas para evolucao:

- PATCH /api/alerts/:id/acknowledge,
- GET /api/oee/current,
- GET /api/system/status.

## 4.3 Frontend

Responsabilidades:

- consumir API por polling,
- renderizar estado operacional e historico,
- exibir alertas com prioridade,
- sinalizar conectividade,
- oferecer tema dark/light.

Componentes principais:

- HeaderBar,
- StatusBadge,
- ConnectionIndicator,
- MetricCard,
- MetricsChart,
- AlertsPanel,
- EfficiencyPanel,
- ThemeToggle.

---

## 5. Plano de UX e Interface

## 5.1 Diretrizes visuais

- hierarquia clara (status e alertas primeiro),
- alto contraste para estados criticos,
- leitura rapida para ambiente operacional,
- layout responsivo orientado a painel de controle.

## 5.2 Comportamento por estado

- RUNNING: destaque verde e pulsacao discreta de atividade,
- STOPPED: cinza neutro e informacao de maquina parada,
- MAINTENANCE: amarelo/ambar com badge explicativo,
- ERROR: vermelho com animacao de atencao e foco em alertas.

---

## 6. Plano de Animacoes (Tailwind CSS)

## 6.1 Camada Base (Tailwind puro)

Aplicacoes:

- transicoes de cor e opacidade em mudanca de estado,
- hover e focus states em cards e botoes,
- pulse leve em indicador de conexao ativa,
- ping/pulse em alerta CRITICAL.

Padrao:

- duracoes curtas (150ms-400ms) para UI de painel,
- easing suave,
- evitar animacao excessiva em areas de leitura critica.

## 6.2 Camada Intermediaria (tailwindcss-animate)

Aplicacoes:

- entrada escalonada de cards no carregamento,
- slide/fade de banners de conexao,
- animacao de entrada e saida em lista de alertas.

Beneficio:

- velocidade de entrega com classes utilitarias sem criar CSS complexo.

## 6.3 Camada Avancada (opcional - Framer Motion)

Aplicacoes:

- animacao de reorder de alertas por severidade,
- transicao numerica de metricas em tempo real,
- AnimatePresence para remocao elegante de itens.

Uso recomendado:

- apenas onde Tailwind puro nao cobrir uma interacao relevante.

## 6.4 Acessibilidade e performance de animacao

- respeitar prefers-reduced-motion,
- degradar para transicoes minimas em dispositivos lentos,
- limitar animacoes simultaneas em tela.

---

## 7. Plano Tecnico por Fases

## Fase 1 - Fundacao do Monorepo

- criar estrutura frontend/backend,
- configurar scripts de dev/build/test,
- padronizar TypeScript e ambiente.

Criterio de saida:

- projeto sobe com comandos unificados.

## Fase 2 - Backend e Regras de Negocio

- modelar tabelas SQLite,
- implementar simulador paralelo,
- aplicar thresholds e regras de alerta,
- publicar endpoints REST.

Criterio de saida:

- API responde com dados consistentes e historico realista.

## Fase 3 - Frontend Base

- estruturar layout conforme wireframe minimo,
- montar componentes reutilizaveis,
- integrar grafico de metricas e painel OEE,
- configurar tema dark/light.

Criterio de saida:

- dashboard funcional com dados reais da API.

## Fase 4 - Tempo Real, Conexao e Alertas

- implementar polling 2-5s,
- tratar estados de erro e reconexao,
- ordenar e exibir alertas por prioridade,
- acionar efeitos visuais de severidade.

Criterio de saida:

- fluxo de monitoramento continuo e robusto em queda de conexao.

## Fase 5 - Animacoes e Polimento

- aplicar plano de animacoes por camadas,
- revisar responsividade desktop/tablet/mobile,
- calibrar legibilidade e acessibilidade.

Criterio de saida:

- UX fluida sem comprometer leitura operacional.

## Fase 6 - Qualidade e Entrega

- testes unitarios e de componentes,
- checklist final de requisitos,
- documentacao de arquitetura e decisoes,
- preparo de video ou screenshots de demonstracao.

Criterio de saida:

- entrega completa e avaliavel sem ajustes bloqueantes.

---

## 8. Plano de Testes

Backend:

- validacao de formulas de OEE,
- validacao de thresholds e severidade,
- testes de endpoints essenciais,
- consistencia do simulador em multiplos ciclos.

Frontend:

- render de cards, alertas e graficos,
- comportamento de polling,
- comportamento de desconexao/reconexao,
- interacao de tema dark/light.

E2E (desejavel):

- jornada completa de monitoramento,
- validacao de alerta critico em tela,
- verificacao de responsividade basica.

---

## 9. Riscos e Mitigacoes

Risco: excesso de alertas repetidos.
Mitigacao: cooldown, agregacao e limite de lista.

Risco: animacoes pesadas em hardware fraco.
Mitigacao: reduzir animacoes simultaneas e respeitar reduced-motion.

Risco: descompasso entre simulacao e UI.
Mitigacao: contrato de tipos compartilhado e testes de integracao.

Risco: regressao em desconexao.
Mitigacao: testes especificos de fallback e banner de conexao.

---

## 10. Checklist Final de Aprovacao

- TypeScript presente em frontend e backend.
- Tailwind CSS aplicado na interface.
- Monorepo organizado com responsabilidades separadas.
- Atualizacao em tempo real entre 2 e 5 segundos.
- Estados da maquina implementados e visiveis.
- Alertas com niveis INFO, WARNING e CRITICAL.
- Historico de alertas e metricas disponivel.
- OEE, disponibilidade, performance e qualidade calculados.
- Tratamento de erro e perda de conexao funcional.
- Dashboard responsivo em desktop, tablet e mobile.
- Testes basicos configurados e executaveis.
- README/documentacao com instrucoes claras.

---

## 11. Definicoes de Pronto

Pronto por funcionalidade:

- regra de negocio definida,
- comportamento visual definido,
- validacao prevista em teste,
- criterio de aceite objetivo.

Pronto para entrega final:

- todos os itens obrigatorios atendidos,
- sem erro bloqueante,
- demonstracao preparada (video ou screenshots),
- documentacao de decisoes tecnicas atualizada.
