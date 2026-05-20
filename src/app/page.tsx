import { redirect } from 'next/navigation';

function MainPage() {
	redirect(`/resumo-geral`);
	return null;
}

export default MainPage;
