import { useContext } from 'react';

import { ServicesContext } from '@/providers/services-provider';

export const useServices = () => {
  const context = useContext(ServicesContext);

  if (!context) {
    throw new Error(
      'useServices must be used within a ServicesProvider'
    );
  }
  return context;
};
