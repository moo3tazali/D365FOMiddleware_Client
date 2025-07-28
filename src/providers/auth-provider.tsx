import { createContext, useEffect, useState } from 'react';
import { createStore, type StoreApi } from 'zustand';

import type { LoginPayload } from '@/services/auth';
import { useServices } from '@/hooks/use-services';

export type TAuth = {
  isAuthenticated: boolean;
  isLoginModalOpen: boolean;
  login: (data: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<StoreApi<TAuth> | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { authService } = useServices();

  const [store] = useState(() =>
    createStore<TAuth>((setState) => ({
      isAuthenticated: authService.isAuthenticated(),
      isLoginModalOpen: false,
      login: async (data: LoginPayload) => {
        await authService.login(data);
        setState((state) => {
          if (state.isLoginModalOpen) {
            return {
              isLoginModalOpen: false,
              isAuthenticated: true,
            };
          }
          return { isAuthenticated: true };
        });
      },
      logout: async () => {
        await authService.logout();
        setState({
          isAuthenticated: false,
        });
      },
    }))
  );

  useEffect(() => {
    // Handle authentication required events
    const handleAuthRequired = () => {
      store.setState({
        isAuthenticated: false,
        isLoginModalOpen: true,
      });
    };

    // Listen for auth required events
    window.addEventListener('auth:required', handleAuthRequired);

    return () => {
      window.removeEventListener('auth:required', handleAuthRequired);
    };
  }, [store, authService]);

  return <AuthContext.Provider value={store}>{children}</AuthContext.Provider>;
};

export { AuthProvider, AuthContext };
