import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type ThemeContextValue = { isDark: boolean; toggleTheme: () => void }

const ThemeContext = createContext<ThemeContextValue | null>(null)
const THEME_KEY = 'casalto_theme'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(() => localStorage.getItem(THEME_KEY) === 'dark')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light')
  }, [isDark])

  const value = { isDark, toggleTheme: () => setIsDark(current => !current) }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const theme = useContext(ThemeContext)
  if (!theme) throw new Error('useTheme debe usarse dentro de ThemeProvider')
  return theme
}
