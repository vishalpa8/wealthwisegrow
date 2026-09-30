"use client";

import { createContext, ReactNode, useContext } from "react";

type ConsentContextValue = {
  analyticsAllowed: boolean;
  advertisingAllowed: boolean;
};

const defaultConsent: ConsentContextValue = {
  analyticsAllowed: true,
  advertisingAllowed: true,
};

const ConsentContext = createContext<ConsentContextValue>(defaultConsent);

export function ConsentProvider({ children }: { children: ReactNode }) {
  return <ConsentContext.Provider value={defaultConsent}>{children}</ConsentContext.Provider>;
}

export function useConsent() {
  return useContext(ConsentContext);
}
