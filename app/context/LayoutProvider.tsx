"use client";

import { createContext, useContext, useState } from "react";

const LayoutContext = createContext({
  isFluid: false,
  setIsFluid: (value: boolean) => {},
});

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [isFluid, setIsFluid] = useState(false);

  return (
    <LayoutContext.Provider value={{ isFluid, setIsFluid }}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  return useContext(LayoutContext);
}
