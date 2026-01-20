import IconButton from '@mui/material/IconButton';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import clsx from 'clsx';
import { useQuickPanel } from 'src/contexts/QuickPanelContext';

type QuickPanelToggleButtonProps = {
	className?: string;
	children?: React.ReactNode;
};

/**
 * The quick panel toggle button.
 */
function QuickPanelToggleButton(props: QuickPanelToggleButtonProps) {
	const { className = '', children = <FuseSvgIcon size={20}>heroicons-outline:bookmark</FuseSvgIcon> } = props;
	const { toggleQuickPanel } = useQuickPanel();

	return (
		<IconButton
			onClick={toggleQuickPanel}
			className={clsx('border border-divider', className)}
		>
			{children}
		</IconButton>
	);
}

export default QuickPanelToggleButton;
