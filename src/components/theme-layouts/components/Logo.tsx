// src/components/Logo.tsx

import React, { useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';

import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { api } from '../../../services/api';

interface PortalSettings {
	id: number;
	urlLogoMenu?: string;
	urlLogoLogin?: string;
	urlLogoCard?: string;
}

const Root = styled('div')(({ theme }) => ({
	'& > .logo-icon': {
		transition: theme.transitions.create(['width', 'height'], {
			duration: theme.transitions.duration.shortest,
			easing: theme.transitions.easing.easeInOut
		})
	},
	'& > .badge': {
		transition: theme.transitions.create('opacity', {
			duration: theme.transitions.duration.shortest,
			easing: theme.transitions.easing.easeInOut
		})
	}
}));

/**
 * The logo component.
 */
function Logo() {
	const [settings, setSettings] = useState<PortalSettings | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function fetchSettings() {
			try {
				setLoading(true);
				const response = await api.get<PortalSettings>('/api/portalSettings', {
					headers: {
						Authorization:
							'Bearer eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0.YXViY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6YWIxMjM0NTY3ODkwMTIzNA'
					}
				});
				setSettings(response.data);
			} catch (err: any) {
				setError(err.response?.data?.error ?? err.message);
			} finally {
				setLoading(false);
			}
		}

		fetchSettings();
	}, []);

	// Feedback de carregamento / erro
	if (loading) {
		return (
			<Root className="flex flex-1 items-center justify-center p-4">
				<CircularProgress />
			</Root>
		);
	}

	if (error) {
		return (
			<Root className="flex flex-1 items-center justify-center p-4">
				<Alert severity="error">Erro ao carregar logo: {error}</Alert>
			</Root>
		);
	}

	// Usamos urlLogoMenu como a "logo principal" aqui
	const logoSrc = settings?.urlLogoMenu;

	return (
		<Root className="flex flex-1 items-center">
			<div className="flex flex-1 flex-col items-center px-10 mt-20 w-full">
				{logoSrc && (
					<img
						className="logo-icon h-32 w-50"
						src={logoSrc}
						alt="logo"
					/>
				)}
				<div className="flex items-center ml-64 mt-2" />

			</div>
		</Root>
	);
}

export default Logo;
