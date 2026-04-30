import { redirect } from 'next/navigation';

function MainPage() {
	redirect(`/dashboard-geral`);
	return null;
}

export default MainPage;
