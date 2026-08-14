import { useState, useCallback } from 'react';

interface RequestState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useRequest<T>(
  fetcher: () => Promise<T>,
) {
  const [state, setState] = useState<RequestState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const run = useCallback(async () => {
    setState({ data: null, loading: true, error: null });
    try {
      const data = await fetcher();
      setState({ data, loading: false, error: null });
      return data;
    } catch (e: unknown) {
      const error = e instanceof Error ? e.message : 'Request failed';
      setState({ data: null, loading: false, error });
      throw e;
    }
  }, [fetcher]);

  return { ...state, run };
}
