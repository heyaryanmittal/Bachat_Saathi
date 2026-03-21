import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';
function ThemeToggle() {
  const { darkMode, toggleDarkMode } = useTheme();
  return (
    <button
      onClick={toggleDarkMode}
      className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 group"
    >
      {darkMode ? (
        <Sun className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
      ) : (
        <Moon className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
      )}
    </button>
  );
}
export default ThemeToggle;
