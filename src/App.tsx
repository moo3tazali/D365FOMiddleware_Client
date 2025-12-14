import { RouterProvider } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';

import { router } from './router';
import { AppProviders } from '@/providers';
import { useServices } from './hooks/use-services';
import { useAuth } from './hooks/use-auth';

export function App() {
  return (
    <AppProviders>
      <InnerApp />
    </AppProviders>
  );
}

function InnerApp() {
  const queryClient = useQueryClient();
  const services = useServices();
  const auth = useAuth();

  return (
    <RouterProvider router={router} context={{ queryClient, services, auth }} />
  );
}
