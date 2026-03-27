import { useState, useEffect, useCallback, useRef } from 'react';

const useAutoRefresh = (fetchFn, { interval = 30000, enabled = true } = {}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const intervalRef = useRef(null);
  const fetchFnRef = useRef(fetchFn);
  const isFetchingRef = useRef(false);

  useEffect(() => { fetchFnRef.current = fetchFn; });

  const refresh = useCallback(async () => {
    if (document.hidden || isFetchingRef.current) return;
    isFetchingRef.current = true;
    setIsRefreshing(true);
    try {
      await fetchFnRef.current();
    } finally {
      isFetchingRef.current = false;
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    intervalRef.current = setInterval(refresh, interval);
    const handleFocus = () => refresh();
    const handleVisibility = () => { if (!document.hidden) refresh(); };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      clearInterval(intervalRef.current);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [refresh, interval, enabled]);

  return { isRefreshing };
};

export default useAutoRefresh;
