"use client";

import { useTheme } from "./ThemeProvider";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label={theme === "dark" ? "Chuyển sang sáng" : "Chuyển sang tối"}
      title={theme === "dark" ? "Chế độ sáng" : "Chế độ tối"}
    >
      <div className="theme-toggle-track">
        <Sun size={14} className="theme-toggle-icon sun" />
        <Moon size={14} className="theme-toggle-icon moon" />
        <div className="theme-toggle-thumb" />
      </div>
    </button>
  );
}
