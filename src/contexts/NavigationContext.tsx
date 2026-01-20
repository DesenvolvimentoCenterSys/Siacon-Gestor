import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { FuseNavItemType } from '@fuse/core/FuseNavigation/types/FuseNavItemType';
import FuseNavigationHelper from '@fuse/utils/FuseNavigationHelper';
import navigationConfig from 'src/configs/navigationConfig';
import FuseNavItemModel from '@fuse/core/FuseNavigation/models/FuseNavItemModel';
import { PartialDeep } from 'type-fest';

type NavigationContextType = {
  navigation: FuseNavItemType[];
  setNavigation: (navigation: FuseNavItemType[]) => void;
  resetNavigation: () => void;
  appendNavigationItem: (item: FuseNavItemType, parentId?: string | null) => void;
  prependNavigationItem: (item: FuseNavItemType, parentId?: string | null) => void;
  updateNavigationItem: (id: string, item: PartialDeep<FuseNavItemType>) => void;
  removeNavigationItem: (id: string) => void;
};

const initialState: NavigationContextType = {
  navigation: [],
  setNavigation: () => { },
  resetNavigation: () => { },
  appendNavigationItem: () => { },
  prependNavigationItem: () => { },
  updateNavigationItem: () => { },
  removeNavigationItem: () => { }
};

const NavigationContext = createContext<NavigationContextType>(initialState);

export const useNavigation = () => useContext(NavigationContext);

export const NavigationProvider = ({ children }: { children: ReactNode }) => {
  const [navigation, setNavigationState] = useState<FuseNavItemType[]>(navigationConfig);

  const setNavigation = useCallback((newNavigation: FuseNavItemType[]) => {
    setNavigationState(newNavigation);
  }, []);

  const resetNavigation = useCallback(() => {
    setNavigationState(navigationConfig);
  }, []);

  const appendNavigationItem = useCallback((item: FuseNavItemType, parentId?: string | null) => {
    setNavigationState((prevNavigation) =>
      FuseNavigationHelper.appendNavItem(prevNavigation, FuseNavItemModel(item), parentId)
    );
  }, []);

  const prependNavigationItem = useCallback((item: FuseNavItemType, parentId?: string | null) => {
    setNavigationState((prevNavigation) =>
      FuseNavigationHelper.prependNavItem(prevNavigation, FuseNavItemModel(item), parentId)
    );
  }, []);

  const updateNavigationItem = useCallback((id: string, item: PartialDeep<FuseNavItemType>) => {
    setNavigationState((prevNavigation) =>
      FuseNavigationHelper.updateNavItem(prevNavigation, id, item)
    );
  }, []);

  const removeNavigationItem = useCallback((id: string) => {
    setNavigationState((prevNavigation) =>
      FuseNavigationHelper.removeNavItem(prevNavigation, id)
    );
  }, []);

  return (
    <NavigationContext.Provider
      value={{
        navigation,
        setNavigation,
        resetNavigation,
        appendNavigationItem,
        prependNavigationItem,
        updateNavigationItem,
        removeNavigationItem
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export default NavigationContext;
