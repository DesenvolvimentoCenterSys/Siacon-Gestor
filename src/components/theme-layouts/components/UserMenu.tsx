import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import Link from '@fuse/core/Link';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { darken } from '@mui/material/styles';
import { alpha } from '@mui/system/colorManipulator';
import AutoShrinkTypography from './quickPanel/AutoShrinkTypography';
import clsx from 'clsx';
import Popover, { PopoverProps } from '@mui/material/Popover/Popover';
import useUser from '@auth/useUser';

type UserMenuProps = {
	className?: string;
	popoverProps?: Partial<PopoverProps>;
	arrowIcon?: string;
};

/**
 * The user menu.
 */
function UserMenu(props: UserMenuProps) {
	const { className, popoverProps, arrowIcon = 'heroicons-outline:chevron-up' } = props;
	const { data: user, signOut, isGuest } = useUser();
	const [userMenu, setUserMenu] = useState<HTMLElement | null>(null);
	const userMenuClick = (event: React.MouseEvent<HTMLElement>) => {
		setUserMenu(event.currentTarget);
	};

	const userMenuClose = () => {
		setUserMenu(null);
	};

	if (!user) {
		return null;
	}

	return (
		<>
			<Button
				className={clsx(
					'user-menu flex justify-start shrink-0 min-h-56 h-56 rounded-lg p-8 space-x-12 border border-white/20',
					className
				)}
				sx={(theme) => ({
					backgroundColor: 'rgba(255, 255, 255, 0.05)',
					'&:hover, &:focus': {
						backgroundColor: alpha(theme.palette.divider, 0.6),
						...theme.applyStyles('dark', {
							backgroundColor: alpha(theme.palette.divider, 0.1)
						})
					}
				})}
				onClick={userMenuClick}
				color="secondary"
			>
				{user?.photoURL ? (
					<Avatar
						sx={(theme) => ({
							background: theme.palette.secondary.main,
							color: theme.palette.common.white
						})}
						className="avatar w-40 h-40 rounded-lg"
						alt="user photo"
						src={user?.photoURL}
						variant="rounded"
					/>
				) : (
					<Avatar
						sx={(theme) => ({
							background: theme.palette.secondary.main,
							color: theme.palette.common.white,
							fontWeight: 600
						})}
						className="avatar md:mx-4"
					>
						{user?.displayName?.[0]}
					</Avatar>
				)}
				<div className="flex flex-col flex-auto">
					<AutoShrinkTypography
						component="span"
						className="title flex font-semibold capitalize tracking-tight leading-none"
						initialFontSize={12}
						minFontSize={10}
					>
						{user?.displayName}
					</AutoShrinkTypography>
					<AutoShrinkTypography
						className="subtitle flex font-medium tracking-tighter leading-none"
						color="text.secondary"
						initialFontSize={10}
						minFontSize={7}
					>
						{user?.email}
					</AutoShrinkTypography>
				</div>
				<div className="flex flex-shrink-0 items-center space-x-2">
					<FuseSvgIcon
						className="arrow"
						size={13}
					>
						{arrowIcon}
					</FuseSvgIcon>
				</div>
			</Button>
			<Popover
				open={Boolean(userMenu)}
				anchorEl={userMenu}
				onClose={userMenuClose}
				anchorOrigin={{
					vertical: 'top',
					horizontal: 'center'
				}}
				transformOrigin={{
					vertical: 'bottom',
					horizontal: 'center'
				}}
				classes={{
					paper: 'py-8 min-w-256'
				}}
				{...popoverProps}
			>
				{isGuest ? (
					<>
						<MenuItem
							component={Link}
							to="/sign-in"
							role="button"
						>
							<ListItemIcon className="min-w-36">
								<FuseSvgIcon>heroicons-outline:lock-closed</FuseSvgIcon>
							</ListItemIcon>
							<ListItemText primary="Entrar" />
						</MenuItem>
						<MenuItem
							component={Link}
							to="/sign-up"
							role="button"
						>
							<ListItemIcon className="min-w-36">
								<FuseSvgIcon>heroicons-outline:user-plus</FuseSvgIcon>
							</ListItemIcon>
							<ListItemText primary="Sign up" />
						</MenuItem>
					</>
				) : (
					<>
						<MenuItem
							onClick={() => {
								signOut();
							}}
						>
							<ListItemIcon className="min-w-36">
								<FuseSvgIcon>heroicons-outline:arrow-right-on-rectangle</FuseSvgIcon>
							</ListItemIcon>
							<ListItemText primary="Sair" />
						</MenuItem>
					</>
				)}
			</Popover>
		</>
	);
}

export default UserMenu;
