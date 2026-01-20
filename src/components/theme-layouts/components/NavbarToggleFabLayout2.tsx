import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import NavbarToggleFab from 'src/components/theme-layouts/components/navbar/NavbarToggleFab';
import { useNavbar } from 'src/contexts/NavbarContext';

type NavbarToggleFabLayout2Props = {
	className?: string;
};

/**
 * The navbar toggle fab layout 2.
 */
function NavbarToggleFabLayout2(props: NavbarToggleFabLayout2Props) {
	const { className } = props;

	const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));

	const { navbarToggle, navbarToggleMobile } = useNavbar();

	return (
		<NavbarToggleFab
			className={className}
			onClick={() => {
				isMobile ? navbarToggleMobile() : navbarToggle();
			}}
		/>
	);
}

export default NavbarToggleFabLayout2;
