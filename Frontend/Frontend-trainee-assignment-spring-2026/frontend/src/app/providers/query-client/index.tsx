import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

type AppQueryClientProviderProps = {
  children: ReactNode;
};

export function AppQueryClientProvider({ children }: AppQueryClientProviderProps) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
