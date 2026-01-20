'use client';

import Fab from '@mui/material/Fab';
import { styled } from '@mui/material/styles';

import Tooltip from '@mui/material/Tooltip';
import clsx from 'clsx';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

const Root = styled(Tooltip)<{ position: 'left' | 'right' }>(({ theme }) => ({
	'& > .button': {
		height: 48,
		position: 'fixed',
		zIndex: 1200,
		top: 16,
		width: 48,
		borderRadius: 24,
		padding: 12,
		backgroundColor: theme.palette.background.paper,
		boxShadow: theme.shadows[4],
		transition: theme.transitions.create(['background-color', 'border-radius', 'width', 'min-width', 'padding', 'box-shadow'], {
			easing: theme.transitions.easing.easeInOut,
			duration: theme.transitions.duration.shorter
		}),
		'&:hover': {
			boxShadow: theme.shadows[8],
			width: 56
		},
		'& > .button-icon': {
			fontSize: 24,
			transition: theme.transitions.create(['transform'], {
				easing: theme.transitions.easing.easeInOut,
				duration: theme.transitions.duration.short
			})
		}
	},
	variants: [
		{
			props: {
				position: 'left'
			},
			style: {
				'& > .button': {
					borderBottomLeftRadius: 0,
					borderTopLeftRadius: 0,
					left: 0
				}
			}
		},
		{
			props: {
				position: 'right'
			},
			style: {
				'& > .button': {
					borderBottomRightRadius: 0,
					borderTopRightRadius: 0,
					right: 0,
					'& > .button-icon': {
						transform: 'rotate(-180deg)'
					}
				}
			}
		}
	]
}));

type NavbarToggleFabProps = {
	className?: string;
	position?: string;
	onClick?: () => void;
};

/**
 * The NavbarToggleFab component.
 */
function NavbarToggleFab(props: NavbarToggleFabProps) {
	const { className = '', position = 'left', onClick } = props;

	return (
		<Root
			title="Show Navigation"
			placement={position === 'left' ? 'right' : 'left'}
			position={position as 'left' | 'right'}
		>
			<Fab
				className={clsx('button', className)}
				onClick={onClick}
				disableRipple
			>
				<FuseSvgIcon
					color="action"
					className="button-icon"
				>
					heroicons-outline:bars-3
				</FuseSvgIcon>
			</Fab>
		</Root>
	);
}

export default NavbarToggleFab;
