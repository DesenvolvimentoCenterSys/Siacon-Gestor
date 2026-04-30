'use client';

import * as React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { useQuery } from '@tanstack/react-query';

import AuthJsForm from '@auth/forms/AuthJsForm';
import { api } from '@/services/api';

interface PortalSettings {
	id: number;
	urlLogoMenu?: string;
	urlLogoLogin?: string;
	urlLogoCard?: string;
}

const FIXED_BEARER_TOKEN =
	'eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0.YXViY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6YWIxMjM0NTY3ODkwMTIzNA';

async function fetchPortalSettings(): Promise<PortalSettings> {
	const response = await api.get<PortalSettings>('/api/portalSettings', {
		headers: {
			Authorization: `Bearer ${FIXED_BEARER_TOKEN}`
		}
	});
	return response.data;
}

export default function SignInPage() {
	const {
		data: settings,
		isLoading,
		error
	} = useQuery<PortalSettings, Error>({
		queryKey: ['portalSettings'],
		queryFn: fetchPortalSettings,
		staleTime: 1000 * 60 * 30, // 30 minutos — settings mudam raramente
		retry: 2
	});

	if (isLoading) {
		return (
			<Box className="flex flex-1 items-center justify-center p-4">
				<CircularProgress />
			</Box>
		);
	}

	if (error) {
		return (
			<Box className="flex flex-1 items-center justify-center p-4">
				<Alert severity="error">Erro ao carregar configurações: {error.message}</Alert>
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
						backgroundColor: '#1E1E1E',
						p: 4
					}}
				>
					<Box sx={{ textAlign: 'center',display:'flex', flexDirection: 'column', color: '#ffffff' }}>
						<img
							src={settings?.urlLogoMenu}
							alt="logo"
							style={{ width: 120, marginBottom: 16, alignSelf: 'center' }}
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
						<Box sx={{ textAlign: 'center',display:'flex', flexDirection: 'column', mb: 4 }}>
							<img
								src={settings?.urlLogoLogin}
								alt="logo"
								style={{ width: 120, alignSelf: 'center'}}
							/>
							<Typography
								variant="h4"
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
