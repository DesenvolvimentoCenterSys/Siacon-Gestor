import FuseScrollbars from '@fuse/core/FuseScrollbars';
import { styled } from '@mui/material/styles';
import clsx from 'clsx';
import { memo } from 'react';

import UserMenu from 'src/components/theme-layouts/components/UserMenu';
import Logo from './Logo';
import Navigation from './navigation/Navigation';
import GoToDocBox from './GoToDocBox';
import Box from '@mui/material/Box';

const Root = styled('div')(({ theme }) => ({
	backgroundColor: theme.palette.background.default,  
    color: theme.palette.text.primary,
	'& .fuse-list-item': {
		'&:not(.active)': {
			 color: `${theme.palette.text.primary} !important`,
			'& .fuse-list-item-icon': {
				 color: `${theme.palette.text.primary} !important`,
			},
			'& .fuse-list-item-text-primary': {
				 color: `${theme.palette.text.primary} !important`,
			},
			'& .arrow-icon': {
				 color: `${theme.palette.text.primary} !important`,
			}
		}
	},
	'& ::-webkit-scrollbar-thumb': {
		boxShadow: `inset 0 0 0 20px ${'rgba(255, 255, 255, 0.24)'}`,
		...theme.applyStyles('light', {
			boxShadow: `inset 0 0 0 20px ${'rgba(0, 0, 0, 0.24)'}`
		})
	},
	'& ::-webkit-scrollbar-thumb:active': {
		boxShadow: `inset 0 0 0 20px ${'rgba(255, 255, 255, 0.37)'}`,
		...theme.applyStyles('light', {
			boxShadow: `inset 0 0 0 20px ${'rgba(0, 0, 0, 0.37)'}`
		})
	}
}));

const StyledContent = styled(FuseScrollbars)(() => ({
	overscrollBehavior: 'contain',
	overflowX: 'hidden',
	overflowY: 'auto',
	WebkitOverflowScrolling: 'touch',
	backgroundRepeat: 'no-repeat',
	backgroundSize: '100% 40px, 100% 10px',
	backgroundAttachment: 'local, scroll'
}));

type NavbarMobileLayout2Props = {
	className?: string;
};

/**
 * The navbar mobile layout 2.
 */
function NavbarMobileLayout2(props: NavbarMobileLayout2Props) {
	const { className = '' } = props;

	return (
		<Root className={clsx('flex h-full flex-col overflow-hidden', className)}>
			<Box
        component="svg"
        className="pointer-events-none absolute inset-0"
        viewBox="0 0 960 540"
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMax slice"
        sx={{ color: 'primary.contrastText', opacity: 0.05 }}
      >
        <g fill="none" stroke="currentColor" strokeWidth="100">
          <circle r="234" cx="196" cy="23" />
          <circle r="234" cx="790" cy="491" />
        </g>
      </Box>
			<div className="flex h-48 shrink-0 flex-row items-center px-12 md:h-72 mb-32">
				<Logo />
			</div>

			<StyledContent
				className="flex min-h-0 flex-1 flex-col"
				option={{ suppressScrollX: true, wheelPropagation: false }}
			>
				<Navigation layout="vertical" />
			</StyledContent>

			<GoToDocBox className="mx-12 my-16" />



			<div className="p-4 md:p-16 w-full">
				<UserMenu className="w-full" />
			</div>
		</Root>
	);
}

export default memo(NavbarMobileLayout2);
