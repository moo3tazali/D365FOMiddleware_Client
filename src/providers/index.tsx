import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { CookiesProvider } from 'react-cookie';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { ServicesProvider } from './services-provider';
import { services } from '@/services';
import { ThemeProvider } from './theme-provider';

// app services
const queryClient = new QueryClient();

type Props = {
  children: React.ReactNode;
};

export const AppProviders = ({ children }: Props) => {
  return (
    <ServicesProvider services={services}>
      <CookiesProvider defaultSetOptions={{ path: '/' }}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            {children}
            <Toaster
              toastOptions={{
                className: '!text-foreground !bg-background',
              }}
            />
            <ReactQueryDevtools />
          </ThemeProvider>
        </QueryClientProvider>
      </CookiesProvider>
    </ServicesProvider>
  );
};
