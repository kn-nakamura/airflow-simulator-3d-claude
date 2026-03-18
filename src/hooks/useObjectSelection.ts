import { useCallback } from 'react';
import { useObjectStore } from '../store/objectStore';

export function useObjectSelection() {
  const selectObject = useObjectStore((s) => s.selectObject);

  const handleClick = useCallback(
    (id: string, event: { stopPropagation: () => void; nativeEvent?: { shiftKey?: boolean } }) => {
      event.stopPropagation();
      const multi = !!(event.nativeEvent as any)?.shiftKey;
      selectObject(id, multi);
    },
    [selectObject],
  );

  const handleMiss = useCallback(() => {
    selectObject(null);
  }, [selectObject]);

  return { handleClick, handleMiss };
}
