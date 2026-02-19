import FuseDialog from '@fuse/core/FuseDialog';
import { styled } from '@mui/material/styles';
import FuseMessage from '@fuse/core/FuseMessage';
import clsx from 'clsx';
import { ReactNode, memo } from 'react';
import { Layout2ConfigDefaultsType } from 'src/components/theme-layouts/layout2/Layout2Config';
import { useFuseLayoutSettings } from '@fuse/core/FuseLayout/FuseLayout';
import LeftSideLayout2 from './components/LeftSideLayout2';
import NavbarWrapperLayout2 from './components/NavbarWrapperLayout2';
import RightSideLayout2 from './components/RightSideLayout2';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';

const Root = styled('div')(({ config }: { config: Layout2ConfigDefaultsType }) => ({
	...(config.mode === 'boxed' && {
		clipPath: 'inset(0)',
		maxWidth: `${config.containerWidth}px`,
		margin: '0 auto',
		boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
	}),
	...(config.mode === 'container' && {
		'& .container': {
			maxWidth: `${config.containerWidth}px`,
			width: '100%',
			margin: '0 auto'
		}
	})
}));

type Layout2Props = {
	children?: ReactNode;
};

/**
 * The layout 1 - with vertical sidebar navbar.
 */
function Layout2(props: Layout2Props) {
	const { children } = props;

	const settings = useFuseLayoutSettings();
	const config = settings.config as Layout2ConfigDefaultsType;
	const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('md'));

	return (
		<Root
			id="fuse-layout"
			className="flex flex-auto w-full"
			config={config}
		>
			{config.navbar.display && (
				<NavbarWrapperLayout2
					className={clsx(config.navbar.style === 'fixed' && 'sticky top-0 h-screen')}
				/>
			)}

			{config.leftSidePanel.display && <LeftSideLayout2 />}

			<div className="flex min-w-0 flex-auto flex-col">
				<main
					id="fuse-main"
					className="relative flex min-h-full min-w-0 flex-auto flex-col"
				>
					<div className="relative z-10 flex min-h-0 flex-auto flex-col pb-32 md:pb-0">
						{/* Spacer for fixed top bar on mobile */}
						{isMobile && <div className="h-48 md:h-64 shrink-0" />}
						<FuseDialog />
						{children}
					</div>
				</main>
			</div>

			{config.rightSidePanel.display && <RightSideLayout2 />}
			<FuseMessage />
		</Root>
	);
}

export default memo(Layout2);
