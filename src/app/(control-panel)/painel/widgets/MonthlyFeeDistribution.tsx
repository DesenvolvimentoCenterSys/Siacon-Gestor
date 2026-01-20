'use client';

import { useState } from 'react';
import { Card, CardContent, Typography, Box, Tabs, Tab, Select, MenuItem, Checkbox, ListItemText, FormControl, InputLabel, OutlinedInput } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

function MonthlyFeeDistribution() {
  const theme = useTheme();
  const [viewMode, setViewMode] = useState<'age_group' | 'utilization'>('age_group');
  const [selectedIndices, setSelectedIndices] = useState<number[]>([0]);

  const handleModeChange = (event: React.SyntheticEvent, newValue: 'age_group' | 'utilization') => {
    if (newValue !== null) {
      setViewMode(newValue);
      setSelectedIndices([0]); // Reset selection when mode changes
    }
  };

  const handleSelectionChange = (event: any) => {
    const {
      target: { value },
    } = event;
    // On autofill we get a stringified value.
    const newValues = typeof value === 'string' ? value.split(',') : value;
    // Ensure at least one is selected or handle empty
    if (newValues.length === 0) return;
    setSelectedIndices(newValues);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedIndices([newValue]);
  };

  // Data for "Distribuição por Faixa Etária"
  const categoriesAgeGroup = [
    '0-18 anos',
    '19-29 anos',
    '30-44 anos',
    '45-59 anos',
    '60-74 anos',
    '75+ anos',
  ];

  const chartDataAgeGroup = [
    {
      name: 'Geral',
      data: [150, 320, 450, 580, 420, 280],
      color: theme.palette.primary.main,
    },
    {
      name: 'Masculino',
      data: [80, 150, 220, 290, 200, 120],
      color: theme.palette.secondary.main,
    },
    {
      name: 'Feminino',
      data: [70, 170, 230, 290, 220, 160],
      color: '#f59e0b',
    },
  ];

  // Data for "Distribuição de Utilização" (by Convenio)
  const categoriesUtilization = ['Consultas', 'Exames', 'Internações', 'Cirurgias', 'Terapias'];

  const chartDataUtilization = [
    {
      name: 'Unimed',
      data: [450, 320, 80, 40, 150],
      color: '#10b981',
    },
    {
      name: 'OdontoPrev',
      data: [0, 0, 0, 20, 350], // Mostly dental
      color: '#f59e0b',
    },
    {
      name: 'Contr. Sindical',
      data: [200, 150, 30, 10, 80],
      color: '#3b82f6',
    },
  ];

  const isAgeGroup = viewMode === 'age_group';
  const currentData = isAgeGroup ? chartDataAgeGroup : chartDataUtilization;
  const categories = isAgeGroup ? categoriesAgeGroup : categoriesUtilization;

  // Determine which series to show
  const seriesToShow = selectedIndices.map(index => currentData[index]);

  const chartOptions: ApexOptions = {
    chart: {
      type: 'bar',
      fontFamily: theme.typography.fontFamily,
      toolbar: { show: false },
      animations: {
        enabled: true,
        speed: 800,
      },
      stacked: false,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 6,
        columnWidth: '60%',
        dataLabels: {
          position: 'top',
        },
      },
    },
    dataLabels: {
      enabled: true,
      offsetY: -20,
      style: {
        fontSize: '11px',
        fontWeight: 700,
        colors: [theme.palette.text.primary],
      },
      formatter: (val) => {
        const value = typeof val === 'number' ? val : parseFloat(val as string);
        return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value;
      },
    },
    colors: seriesToShow.map(s => s.color),
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 3,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
      padding: { top: 20 },
    },
    xaxis: {
      categories: categories,
      labels: {
        style: {
          colors: theme.palette.text.secondary,
          fontSize: '12px',
          fontWeight: 600,
        },
        rotate: -45,
        rotateAlways: false,
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: {
          colors: theme.palette.text.secondary,
          fontSize: '12px',
          fontWeight: 500,
        },
      },
    },
    tooltip: {
      theme: theme.palette.mode,
      y: {
        formatter: (value) => `${value} ${isAgeGroup ? 'beneficiários' : 'utilizações'}`,
      },
    },
    legend: {
      show: true,
      position: 'bottom',
      itemMargin: { horizontal: 10, vertical: 5 },
    },
  };

  const showMultiSelect = currentData.length > 2;

  return (
    <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.25rem' }}>
              {isAgeGroup ? 'Distribuição de Mensalidades' : 'Distribuição de Utilização'}
            </Typography>

            {/* Mode Toggle */}
            <Tabs
              value={viewMode}
              onChange={(e, val) => handleModeChange(e, val)}
              textColor="primary"
              indicatorColor="primary"
              sx={{
                minHeight: 32,
                '& .MuiTab-root': {
                  minHeight: 32,
                  py: 0,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  minWidth: 80
                }
              }}
            >
              <Tab label="Faixa Etária" value="age_group" />
              <Tab label="Convênio" value="utilization" />
            </Tabs>
          </Box>

          {/* Sub-filters */}
          {showMultiSelect ? (
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel id="multi-filter-label">Filtros</InputLabel>
              <Select
                labelId="multi-filter-label"
                multiple
                value={selectedIndices}
                onChange={handleSelectionChange}
                input={<OutlinedInput label="Filtros" />}
                renderValue={(selected) => selected.map(index => currentData[index].name).join(', ')}
                MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
              >
                {currentData.map((item, index) => (
                  <MenuItem key={item.name} value={index}>
                    <Checkbox checked={selectedIndices.indexOf(index) > -1} />
                    <ListItemText primary={item.name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <Tabs
              value={selectedIndices[0]}
              onChange={handleTabChange}
              textColor="secondary"
              indicatorColor="secondary"
              variant="scrollable"
              scrollButtons="auto"
              sx={{ minHeight: 40, '& .MuiTab-root': { minHeight: 40, py: 0, fontSize: '0.95rem', fontWeight: 600 } }}
            >
              {currentData.map((item, index) => (
                <Tab key={index} label={item.name} />
              ))}
            </Tabs>
          )}
        </Box>

        <Box sx={{ flex: 1, minHeight: { xs: 250, sm: 300, md: 350, lg: 400, xl: 450 } }}>
          <Chart
            options={chartOptions}
            series={seriesToShow}
            type="bar"
            height="100%"
          />
        </Box>
      </CardContent>
    </Card>
  );
}

export default MonthlyFeeDistribution;
