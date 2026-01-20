import { forwardRef, CSSProperties, ReactNode } from 'react';
import NextLink from 'next/link';
import usePathname from '@fuse/hooks/usePathname';
import clsx from 'clsx';

export type NavLinkAdapterPropsType = {
	activeClassName?: string;
	activeStyle?: CSSProperties;
	children?: ReactNode;
	to?: string;
	href?: string;
	className?: string;
	style?: CSSProperties;
	role?: string;
	exact?: boolean;
};

/**
 * The NavLinkAdapter component is a wrapper around the Next.js Link component.
 * It adds the ability to add active styles based on the current pathname.
 * The component is memoized to prevent unnecessary re-renders.
 */
const NavLinkAdapter = forwardRef<HTMLAnchorElement, NavLinkAdapterPropsType>((props, ref) => {
	const { activeClassName = 'active', activeStyle, role = 'button', to, href, exact = false, ..._props } = props;
	const pathname = usePathname();
	const targetUrl = to || href;

	// Garantir que a URL seja absoluta, se não for
	const absoluteUrl = targetUrl?.startsWith('/') ? targetUrl : `/${targetUrl}`;

	const isActive = exact ? pathname === absoluteUrl : pathname.startsWith(absoluteUrl);

	return (
		<NextLink
			href={absoluteUrl}
			ref={ref}
			role={role}
			className={clsx(
				_props.className,
				isActive ? activeClassName : '',
				pathname === absoluteUrl && 'pointer-events-none'
			)}
			style={isActive ? { ..._props.style, ...activeStyle } : _props.style}
		>
			{props.children}
		</NextLink>
	);
});

export default NavLinkAdapter;
