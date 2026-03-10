// ============================================================
// HeaderBar.tsx — Barra de cabeçalho do dashboard
// Logo, título, toggle de tema, indicador de conexão
// ============================================================

import logoSvg from "@/assets/logo.svg";
import type { MachineState } from "../../types";
import ConnectionIndicator from "../common/ConnectionIndicator";
import StatusBadge from "../common/StatusBadge";
import ThemeToggle from "../common/ThemeToggle";

interface Props {
  machineState: MachineState;
  isConnected: boolean;
}

export default function HeaderBar({ machineState, isConnected }: Props) {
  return (
    <header
      id="header-bar"
      className="sticky top-0 z-50 w-full bg-gradient-header"
    >
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4 flex-wrap">
        {/* Logo e Título */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm flex items-center justify-center">
            <img
              src={logoSvg}
              alt="Logo"
              className="h-6 w-auto brightness-0 invert drop-shadow-sm"
            />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg sm:text-xl leading-tight">
              Dashboard de Monitoramento
            </h1>
            <p className="text-white/70 text-xs sm:text-sm">
              Linha de Produção Industrial
            </p>
          </div>
        </div>

        {/* Status + Controles */}
        <div className="flex items-center gap-3 sm:gap-4">
          <StatusBadge state={machineState} />
          <ConnectionIndicator isConnected={isConnected} />
          <ThemeToggle />
        </div>
      </div>

      {/* Banner de desconexão */}
      {!isConnected && (
        <div className="animate-slide-up w-full py-2 px-4 text-center text-sm font-medium text-white bg-state-error/90">
          ⚠️ Conexão perdida com o servidor. Dados congelados. Tentando
          reconectar...
        </div>
      )}
    </header>
  );
}
