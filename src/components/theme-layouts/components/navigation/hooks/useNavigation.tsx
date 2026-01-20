'use client';

import { useMemo } from 'react';
import i18n from '@i18n';
import useUser from '@auth/useUser';
import { useI18n } from '@i18n/I18nProvider';
import FuseUtils from '@fuse/utils';
import FuseNavigationHelper from '@fuse/utils/FuseNavigationHelper';
import { FuseNavItemType } from '@fuse/core/FuseNavigation/types/FuseNavItemType';
import { useNavigation as useNavigationContext } from 'src/contexts/NavigationContext';

function useNavigation() {
	const { data: user } = useUser();
	const userRole = user?.role;
	const { languageId } = useI18n();

	const { navigation: navigationData } = useNavigationContext();

	const navigation = useMemo(() => {
		function setAdditionalData(data: FuseNavItemType[]): FuseNavItemType[] {
			return data?.map((item) => ({
				hasPermission: Boolean(FuseUtils.hasPermission(item?.auth, userRole)),
				...item,
				...(item?.translate && item?.title ? { title: i18n.t(`navigation:${item?.translate}`) } : {}),
				...(item?.children ? { children: setAdditionalData(item?.children) } : {})
			}));
		}

		const translatedValues = setAdditionalData(navigationData);

		return translatedValues;
	}, [navigationData, languageId, userRole]);

	const flattenNavigation = useMemo(() => {
		return FuseNavigationHelper.flattenNavigation(navigation);
	}, [navigation]);

	return { navigation, flattenNavigation };
}

export default useNavigation;
