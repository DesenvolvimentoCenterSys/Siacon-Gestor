'use client';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import _ from 'lodash';
import useUser from '@auth/useUser';
import { useNavbar } from 'src/contexts/NavbarContext';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';

type ProjectDashboardAppHeaderProps = {
  pageTitle?: string;
};

function ProjectDashboardAppHeader({ pageTitle }: ProjectDashboardAppHeaderProps) {
  const { data: user, isGuest } = useUser();
  const { navbarToggleMobile } = useNavbar();
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('md'));

  return (
    <div className="flex flex-col w-full px-6 sm:px-8">
      <div className="flex flex-col sm:flex-row flex-auto sm:items-center min-w-0 my-16 sm:my-24">
        <div className="flex flex-auto items-start min-w-0">

          <Avatar
            sx={{
              background: (theme) => theme.palette.secondary.main,
              color: (theme) => theme.palette.common.white,
              fontWeight: 600
            }}
            className="flex-0 w-64 h-64 mt-4"
            alt="user photo"
            src={user?.photoURL}
          >
            {_.toUpper(user?.displayName?.[0])}
          </Avatar>
          <div className="flex flex-col min-w-0 mx-16">
            {pageTitle ? (
              <>
                <Typography className="text-lg font-medium tracking-tight text-secondary leading-6">
                  {_.startCase(_.toLower(user?.displayName || user?.email))}
                </Typography>
                <Typography className="text-2xl md:text-5xl font-semibold tracking-tight leading-7 md:leading-snug truncate text-primary">
                  {pageTitle}
                </Typography>
              </>
            ) : (
              <Typography className="text-2xl md:text-5xl font-semibold tracking-tight leading-7 md:leading-snug truncate text-primary">
                {isGuest ? 'Hi Guest!' : `Bem vindo ${_.startCase(_.toLower(user?.displayName || user?.email))}!`}
              </Typography>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectDashboardAppHeader;
