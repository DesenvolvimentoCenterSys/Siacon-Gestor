import { redirect } from 'next/navigation';

function MainPage() {
	redirect(`/painel`);
	return null;
}

export default MainPage;
