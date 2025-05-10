import React, { createContext, useContext, useState, useCallback, ReactNode, useRef } from 'react';

// Define the context type
type HighlightContextType = {
  highlightedId: string | null;
  highlightElement: (id: string, duration?: number) => void;
};

// Create the context
const HighlightContext = createContext<HighlightContextType | undefined>(undefined);

// Provider component
export const HighlightProvider = ({ children }: { children: ReactNode }) => {
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const timerHandle = useRef<unknown>(null);

  const highlightElement = useCallback((id: string, duration = 1500) => {
    const target = document.getElementById(id);
    console.log(target);
    window.scrollTo({
      top: target?.offsetTop || 0,
      behavior: 'smooth',
    });

    setHighlightedId(id);

    if (timerHandle.current) clearTimeout(timerHandle.current as number);

    timerHandle.current = setTimeout(() => {
      setHighlightedId(null);
      timerHandle.current = null;
    }, duration);
  }, []);

  return (
    <HighlightContext.Provider value={{ highlightedId, highlightElement }}>
      {children}
    </HighlightContext.Provider>
  );
};

// Custom hook for components to use
export const useHighlight = () => {
  const context = useContext(HighlightContext);
  if (!context) {
    throw new Error('useHighlight must be used within a HighlightProvider');
  }
  return context;
};
