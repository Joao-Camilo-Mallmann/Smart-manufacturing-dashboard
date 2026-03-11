# Smart Manufacturing Dashboard — Agent Rules

> Documento raiz para orientar agentes IA que trabalham neste projeto.
> Consulte os arquivos de regras específicos abaixo.

## Referência do Projeto

- **Blueprint completo**: [PROJECT_BLUEPRINT.md](./docs/PROJECT_BLUEPRINT.md) — Todas as regras, estrutura e objetivos consolidados
- **Decisões Técnicas**: [DECISOES_TECNICAS.md](./docs/DECISOES_TECNICAS.md) — Justificativas arquiteturais para a banca

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
- Sempre ler os dois guias de camada (`docs/rules/agents_front.md` e `docs/rules/agents_back.md`) antes de implementar mudanças
- Sempre manter `agents.md`, `docs/rules/agents_front.md` e `docs/rules/agents_back.md` atualizados com novas regras, padrões e decisões técnicas do projeto
- Escrever regras claras, específicas e acionáveis para orientar o desenvolvimento e garantir consistência em toda a base de código
- Documentar alterações nos arquivos caso necessário para manter a equipe alinhada
