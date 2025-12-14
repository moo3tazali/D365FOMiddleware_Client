import { useSearch } from '@tanstack/react-router';

import { useServices } from './use-services';

export const useParsedPagination = () => {
  const search = useSearch({ strict: false, structuralSharing: true });

  const { pagination } = useServices();

  return pagination.getFromSearch(search);
};
