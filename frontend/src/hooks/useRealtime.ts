import { useEffect, useRef } from 'react';
import { API_URL } from '@/lib/api';

export default function useRealtime(onDataChanged: () => void) {
  const callbackRef = useRef(onDataChanged);

  useEffect(() => {
    callbackRef.current = onDataChanged;
  }, [onDataChanged]);

  useEffect(() => {
    const eventSource = new EventSource(`${API_URL}/events`);

    eventSource.addEventListener('data-changed', () => callbackRef.current());

    return () => eventSource.close();
  }, []);
}
