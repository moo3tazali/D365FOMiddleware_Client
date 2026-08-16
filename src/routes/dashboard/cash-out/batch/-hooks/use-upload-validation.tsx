import {
  createContext,
  useCallback,
  useContext,
  useState,
  type PropsWithChildren,
} from 'react';

import type { ErrorRes } from '@/interfaces/api-res';

interface CashOutUploadValidationContextValue {
  uploadError: ErrorRes | null;
  clearUploadError: () => void;
  setUploadError: (error: ErrorRes) => void;
}

const CashOutUploadValidationContext =
  createContext<CashOutUploadValidationContextValue | null>(null);

export const CashOutUploadValidationProvider = ({
  children,
}: PropsWithChildren) => {
  const [uploadError, setUploadErrorState] = useState<ErrorRes | null>(null);
  const clearUploadError = useCallback(() => setUploadErrorState(null), []);
  const setUploadError = useCallback(
    (error: ErrorRes) => setUploadErrorState(error),
    [],
  );

  return (
    <CashOutUploadValidationContext.Provider
      value={{ uploadError, clearUploadError, setUploadError }}
    >
      {children}
    </CashOutUploadValidationContext.Provider>
  );
};

export const useCashOutUploadValidation = () => {
  const context = useContext(CashOutUploadValidationContext);
  if (!context) {
    throw new Error(
      'useCashOutUploadValidation must be used inside CashOutUploadValidationProvider.',
    );
  }
  return context;
};
