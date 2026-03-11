// ============================================================
// ConnectionIndicator.tsx — Indicador de status de conexão
// Verde pulsando = conectado, vermelho pulsando = desconectado
// ============================================================

import { Wifi, WifiOff } from "lucide-react";

interface Props {
  isConnected: boolean;
}

export default function ConnectionIndicator({ isConnected }: Props) {
  return (
    <div
      id="connection-indicator"
      className="flex items-center gap-2"
      title={
        isConnected ? "Conectado ao servidor" : "Sem conexão com o servidor"
      }
    >
      <div className="relative flex items-center justify-center">
        {/* Ping animation ring */}
        <span
          className={`absolute inline-flex h-4 w-4 rounded-full opacity-75 ${
            isConnected
              ? "bg-state-running animate-ping-critical"
              : "bg-state-error animate-ping-critical"
          }`}
          style={{ animationDuration: isConnected ? "3s" : "1s" }}
        />
        {/* Solid dot */}
        <span
          className={`relative inline-flex h-3 w-3 mx-1 rounded-full ${
            isConnected ? "bg-state-running" : "bg-state-error"
          }`}
        />
      </div>
      {isConnected ? (
        <Wifi size={16} className="text-state-running" />
      ) : (
        <WifiOff size={16} className="text-state-error" />
      )}
    </div>
  );
}
