'use client';

import authRoles from '@auth/authRoles';
import AuthGuardRedirect from '@auth/AuthGuardRedirect';
import ForgotPasswordPage from './ForgotPasswordPage';

function Page() {
	return (
		<AuthGuardRedirect auth={authRoles.onlyGuest}>
			<ForgotPasswordPage />
			</AuthGuardRedirect>
	);
}

export default Page;
