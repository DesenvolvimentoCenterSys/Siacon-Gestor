'use client';

import { styled, ThemeProvider } from '@mui/material/styles';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import { memo, useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
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

			{/* Top Bar - ONLY visible on mobile */}
			{isMobile && (
				<AppBar
					position="fixed"
					color="inherit"
					className="shadow-md z-50"
					sx={{
						backgroundColor: 'background.paper',
						color: 'text.primary'
					}}
				>
					<Toolbar className="px-16 min-h-48 md:min-h-64">
						<IconButton
							onClick={navbarToggleMobile}
							edge="start"
							color="inherit"
							aria-label="menu"
						>
							<FuseSvgIcon>heroicons-outline:bars-3</FuseSvgIcon>
						</IconButton>
					</Toolbar>
				</AppBar>
			)}
		</>
	);
}

export default memo(NavbarWrapperLayout2);
