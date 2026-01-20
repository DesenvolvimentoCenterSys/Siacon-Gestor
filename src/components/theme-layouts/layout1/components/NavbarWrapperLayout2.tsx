'use client';

import { styled, ThemeProvider } from '@mui/material/styles';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import { memo, useEffect } from 'react';
import NavbarToggleFab from 'src/components/theme-layouts/components/navbar/NavbarToggleFab';
import { useNavbar } from 'src/contexts/NavbarContext';
import usePathname from '@fuse/hooks/usePathname';
import { useNavbarTheme } from '@fuse/core/FuseSettings/hooks/fuseThemeHooks';
import { useFuseLayoutSettings } from '@fuse/core/FuseLayout/FuseLayout';
import NavbarMobileLayout2 from '../../components/NavbarMobileLayout2';
import NavbarLayout2 from './NavbarLayout2';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';

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
 * The navbar wrapper layout 2 - UNIFIED MOBILE/OVERLAY BEHAVIOR
 */
function NavbarWrapperLayout2(props: NavbarWrapperLayout2Props) {
	const { className = '' } = props;

	const { config } = useFuseLayoutSettings();
	const navbarTheme = useNavbarTheme();
	const { mobileOpen, navbarCloseMobile, navbarToggleMobile } = useNavbar();
	const pathname = usePathname();
	const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('md'));

	// Close navbar on route change
	useEffect(() => {
		if (isMobile) {
			navbarCloseMobile();
		}
	}, [pathname, navbarCloseMobile, isMobile]);

	return (
		<>
			<ThemeProvider theme={navbarTheme}>
				{!isMobile && <NavbarLayout2 className={className} />}

				{isMobile && (
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
				)}
			</ThemeProvider>

			{/* Toggle button - ONLY visible on mobile */}
			{isMobile && (
				<NavbarToggleFab
					className={className}
					onClick={navbarToggleMobile}
				/>
			)}
		</>
	);
}

export default memo(NavbarWrapperLayout2);
