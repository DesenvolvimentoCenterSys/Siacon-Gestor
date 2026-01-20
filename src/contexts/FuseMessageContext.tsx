import { createContext, useContext, useState, ReactElement, ReactNode, useCallback } from 'react';

type FuseMessageOptions = {
  variant: 'success' | 'error' | 'warning' | 'info';
  anchorOrigin: {
    vertical: 'top' | 'bottom';
    horizontal: 'left' | 'center' | 'right';
  };
  autoHideDuration: number | null;
  message: ReactElement | string;
};

type FuseMessageContextType = {
  state: boolean;
  options: FuseMessageOptions;
  showMessage: (options: Partial<FuseMessageOptions>) => void;
  hideMessage: () => void;
};

const initialState: FuseMessageContextType = {
  state: false,
  options: {
    variant: 'info',
    anchorOrigin: {
      vertical: 'top',
      horizontal: 'center'
    },
    autoHideDuration: 2000,
    message: 'Hi'
  },
  showMessage: () => { },
  hideMessage: () => { }
};

const FuseMessageContext = createContext<FuseMessageContextType>(initialState);

export const useFuseMessage = () => useContext(FuseMessageContext);

export const FuseMessageProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState(false);
  const [options, setOptions] = useState<FuseMessageOptions>(initialState.options);

  const showMessage = useCallback((newOptions: Partial<FuseMessageOptions>) => {
    setOptions((prev) => ({ ...prev, ...newOptions }));
    setState(true);
  }, []);

  const hideMessage = useCallback(() => {
    setState(false);
  }, []);

  return (
    <FuseMessageContext.Provider value={{ state, options, showMessage, hideMessage }}>
      {children}
    </FuseMessageContext.Provider>
  );
};

export default FuseMessageContext;
