import FuseDialog from '@fuse/core/FuseDialog';
import { styled } from '@mui/material/styles';
import FuseMessage from '@fuse/core/FuseMessage';
import clsx from 'clsx';
import { ReactNode, memo } from 'react';
import { Layout2ConfigDefaultsType } from 'src/components/theme-layouts/layout2/Layout2Config';
import { useFuseLayoutSettings } from '@fuse/core/FuseLayout/FuseLayout';
import FooterLayout2 from './components/FooterLayout2';
import LeftSideLayout2 from './components/LeftSideLayout2';
import NavbarWrapperLayout2 from './components/NavbarWrapperLayout2';
import RightSideLayout2 from './components/RightSideLayout2';
import ToolbarLayout2 from './components/ToolbarLayout2';
import Configurator from './components/configurator/Configurator';
import Box from '@mui/material/Box';

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
 * The layout 2.
 */
function Layout2(props: Layout2Props) {
	const { children } = props;

	const settings = useFuseLayoutSettings();
	const config = settings.config as Layout2ConfigDefaultsType;

	return (
		<Root
			id="fuse-layout"
			className="flex flex-auto w-full"
			config={config}
		>
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
			{config.leftSidePanel.display && <LeftSideLayout2 />}

			<div className="flex min-w-0 flex-auto flex-col">
				<main
					id="fuse-main"
					className="relative flex min-h-full min-w-0 flex-auto flex-col"
				>
					{config.navbar.display && (
						<NavbarWrapperLayout2
							className={clsx(config.navbar.style === 'fixed' && 'sticky top-0 z-50')}
						/>
					)}

					{config.toolbar.display && (
						<ToolbarLayout2
							className={clsx(
								config.toolbar.style === 'fixed' && 'sticky top-0',
								config.toolbar.position === 'above' && 'z-40 order-first'
							)}
						/>
					)}
					<div className="relative z-10 flex min-h-0 flex-auto flex-col">
						<FuseDialog />
						{children}
					</div>

					{config.footer.display && (
						<FooterLayout2 className={config.footer.style === 'fixed' ? 'sticky bottom-0' : ''} />
					)}
				</main>
			</div>

			{config.rightSidePanel.display && <RightSideLayout2 />}
			<FuseMessage />
		</Root>
	);
}

export default memo(Layout2);
