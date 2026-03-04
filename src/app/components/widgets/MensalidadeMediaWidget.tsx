import { useMemo, useState } from 'react';
import { useSessionUrlFilter } from '@auth/useSessionUrlFilter';
import { useTheme, alpha } from '@mui/material/styles';
import { format } from 'date-fns';
import { KPICard } from '../../components/charts';
import { useMensalidadeMedia, useMensalidadeMediaPorConvenio } from '../../hooks/useDashboard';
import WidgetLoading from '../../components/ui/WidgetLoading';
import { Box, MenuItem, Select } from '@mui/material';

interface MensalidadeMediaWidgetProps {
  initialIsFavorite?: boolean;
}

export function MensalidadeMediaWidget({ initialIsFavorite }: MensalidadeMediaWidgetProps) {
  const theme = useTheme();
  const [selectedDate, setSelectedDate] = useSessionUrlFilter<Date | null>(
    'financeiro_mens_media_selectedDate',
    new Date(),
    (d) => (d ? d.toISOString() : ''),
    (s) => (s ? new Date(s) : null)
  );

  const [selectedConvenio, setSelectedConvenio] = useSessionUrlFilter<string>(
    'financeiro_mens_media_convenio',
    'Todos'
  );

  const apiDate = useMemo(() => {
    if (!selectedDate) return undefined;
    return format(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1), 'yyyy-MM-dd');
  }, [selectedDate]);

  const { data: mensalidadeData, isLoading: isLoadingGeral } = useMensalidadeMedia(apiDate);
  const { data: convenioData, isLoading: isLoadingConvenio } = useMensalidadeMediaPorConvenio(apiDate);

  const isLoading = isLoadingGeral || isLoadingConvenio;

  const kpiData = useMemo(() => {
    if (!mensalidadeData) return null;

    let displayData = {
      average: mensalidadeData.average,
      percentageChange: mensalidadeData.percentageChange,
      message: mensalidadeData.message || 'média mensal',
    };

    if (selectedConvenio !== 'Todos' && convenioData) {
      const cov = convenioData.find((c: any) => c.nomeConvenio === selectedConvenio);
      if (cov) {
        displayData = {
          average: cov.average,
          percentageChange: cov.percentageChange,
          message: `média mensal - ${cov.nomeConvenio}`,
        };
      } else {
        displayData = {
          average: 0,
          percentageChange: 0,
          message: `média mensal - ${selectedConvenio} (sem dados)`,
        };
      }
    }

    return {
      title: 'Mensalidade Média',
      value: displayData.average || 0,
      subtitle: displayData.message,
      icon: 'heroicons-outline:currency-dollar',
      gradientColors: [theme.palette.info.main, theme.palette.info.dark] as [string, string],
      trend: {
        value: `${displayData.percentageChange > 0 ? '+' : ''}${displayData.percentageChange}% vs mês anterior`,
        isPositive: displayData.percentageChange >= 0,
      },
      widgetId: 6,
    };
  }, [mensalidadeData, convenioData, selectedConvenio, theme]);

  const conveniosOptions = useMemo(() => {
    if (!convenioData) return [];
    return Array.from(new Set(convenioData.map((c: any) => c.nomeConvenio))).sort();
  }, [convenioData]);

  const actionNode = (
    <Box>
      <Select
        size="small"
        value={selectedConvenio}
        onChange={(e) => setSelectedConvenio(e.target.value)}
        MenuProps={{
          PaperProps: {
            sx: {
              mt: 1,
              borderRadius: 2,
              boxShadow: (theme) => theme.shadows[8],
              maxHeight: 300
            }
          }
        }}
        sx={{
          height: '38px',
          borderRadius: '14px',
          background: alpha('#ffffff', 0.15),
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha('#ffffff', 0.2)}`,
          color: 'white',
          '& .MuiSelect-select': {
            py: 0.875,
            px: 2,
            minHeight: 'auto',
            display: 'flex',
            alignItems: 'center',
            fontWeight: 600,
            fontSize: '1rem',
          },
          '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
          '&:hover': {
            background: alpha('#ffffff', 0.25),
          },
          '& .MuiSvgIcon-root': { color: 'white', opacity: 0.7 }
        }}
      >
        <MenuItem value="Todos">Todos os Convênios</MenuItem>
        {conveniosOptions.map((c: any) => (
          <MenuItem key={c} value={c}>{c}</MenuItem>
        ))}
      </Select>
    </Box>
  );

  if (isLoading) {
    return <WidgetLoading height={160} />;
  }

  if (!kpiData) {
    return null;
  }

  return (
    <KPICard
      {...kpiData}
      value={kpiData.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
      showFilter={true}
      filterDate={selectedDate}
      onFilterChange={setSelectedDate}
      initialIsFavorite={initialIsFavorite}
      actionNode={actionNode}
    />
  );
}
