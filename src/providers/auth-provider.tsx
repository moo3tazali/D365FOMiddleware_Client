import { createContext, useEffect, useState } from 'react';
import { createStore, type StoreApi } from 'zustand';

import { useServices } from '@/hooks/use-services';

export type TAuth = {
  isAuthenticated: boolean;
  reset: () => void;
};

const AuthContext = createContext<StoreApi<TAuth> | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
}

const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  isAuthenticated,
}) => {
  const [store] = useState(() =>
    createStore<TAuth>((setState) => ({
      isAuthenticated,
      reset: () =>
        setState({
          isAuthenticated: false,
        }),
    }))
  );

  const { userService } = useServices();

  useEffect(() => {
    const checkAuth = async () => {
      const isAuthenticated = await userService.isAuthenticated();

      if (isAuthenticated) return;

      store.setState({
        isAuthenticated: false,
      });
    };

    // check auth every 1 minute
    const checkAuthInterval = setInterval(checkAuth, 1000 * 60 * 1);

    return () => clearInterval(checkAuthInterval);
  }, [store, userService]);

  return <AuthContext.Provider value={store}>{children}</AuthContext.Provider>;
};

export { AuthProvider, AuthContext };
