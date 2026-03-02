import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import clsx from 'clsx';
import 'src/styles/splash-screen.css';
import 'src/styles/app-base.css';
import 'src/styles/app-components.css';
import 'src/styles/app-utilities.css';
import { SessionProvider } from 'next-auth/react';
import { auth } from '@auth/authJs';
import generateMetadata from '../utils/generateMetadata';
import App from './App';

export const metadata = await generateMetadata({
	title: 'Dashboard',
	description: 'Dashboard',
	cardImage: '/card.png',
	robots: 'follow, index',
	favicon: '/favicon.ico',
	url: 'https://centersys.com.br'
});

export default async function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode;
}>) {
	const session = await auth();

	return (
		<html
			lang="pt-BR"
			translate="no"
		>
			<head>
				<meta charSet="utf-8" />
				<meta
					name="google"
					content="notranslate"
				/>
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1, shrink-to-fit=no"
				/>
				<meta
					name="theme-color"
					content="#000000"
				/>
				<base href="/" />
				<link
					rel="manifest"
					href="/manifest.json"
				/>
				<link
					rel="shortcut icon"
					href="/favicon.ico"
				/>

				<link
					href="/assets/fonts/material-design-icons/MaterialIconsOutlined.css"
					rel="stylesheet"
				/>
				<link
					href="/assets/fonts/inter/inter.css"
					rel="stylesheet"
				/>
				<link
					href="/assets/fonts/meteocons/style.css"
					rel="stylesheet"
				/>
				<noscript id="emotion-insertion-point" />
			</head>
			<body
				id="root"
				className={clsx('loading', GeistSans.variable, GeistMono.variable)}
			>
				<SessionProvider
					basePath="/auth"
					session={session}
				>
					<App>{children}</App>
				</SessionProvider>
			</body>
		</html>
	);
}
