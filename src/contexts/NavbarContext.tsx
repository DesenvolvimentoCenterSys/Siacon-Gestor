import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

type NavbarContextType = {
  open: boolean;
  mobileOpen: boolean;
  foldedOpen: boolean;
  navbarToggleFolded: () => void;
  navbarOpenFolded: () => void;
  navbarCloseFolded: () => void;
  navbarToggleMobile: () => void;
  navbarOpenMobile: () => void;
  navbarCloseMobile: () => void;
  navbarClose: () => void;
  navbarOpen: () => void;
  navbarToggle: () => void;
  resetNavbar: () => void;
};

const initialState: NavbarContextType = {
  open: true,
  mobileOpen: false,
  foldedOpen: false,
  navbarToggleFolded: () => { },
  navbarOpenFolded: () => { },
  navbarCloseFolded: () => { },
  navbarToggleMobile: () => { },
  navbarOpenMobile: () => { },
  navbarCloseMobile: () => { },
  navbarClose: () => { },
  navbarOpen: () => { },
  navbarToggle: () => { },
  resetNavbar: () => { }
};

const NavbarContext = createContext<NavbarContextType>(initialState);

export const useNavbar = () => useContext(NavbarContext);

export const NavbarProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [foldedOpen, setFoldedOpen] = useState(false);

  const navbarToggleFolded = useCallback(() => setFoldedOpen((prev) => !prev), []);
  const navbarOpenFolded = useCallback(() => setFoldedOpen(true), []);
  const navbarCloseFolded = useCallback(() => setFoldedOpen(false), []);
  const navbarToggleMobile = useCallback(() => setMobileOpen((prev) => !prev), []);
  const navbarOpenMobile = useCallback(() => setMobileOpen(true), []);
  const navbarCloseMobile = useCallback(() => setMobileOpen(false), []);
  const navbarClose = useCallback(() => setOpen(false), []);
  const navbarOpen = useCallback(() => setOpen(true), []);
  const navbarToggle = useCallback(() => setOpen((prev) => !prev), []);
  const resetNavbar = useCallback(() => {
    setOpen(true);
    setMobileOpen(false);
    setFoldedOpen(false);
  }, []);

  return (
    <NavbarContext.Provider
      value={{
        open,
        mobileOpen,
        foldedOpen,
        navbarToggleFolded,
        navbarOpenFolded,
        navbarCloseFolded,
        navbarToggleMobile,
        navbarOpenMobile,
        navbarCloseMobile,
        navbarClose,
        navbarOpen,
        navbarToggle,
        resetNavbar
      }}
    >
      {children}
    </NavbarContext.Provider>
  );
};

export default NavbarContext;
