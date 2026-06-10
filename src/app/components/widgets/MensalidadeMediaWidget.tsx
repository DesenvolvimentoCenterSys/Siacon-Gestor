import { useMemo, useEffect } from 'react';
import { useSessionUrlFilter } from '@auth/useSessionUrlFilter';
import { useTheme, alpha } from '@mui/material/styles';
import { format } from 'date-fns';
import { KPICard } from '../../components/charts';
import { useMensalidadeMedia, useMensalidadeMediaPorConvenio } from '../../hooks/useDashboard';
import WidgetLoading from '../../components/ui/WidgetLoading';
import { Box, MenuItem, Select } from '@mui/material';

interface MensalidadeMediaWidgetProps {
  startDate?: Date | null;
  endDate?: Date | null;
  initialIsFavorite?: boolean;
}

export function MensalidadeMediaWidget({ startDate, endDate, initialIsFavorite }: MensalidadeMediaWidgetProps) {
  const theme = useTheme();

  const [selectedDate, setSelectedDate] = useSessionUrlFilter<Date | null>(
    'financeiro_mens_media_selectedDate',
    new Date(),
    (d) => (d ? d.toISOString() : ''),
    (s) => (s ? new Date(s) : null)
  );

  const startStr = useMemo(() => {
    if (startDate) return format(startDate, 'yyyy-MM-dd');
    if (selectedDate)
      return format(
        new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
        'yyyy-MM-dd',
      );
    return undefined;
  }, [startDate, selectedDate]);

  const endStr = useMemo(() => {
    if (endDate) return format(endDate, 'yyyy-MM-dd');
    if (selectedDate)
      return format(
        new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0),
        'yyyy-MM-dd',
      );
    return undefined;
  }, [endDate, selectedDate]);

  // Inicia vazio — será preenchido com o primeiro convênio assim que os dados chegarem
  const [selectedConvenio, setSelectedConvenio] = useSessionUrlFilter<string>(
    'financeiro_mens_media_convenio',
    ''
  );

  // Filtro externo tem prioridade sobre o picker interno
  const effectiveDate = startDate ?? selectedDate;

  const apiDate = useMemo(() => {
    if (!effectiveDate) return undefined;
    return format(new Date(effectiveDate.getFullYear(), effectiveDate.getMonth(), 1), 'yyyy-MM-dd');
  }, [effectiveDate]);

  const { data: mensalidadeData, isLoading: isLoadingGeral } = useMensalidadeMedia(startStr, endStr);
  const { data: convenioData, isLoading: isLoadingConvenio } = useMensalidadeMediaPorConvenio(startStr, endStr);

  const isLoading = isLoadingGeral || isLoadingConvenio;

useEffect(() => {
  if (convenioData && convenioData.length > 0) {
    const sorted = [...convenioData].sort((a: any, b: any) =>
      a.nomeConvenio.localeCompare(b.nomeConvenio)
    );
    const validOptions = sorted.map((c: any) => c.nomeConvenio);
    
    if (!selectedConvenio || !validOptions.includes(selectedConvenio)) {
      setSelectedConvenio(sorted[0].nomeConvenio);
    }
  }
}, [convenioData]);

  const kpiData = useMemo(() => {
    if (!mensalidadeData) return null;

    let displayData = {
      average: mensalidadeData.average,
      percentageChange: mensalidadeData.percentageChange,
      message: mensalidadeData.message || 'média do período',
    };

    if (selectedConvenio && convenioData) {
      const cov = convenioData.find((c: any) => c.nomeConvenio === selectedConvenio);
      if (cov) {
        displayData = {
          average: cov.average,
          percentageChange: cov.percentageChange,
          message: `média do período - ${cov.nomeConvenio}`,
        };
      } else {
        displayData = {
          average: 0,
          percentageChange: 0,
          message: `média do período - ${selectedConvenio} (sem dados)`,
        };
      }
    }

    let trendObj;

    if (selectedConvenio && convenioData) {
      const cov = convenioData.find((c: any) => c.nomeConvenio === selectedConvenio);
      const formattedPrevious = cov?.previousAverage != null
    ? cov.previousAverage.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    : '';
      trendObj = {
        value: (
          <>
            {displayData.percentageChange > 0 ? '+' : ''}
            {displayData.percentageChange}% vs período anterior
            <br />
            {cov?.periodoAnterior} = {formattedPrevious}
          </>
        ),
        isPositive: displayData.percentageChange >= 0,
      };
    } else {
      const formattedPrevious = mensalidadeData?.previousAverage != null
    ? mensalidadeData.previousAverage.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    : '';
      trendObj = {
        value: (
          <>
            {displayData.percentageChange > 0 ? '+' : ''}
            {displayData.percentageChange}% vs período anterior
            <br />
            {mensalidadeData.periodoAnterior} = {formattedPrevious}
          </>
        ),
        isPositive: displayData.percentageChange >= 0,
      };
    }

    return {
      title: 'Mensalidade Média',
      value: displayData.average || 0,
      subtitle: displayData.message,
      icon: 'heroicons-outline:currency-dollar',
      gradientColors: [theme.palette.info.main, theme.palette.info.dark] as [string, string],
      trend: trendObj as any,
      widgetId: 6,
    };
  }, [mensalidadeData, convenioData, selectedConvenio, theme]);


  const conveniosOptions = useMemo(() => {
    if (!convenioData) return [];
    return Array.from(new Set(convenioData.map((c: any) => c.nomeConvenio))).sort() as string[];
  }, [convenioData]);

  const actionNode = (
    <Box>
      <Select
        size="small"
        value={selectedConvenio}
        onChange={(e) => setSelectedConvenio(e.target.value)}
        displayEmpty
        MenuProps={{
          PaperProps: {
            sx: { mt: 1, borderRadius: 2, boxShadow: (t) => t.shadows[8], maxHeight: 300 },
          },
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
          '&:hover': { background: alpha('#ffffff', 0.25) },
          '& .MuiSvgIcon-root': { color: 'white', opacity: 0.7 },
        }}
      >
        {conveniosOptions.map((c) => (
          <MenuItem key={c} value={c}>{c}</MenuItem>
        ))}
      </Select>
    </Box>
  );

  if (isLoading) return <WidgetLoading height={160} />;
  if (!kpiData) return null;

  return (
    <KPICard
      {...kpiData}
      value={kpiData.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
      showFilter={!startDate}
      filterDate={effectiveDate}
      onFilterChange={setSelectedDate}
      initialIsFavorite={initialIsFavorite}
      actionNode={actionNode}
    />
  );
}