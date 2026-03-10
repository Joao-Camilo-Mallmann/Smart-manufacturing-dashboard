// ============================================================
// ThemeToggle.tsx — Botão Dark/Light (estilo STW)
// Persiste preferência no localStorage.
// ============================================================

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <button
      id="theme-toggle"
      onClick={() => setDark((d) => !d)}
      className="relative p-2.5 rounded-xl transition-all duration-300 hover:scale-110 bg-white/10 text-white hover:bg-white/20"
      aria-label={dark ? "Mudar para tema claro" : "Mudar para tema escuro"}
      title={dark ? "Tema claro" : "Tema escuro"}
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
