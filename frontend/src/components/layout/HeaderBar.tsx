// ============================================================
// HeaderBar.tsx — Barra de cabeçalho do dashboard (estilo STW)
// Header com gradiente navy, logo STW e controles
// ============================================================

import logoSvg from "@/assets/logo.svg";
import type { MachineState } from "@/types";
import ConnectionIndicator from "@/components/common/ConnectionIndicator";
import StatusBadge from "@/components/common/StatusBadge";
import ThemeToggle from "@/components/common/ThemeToggle";

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
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 py-4 flex items-center justify-between gap-4 flex-wrap">
        {/* Logo e Título */}
        <div className="flex items-center gap-4">
          <img
            src={logoSvg}
            alt="STW Logo"
            className="h-7 sm:h-8 w-auto brightness-0 invert drop-shadow-md"
          />
          <div className="hidden sm:block h-8 w-px bg-white/20" />
          <div>
            <h1 className="text-white font-bold text-base sm:text-lg tracking-tight leading-tight">
              Dashboard de Monitoramento
            </h1>
            <p className="text-white/60 text-[0.65rem] uppercase tracking-widest font-medium">
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
        <div className="animate-slide-up w-full py-2.5 px-4 text-center text-sm font-semibold text-white bg-state-error/90 backdrop-blur-sm">
          ⚠️ Conexão perdida com o servidor — Dados congelados — Tentando
          reconectar...
        </div>
      )}
    </header>
  );
}
