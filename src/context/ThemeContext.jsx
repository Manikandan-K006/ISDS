import { createContext, useContext, useState, useLayoutEffect } from 'react';

const ThemeContext = createContext(null);

const getInitialTheme = () => {
  try {
    return localStorage.getItem('isds_theme') || 'dark';
  } catch {
    return 'dark';
  }
};

const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  try {
    localStorage.setItem('isds_theme', theme);
  } catch {
    // localStorage may be unavailable
  }
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme);

  useLayoutEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) return { theme: 'dark', toggleTheme: () => {} };
  return ctx;
};
