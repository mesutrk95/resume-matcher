import { useEffect, useRef } from 'react';

export function useRepeat(callback: () => void | Promise<void>, delay: number, immediate = false) {
  // Use refs to avoid recreating the timer on each render
  const callbackRef = useRef(callback);

  // Update the callback ref when the callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Setup the interval and cleanup on unmount
  useEffect(() => {
    // Don't set up anything if delay is invalid
    if (delay <= 0) return;

    let timeoutId: NodeJS.Timeout | null = null;

    const check = async () => {
      try {
        // Use the ref to get the latest callback
        await callbackRef.current();
      } catch (error) {
        console.error('Error in useRepeat callback:', error);
      }

      // Set the next timeout
      timeoutId = setTimeout(check, delay);
    };

    // Start the cycle
    if (immediate) {
      check();
    } else {
      timeoutId = setTimeout(check, delay);
    }

    // Cleanup function
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [delay, immediate]);
}
