'use client';

import { SnackbarProvider } from 'notistack';
import { useMemo } from 'react';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { enUS } from 'date-fns/locale/en-US';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Provider } from 'react-redux';
import ErrorBoundary from '@fuse/utils/ErrorBoundary';
import AppContext from 'src/contexts/AppContext';

import { FuseSettingsProvider } from '@fuse/core/FuseSettings/FuseSettingsProvider';
import { I18nProvider } from '@i18n/I18nProvider';
import store from '../store/store';
import MainThemeProvider from '../contexts/MainThemeProvider';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '../lib/queryClient';
import { FuseMessageProvider } from '../contexts/FuseMessageContext';
import { FuseDialogProvider } from '../contexts/FuseDialogContext';
import { NavigationProvider } from '../contexts/NavigationContext';
import { NavbarProvider } from '../contexts/NavbarContext';
import { QuickPanelProvider } from '../contexts/QuickPanelContext';

type AppProps = {
	children?: React.ReactNode;
};

/**
 * The main App component.
 */
function App(props: AppProps) {
	const { children } = props;
	const val = useMemo(() => ({}), []);

	return (
		<ErrorBoundary>
			<AppContext.Provider value={val}>
				{/* Date Picker Localization Provider */}
				<LocalizationProvider
					dateAdapter={AdapterDateFns}
					adapterLocale={enUS}
				>
					<QueryClientProvider client={queryClient}>
						{/* Redux Store Provider */}
						<Provider store={store}>
							<FuseSettingsProvider>
								<I18nProvider>
									{/* Theme Provider */}
									<MainThemeProvider>
										<NavigationProvider>
											<NavbarProvider>
												<QuickPanelProvider>
													<FuseDialogProvider>
														<FuseMessageProvider>
															{/* Notistack Notification Provider */}
															<SnackbarProvider
																maxSnack={5}
																anchorOrigin={{
																	vertical: 'bottom',
																	horizontal: 'right'
																}}
																classes={{
																	containerRoot: 'bottom-0 right-0 mb-52 md:mb-68 mr-8 lg:mr-80 z-99'
																}}
															>
																{children}
															</SnackbarProvider>
														</FuseMessageProvider>
													</FuseDialogProvider>
												</QuickPanelProvider>
											</NavbarProvider>
										</NavigationProvider>
									</MainThemeProvider>
								</I18nProvider>
							</FuseSettingsProvider>
						</Provider>
						<ReactQueryDevtools initialIsOpen={false} />
					</QueryClientProvider>
				</LocalizationProvider>
			</AppContext.Provider>
		</ErrorBoundary>
	);
}

export default App;
