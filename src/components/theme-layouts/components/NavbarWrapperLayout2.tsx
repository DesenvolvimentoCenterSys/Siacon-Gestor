'use client';

import { styled, ThemeProvider } from '@mui/material/styles';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import { memo, useEffect } from 'react';
import NavbarToggleFabLayout2 from '@/components/theme-layouts/layout1/components/NavbarToggleFabLayout2';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { useNavbar } from 'src/contexts/NavbarContext';
import usePathname from '@fuse/hooks/usePathname';
import { useNavbarTheme } from '@fuse/core/FuseSettings/hooks/fuseThemeHooks';
import { useFuseLayoutSettings } from '@fuse/core/FuseLayout/FuseLayout';
import NavbarMobileLayout2 from './NavbarMobileLayout2';

const StyledSwipeableDrawer = styled(SwipeableDrawer)(({ theme }) => ({
	'& > .MuiDrawer-paper': {
		height: '100%',
		flexDirection: 'column',
		flex: '1 1 auto',
		width: 280,
		minWidth: 280,
		transition: theme.transitions.create(['width', 'min-width'], {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.shorter
		})
	}
}));

type NavbarWrapperLayout2Props = {
	className?: string;
};

/**
 * The navbar wrapper layout 2 - VERTICAL DRAWER ONLY
 */
function NavbarWrapperLayout2(props: NavbarWrapperLayout2Props) {
	const { className = '' } = props;

	const { config } = useFuseLayoutSettings();

	const navbarTheme = useNavbarTheme();
	const { mobileOpen, navbarCloseMobile, open, navbarClose } = useNavbar();
	const pathname = usePathname();
	const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('md'));

	useEffect(() => {
		if (isMobile) {
			navbarCloseMobile();
		} else {
			navbarClose();
		}
	}, [pathname, isMobile, navbarCloseMobile, navbarClose]);

	return (
		<>
			<ThemeProvider theme={navbarTheme}>
				{/* REMOVED: Horizontal navbar completely disabled */}
				{/* Only vertical drawer is used for all screen sizes */}

				<StyledSwipeableDrawer
					anchor="left"
					variant="temporary"
					open={mobileOpen}
					onClose={navbarCloseMobile}
					onOpen={() => { }}
					disableSwipeToOpen
					className={className}
					ModalProps={{
						keepMounted: true
					}}
				>
					<NavbarMobileLayout2 />
				</StyledSwipeableDrawer>
			</ThemeProvider>

			{/* Toggle button - ALWAYS visible */}
			<NavbarToggleFabLayout2 />
		</>
	);
}

export default memo(NavbarWrapperLayout2);
