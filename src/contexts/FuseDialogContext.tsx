import { createContext, useContext, useState, ReactElement, ReactNode, useCallback } from 'react';

type FuseDialogOptions = {
  children: ReactElement | string;
};

type FuseDialogContextType = {
  open: boolean;
  options: FuseDialogOptions;
  openDialog: (options: FuseDialogOptions) => void;
  closeDialog: () => void;
};

const initialState: FuseDialogContextType = {
  open: false,
  options: {
    children: ''
  },
  openDialog: () => { },
  closeDialog: () => { }
};

const FuseDialogContext = createContext<FuseDialogContextType>(initialState);

export const useFuseDialog = () => useContext(FuseDialogContext);

export const FuseDialogProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<FuseDialogOptions>(initialState.options);

  const openDialog = useCallback((newOptions: FuseDialogOptions) => {
    setOptions(newOptions);
    setOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <FuseDialogContext.Provider value={{ open, options, openDialog, closeDialog }}>
      {children}
    </FuseDialogContext.Provider>
  );
};

export default FuseDialogContext;
