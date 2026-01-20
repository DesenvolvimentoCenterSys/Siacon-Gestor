import Dialog from '@mui/material/Dialog';
import { useFuseDialog } from 'src/contexts/FuseDialogContext';

/**
 * FuseDialog component
 * This component renders a material UI ```Dialog``` component
 * with properties pulled from the context
 */
function FuseDialog() {
	const { open, options, closeDialog } = useFuseDialog();

	return (
		<Dialog
			onClose={closeDialog}
			aria-labelledby="fuse-dialog-title"
			classes={{
				paper: 'rounded-lg'
			}}
			{...options}
			open={open}
		/>
	);
}

export default FuseDialog;
