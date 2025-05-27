import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface GuardContextType {
  isDirty: boolean;
  setIsDirty: (val: boolean) => void;
  safeNavigate: (path: string, options?: any) => void;
  triggerDialog: boolean;
  setTriggerDialog: (val: boolean) => void;
  confirmNavigation: () => void;
  setNextPath: React.Dispatch<React.SetStateAction<{ path: string; options?: any } | null>>;
}

const NavigationGuardContext = createContext<GuardContextType | undefined>(undefined);

export const useNavigationGuard = () => {
  const context = useContext(NavigationGuardContext);
  if (!context) {
    throw new Error("useNavigationGuard must be used inside a NavigationGuardProvider");
  }
  return context;
};

export const NavigationGuardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDirty, setIsDirty] = useState(false);
  const [nextPath, setNextPath] = useState<{ path: string; options?: any } | null>(null);
  const [triggerDialog, setTriggerDialog] = useState(false);
  const navigate = useNavigate();

  const safeNavigate = (path: string, options?: any) => {
    if (isDirty) {
      setNextPath({ path, options });
      setTriggerDialog(true);
    } else {
      navigate(path, options);
    }
  };

  const confirmNavigation = () => {
    debugger;
    if (nextPath) {
      setIsDirty(false);
      setTriggerDialog(false);
      navigate(nextPath.path, nextPath.options);
    }
  };
  
    useEffect(() => {
      if (!triggerDialog)
        setTimeout(() => {
          document.body.style.pointerEvents = "";
        }, 500);
    }, [triggerDialog]);


  return (
    <NavigationGuardContext.Provider
      value={{
        isDirty,
        setIsDirty,
        safeNavigate,
        triggerDialog,
        setTriggerDialog,
        confirmNavigation,
        setNextPath,
      }}
    >
      {children}
    </NavigationGuardContext.Provider>
  );
};
