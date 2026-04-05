import { AppQueryClientProvider } from './providers/query-client';
import { AppRouterProvider } from './providers/router';
import { AppThemeProvider } from './providers/theme';

export function App() {
  return (
    <AppThemeProvider>
      <AppQueryClientProvider>
        <AppRouterProvider />
      </AppQueryClientProvider>
    </AppThemeProvider>
  );
}
