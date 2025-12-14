import { useContext } from 'react';
import { useStore } from 'zustand';

import { AuthContext, type TAuth } from '@/providers/auth-provider';

export function useAuth(): TAuth;
export function useAuth<T>(selector: (state: TAuth) => T): T;
export function useAuth<T>(selector?: (state: TAuth) => T): T | TAuth {
  const store = useContext(AuthContext);

  if (!store) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const state = useStore(store, selector ?? ((s) => s as T));

  return state;
}
