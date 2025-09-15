import { useCallback, useRef } from 'react';

// Hook personalizado para debounce
export const useDebounce = (callback, delay) => {
  const timeoutRef = useRef(null);

  return useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
};

// Hook para optimizar cambios de formulario
export const useOptimizedFormChange = (setFormData, delay = 100) => {
  const debouncedUpdate = useDebounce((name, value) => {
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  }, delay);

  return useCallback((e) => {
    const { name, value } = e.target;
    debouncedUpdate(name, value);
  }, [debouncedUpdate]);
};
