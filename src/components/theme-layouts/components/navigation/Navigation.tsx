'use client';

import FuseNavigation from '@fuse/core/FuseNavigation';
import clsx from 'clsx';
import { useMemo } from 'react';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { FuseNavigationProps } from '@fuse/core/FuseNavigation/FuseNavigation';
import { useNavbar } from 'src/contexts/NavbarContext';
import useNavigation from './hooks/useNavigation';

/**
 * Navigation
 */

type NavigationProps = Partial<FuseNavigationProps>;

function Navigation(props: NavigationProps) {
	const { className = '', layout = 'horizontal', dense, active } = props;
	const { navigation } = useNavigation();

	const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));

	const { navbarCloseMobile } = useNavbar();

	return useMemo(() => {
		function handleItemClick() {
			if (isMobile) {
				navbarCloseMobile();
			}
		}

		return (
			<FuseNavigation
				className={clsx(className)}
				navigation={navigation}
				layout={layout}
				dense={dense}
				active={active}
				onItemClick={handleItemClick}
			/>
		);
	}, [navbarCloseMobile, isMobile, navigation, active, className, dense, layout]);
}

export default Navigation;
