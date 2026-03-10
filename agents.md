# Smart Manufacturing Dashboard — Agent Rules

> Documento raiz para orientar agentes IA que trabalham neste projeto.
> Consulte os arquivos de regras específicos abaixo.

## Referência do Projeto

- **Blueprint completo**: [PROJECT_BLUEPRINT.md](./docs/PROJECT_BLUEPRINT.md) — Todas as regras, estrutura e decisões consolidadas

## Regras por Camada

- **Frontend**: [agents_front.md](./docs/rules/agents_front.md) — Design system STW, componentes, convenções React
- **Backend**: [agents_back.md](./docs/rules/agents_back.md) — Arquitetura em camadas, schema SQLite, regras de negócio

## Regras Gerais

- TypeScript estrito em todo o projeto
- Nomes de variáveis em inglês, textos da UI em português (pt-BR)
- Comentários de código em português
- Imports com alias `@/` no frontend
- Todas as cores vivem em `frontend/src/assets/index.css` (bloco `@theme`)
- Nunca hardcodar hex em componentes (exceto valores dinâmicos de Chart.js)
- Dark mode via classe `.dark` no `<html>`, tokens em `.dark {}` no CSS
- Componentes são "burros" — lógica de dados fica em hooks
- Core do backend é puro — nunca importa dependências de infra
