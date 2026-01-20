import FuseScrollbars from '@fuse/core/FuseScrollbars';
import { styled } from '@mui/material/styles';
import clsx from 'clsx';
import { memo } from 'react';
import Navigation from 'src/components/theme-layouts/components/navigation/Navigation';
import Logo from '../../components/Logo';
import Box from '@mui/material/Box';
import UserMenu from '../../components/UserMenu';

const Root = styled('div')(({ theme }) => ({
	position: 'relative',
	backgroundColor: '#E5E7EB !important',
	color: '#1F232B',
	width: 280,
	minWidth: 280,
	maxWidth: 280,
	display: 'flex',
	flexDirection: 'column',
	height: '100vh',
	'& .fuse-list-item': {
		color: '#1F232B !important'
	}
}));

type NavbarLayout2Props = {
	className?: string;
};

function NavbarLayout2(props: NavbarLayout2Props) {
	const { className = '' } = props;

	return (
		<Root className={clsx('shadow-md', className)}>
			<div className="flex shrink-0 items-center justify-center px-8 py-16">
				<Logo />
			</div>

			<div className="flex-1 overflow-y-auto">
				<Navigation
					className="w-full px-12"
					layout="vertical"
				/>
			</div>

			<Box
				sx={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					px: 2,
					py: 2,
					borderTop: 1,
					borderColor: 'divider',
					minHeight: 80
				}}
			>
				<UserMenu
					className="w-full"
					arrowIcon="heroicons-outline:chevron-up"
					popoverProps={{
						anchorOrigin: {
							vertical: 'top',
							horizontal: 'center'
						},
						transformOrigin: {
							vertical: 'bottom',
							horizontal: 'center'
						}
					}}
				/>
			</Box>
		</Root>
	);
}

export default memo(NavbarLayout2);
