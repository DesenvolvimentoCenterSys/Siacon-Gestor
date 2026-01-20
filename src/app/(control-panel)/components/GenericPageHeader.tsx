'use client';

import Typography from '@mui/material/Typography';

type GenericPageHeaderProps = {
  title: string;
  subtitle?: string;
};

function GenericPageHeader({ title, subtitle }: GenericPageHeaderProps) {
  return (
    <div className="flex flex-col w-full px-6 sm:px-8">
      <div className="flex flex-col sm:flex-row flex-auto sm:items-center min-w-0 my-16 sm:my-24">
        <div className="flex flex-auto items-start min-w-0">
          <div className="flex flex-col min-w-0">
            <Typography className="text-2xl md:text-5xl font-semibold tracking-tight leading-7 md:leading-snug truncate text-primary">
              {title}
            </Typography>
            {subtitle && (
              <Typography className="font-medium text-secondary" variant="subtitle1">
                {subtitle}
              </Typography>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GenericPageHeader;
