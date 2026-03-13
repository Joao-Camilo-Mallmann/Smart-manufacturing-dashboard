Como rodar o projeto:

Instale dependências:
npm install na raiz.
Rode backend e frontend:
npm run dev (ambos juntos)
ou
cd backend && npm run dev (backend)
cd frontend && npm run dev (frontend)
Acesse:
Frontend: http://localhost:5173
Backend: http://localhost:3001/api/health
Projeto hospedado (deploy):

✔️ Teste online sem instalar nada:
Frontend: https://smart-dashboard-frontend.onrender.com/
Backend: https://smart-dashboard-backend.onrender.com/api/health

❗ Se o backend estiver lento, abra o health check antes do dashboard para garantir dados.

Cara do sistema:

• Dashboard limpo e intuitivo
• Cards de métricas: temperatura, RPM, tempo, eficiência
• Gráfico de histórico (temperatura/RPM)
• Painel de eficiência (OEE)
• Lista de alertas por severidade
• Dark mode e responsivo

Como funciona o básico:

• Backend simula dados da máquina a cada 3 segundos
• Frontend atualiza métricas em tempo real (polling)
• Alertas automáticos conforme limites
• Usuário acompanha tudo visualmente, sem complicação

Testes e documentação visual:

• Testes automatizados com Jest (backend e frontend)
• Testes de componentes com React Testing Library
• Storybook para documentação visual dos componentes
• Fácil de visualizar e validar cada parte da interface
