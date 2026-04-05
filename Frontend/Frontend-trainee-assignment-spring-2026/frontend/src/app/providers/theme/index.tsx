import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { ReactNode } from 'react';

const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#111827',
    },
    secondary: {
      main: '#2563eb',
    },
  },
});

type AppThemeProviderProps = {
  children: ReactNode;
};

export function AppThemeProvider({ children }: AppThemeProviderProps) {
  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
