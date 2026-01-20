import { Box, Button, lighten, Typography } from '@mui/material';
import { signIn } from 'next-auth/react';
import { authJsProviderMap } from '@auth/authJs';

const providerLogoPath = 'https://authjs.dev/img/providers';

function AuthJsProviderSelect() {
	function handleSignIn(providerId: string) {
		try {
			signIn(providerId);
		} catch (error) {
			console.error(error);
		}
	}

	if (authJsProviderMap?.length === 0) {
		return null;
	}

	return (
		<></>
	);
}

export default AuthJsProviderSelect;
