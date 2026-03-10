// ============================================================
// ThemeToggle.tsx — Botão de alternância Dark/Light mode
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
      className="relative p-2 rounded-lg transition-all duration-300 hover:scale-110"
      style={{ background: "var(--bg-hover)", color: "var(--text-primary)" }}
      aria-label={dark ? "Mudar para tema claro" : "Mudar para tema escuro"}
      title={dark ? "Tema claro" : "Tema escuro"}
    >
      {dark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
