import { createContext } from "react";

type GlobalType = {
  updateAndShowToast: (string: string) => void;
};

export const GlobalContext = createContext<GlobalType | null>(null);
