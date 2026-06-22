import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { CookiesProvider } from 'react-cookie';

import { ServicesProvider } from './services-provider';
import { AuthProvider } from './auth-provider';
import { services } from '@/services';
import { ThemeProvider } from './theme-provider';

// 🔧 Configure the main query client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // ✅ Data is considered fresh for 5 minutes → avoids refetching on hover/focus
      gcTime: 1000 * 60 * 30, // 🕒 Unused queries stay in cache for 30 minutes before garbage collection
      refetchOnWindowFocus: false, // 🚫 Don't refetch data just by focusing the window/tab
      retry: 1, // 🔁 Retry failed requests once (instead of 3 times by default)
    },
    mutations: {
      retry: 0, // (Optional) Don’t retry mutations by default
    },
  },
});

type Props = {
  children: React.ReactNode;
};

export const AppProviders = ({ children }: Props) => {
  return (
    <ServicesProvider services={services}>
      <CookiesProvider defaultSetOptions={{ path: '/' }}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ThemeProvider>
              {children}
              <Toaster
                toastOptions={{
                  className: '!text-foreground !bg-background capitalize',
                }}
              />
            </ThemeProvider>
          </AuthProvider>
        </QueryClientProvider>
      </CookiesProvider>
    </ServicesProvider>
  );
};
