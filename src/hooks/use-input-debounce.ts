import { useEffect, useRef, useState } from 'react';

export const useInputDebounce = (
  inputRef: React.RefObject<
    HTMLInputElement | HTMLTextAreaElement | null
  >,
  cb?: (value: string) => void
): string => {
  const [finalValue, setFinalValue] = useState<string>('');
  const timeoutRef = useRef<number | undefined>(undefined);
  const lastValueRef = useRef<string | undefined>(
    undefined
  );

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    const handleTyping = () => {
      const currentValue = input.value;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        if (currentValue !== lastValueRef.current) {
          lastValueRef.current = currentValue;
          setFinalValue(currentValue);
          cb?.(currentValue);
        }
      }, 500);
    };

    input.addEventListener('input', handleTyping);

    return () => {
      input.removeEventListener('input', handleTyping);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [inputRef, cb]);

  return finalValue;
};
