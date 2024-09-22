import { useState, useCallback } from 'react';
import axios from 'axios';

export const useNvidia = (endpoint: string) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const call = useCallback(async (payload: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`/api/${endpoint}`, payload);
      setData(response.data);
      return response.data;
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message;
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  return { data, loading, error, call };
};
