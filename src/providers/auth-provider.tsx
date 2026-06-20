import { createContext, useEffect, useState } from 'react';
import { createStore, type StoreApi } from 'zustand';

import type { LoginPayload } from '@/services/api/auth';
import { useServices } from '@/hooks/use-services';
import type { TUser } from '@/interfaces/user';

export type TAuth = {
  isAuthenticated: boolean;
  isLoginModalOpen: boolean;
  user: TUser | null;
  login: (data: LoginPayload) => Promise<void>;
  startMicrosoftLogin: (returnPath?: string) => void;
  exchangeMicrosoftCode: (code: string) => Promise<TUser>;
  refreshAccessStatus: () => Promise<TUser | null>;
  logout: () => Promise<void>;
  closeLoginModal: () => void;
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
      user: authService.getCurrentUser(),
      login: async (data: LoginPayload) => {
        const user = await authService.login(data);
        setState({ isAuthenticated: true, user });
      },
      startMicrosoftLogin: (returnPath = '/') => {
        authService.startMicrosoftLogin(returnPath);
      },
      exchangeMicrosoftCode: async (code: string) => {
        const user = await authService.exchangeMicrosoftCode(code);
        setState({ isAuthenticated: true, user });
        return user;
      },
      refreshAccessStatus: async () => {
        await authService.getAccessStatus();
        await authService.refreshToken();
        const user = authService.getCurrentUser();
        setState({ isAuthenticated: Boolean(user), user });
        return user;
      },
      logout: async () => {
        await authService.logout();
        setState({
          isAuthenticated: false,
          user: null,
        });
      },
      closeLoginModal: () => {
        setState({
          isLoginModalOpen: false,
        });
      },
    })),
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
