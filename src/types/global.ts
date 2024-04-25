import { createContext } from "react";

export type User = {
  user?: string,
  email: string,
  groups: string[],
  preferredUsername: string,
}

type GlobalType = {
  updateAndShowToast: (string: string) => void;
  user?: User
};

export const GlobalContext = createContext<GlobalType | null>(null);
