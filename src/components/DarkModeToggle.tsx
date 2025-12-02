import { useDarkMode } from '../contexts/DarkModeContext';

export const DarkModeToggle = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <button
      type="button"
      className="dark-mode-toggle"
      onClick={toggleDarkMode}
      aria-label={isDarkMode ? 'Desativar modo escuro' : 'Ativar modo escuro'}
      title={isDarkMode ? 'Desativar modo escuro' : 'Ativar modo escuro'}
    >
      <span className="dark-mode-toggle-icon">
        {isDarkMode ? '🌙' : '☀️'}
      </span>
    </button>
  );
};

