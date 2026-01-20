import * as React from 'react';
import { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

import AuthJsForm from '@auth/forms/AuthJsForm';
import { api } from '@/services/api';

interface PortalSettings {
	id: number;
	urlLogoMenu?: string;
	urlLogoLogin?: string;
	urlLogoCard?: string;
}

export default function SignInPage() {
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

	if (loading) {
		return (
			<Box className="flex flex-1 items-center justify-center p-4">
				<CircularProgress />
			</Box>
		);
	}

	if (error) {
		return (
			<Box className="flex flex-1 items-center justify-center p-4">
				<Alert severity="error">Erro ao carregar configurações: {error}</Alert>
			</Box>
		);
	}

	return (
		<Box
			sx={{
				minHeight: '100vh',
				backgroundColor: '#ffffff',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				p: 2
			}}
		>
			<Paper
				elevation={6}
				sx={{
					display: 'flex',
					width: { xs: '100%', md: 900 },
					borderRadius: 3,
					overflow: 'hidden'
				}}
			>
				{/* Área de Branding */}
				<Box
					sx={{
						flex: 1,
						display: { xs: 'none', md: 'flex' },
						alignItems: 'center',
						justifyContent: 'center',
						backgroundColor: '#1976d2',
						p: 4
					}}
				>
					<Box sx={{ textAlign: 'center', color: '#ffffff' }}>
						<img
							src={settings?.urlLogoMenu}
							alt="logo"
							style={{ width: 120, marginBottom: 16 }}
						/>
						<Typography
							variant="h4"
							sx={{ fontWeight: 'bold' }}
						>
							Sistema de Gerenciamento
						</Typography>
						<Typography
							variant="body1"
							sx={{ mt: 2, maxWidth: 300, mx: 'auto' }}
						>
							Impulsione seu sucesso: gerencie suas dados e transforme cada
							negócio em uma oportunidade única!
						</Typography>
					</Box>
				</Box>

				{/* Área de Login */}
				<Box sx={{ flex: 1, backgroundColor: '#ffffff', p: { xs: 4, md: 6 } }}>
					<CardContent>
						<Box sx={{ textAlign: 'center', mb: 4 }}>
							<img
								src={settings?.urlLogoLogin}
								alt="logo"
								style={{ width: 120 }}
							/>
							<Typography
								variant="h5"
								sx={{ mt: 2, fontWeight: 'bold', color: '#1976d2' }}
							>
								Fazer Login
							</Typography>
						</Box>
						<AuthJsForm formType="signin" />
					</CardContent>
				</Box>
			</Paper>
		</Box>
	);
}
