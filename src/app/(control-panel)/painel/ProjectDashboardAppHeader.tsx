'use client';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import _ from 'lodash';
import { darken } from '@mui/material/styles';
import useUser from '@auth/useUser';

function ProjectDashboardAppHeader() {
  const { data: user, isGuest } = useUser();
  return (
    <div className="flex flex-col w-full px-24 sm:px-32">
      <div className="flex flex-col sm:flex-row flex-auto sm:items-center min-w-0 my-32 sm:my-48">
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
            {user?.displayName?.[0]}
          </Avatar>
          <div className="flex flex-col min-w-0 mx-16">
            <Typography className="text-2xl md:text-5xl font-semibold tracking-tight leading-7 md:leading-snug truncate text-primary">
              {isGuest ? 'Hi Guest!' : `Bem vindo ${user?.displayName || user?.email}!`}
            </Typography>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectDashboardAppHeader;
