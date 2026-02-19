import i18n from '@i18n';
import { FuseNavItemType } from '@fuse/core/FuseNavigation/types/FuseNavItemType';
import ar from './navigation-i18n/ar';
import en from './navigation-i18n/en';
import tr from './navigation-i18n/tr';

i18n.addResourceBundle('en', 'navigation', en);
i18n.addResourceBundle('tr', 'navigation', tr);
i18n.addResourceBundle('ar', 'navigation', ar);

/**
 * The navigationConfig object is an array of navigation items for the Fuse application.
 */
const navigationConfig: FuseNavItemType[] = [
	{
		id: 'dashboard',
		title: 'DASHBOARD',
		translate: 'DASHBOARD',
		type: 'item',
		icon: 'heroicons-outline:clipboard-document-check',
		url: 'painel'
	},
	{
		id: 'pessoas',
		title: 'Pessoas',
		type: 'collapse',
		icon: 'heroicons-outline:users',
		children: [
			{
				id: 'cadastros',
				title: 'Cadastros',
				type: 'item',
				icon: 'heroicons-outline:clipboard-document-list',
				url: 'pessoas/cadastros'
			},
			{
				id: 'associados',
				title: 'Associados/Filiados',
				type: 'item',
				icon: 'heroicons-outline:identification',
				url: 'pessoas/associados'
			},
			{
				id: 'beneficiarios',
				title: 'Beneficiários de Planos',
				type: 'item',
				icon: 'heroicons-outline:heart',
				url: 'pessoas/beneficiarios'
			}
		]
	},
	{
		id: 'convenios',
		title: 'Convênios',
		translate: 'Convênios',
		type: 'item',
		icon: 'heroicons-outline:building-office-2',
		url: 'convenios'
	},
	{
		id: 'financeiro',
		title: 'Financeiro',
		translate: 'Financeiro',
		type: 'item',
		icon: 'heroicons-outline:currency-dollar',
		url: 'financeiro'
	},
	{
		id: 'eventos',
		title: 'Eventos',
		translate: 'Eventos',
		type: 'item',
		icon: 'heroicons-outline:ticket',
		url: 'eventos'
	},
	{
		id: 'caixa',
		title: 'Caixa',
		translate: 'Caixa',
		type: 'item',
		icon: 'heroicons-outline:archive-box',
		url: 'caixa'
	}
];

export default navigationConfig;
