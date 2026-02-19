'use client';

import { useState } from 'react';
import { Box, Tab, Tabs, Typography } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { useUserFavoriteWidgets } from '../../hooks/useDashboard';
import WidgetLoading from '../../components/ui/WidgetLoading';
import useUser from '@auth/useUser';
import { AccumulatedDelinquencyWidget } from '../../components/widgets/AccumulatedDelinquencyWidget';
import { DailyDelinquencyWidget } from '../../components/widgets/DailyDelinquencyWidget';
import { DelinquencyAgingWidget } from '../../components/widgets/DelinquencyAgingWidget';
import { DelinquencySummaryWidget } from '../../components/widgets/DelinquencySummaryWidget';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

function TabPanel({ children, value, index }: { children: React.ReactNode; value: number; index: number }) {
  return (
    <Box role="tabpanel" hidden={value !== index} sx={{ pt: 3 }}>
      {value === index && children}
    </Box>
  );
}

const TABS = [
  { label: 'Acumulada Mensal', icon: 'heroicons-outline:chart-bar', color: '#B71C1C' },
  { label: 'Diária', icon: 'heroicons-outline:calendar-days', color: '#1565C0' },
  { label: 'Envelhecimento', icon: 'heroicons-outline:clock', color: '#EF6C00' },
  { label: 'Resumo', icon: 'heroicons-outline:chart-pie', color: '#4A148C' }
];

function InadimplenciaDashboard() {
  const theme = useTheme();
  const { data: user } = useUser();
  const { data: favoriteWidgets, isLoading: isFavoritesLoading } = useUserFavoriteWidgets(
    user?.id ? Number(user.id) : undefined
  );

  const [activeTab, setActiveTab] = useState(0);
  const activeColor = TABS[activeTab].color;

  return (
    <Box sx={{ width: '100%' }}>
      {/* Page title */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 44, height: 44, borderRadius: 2,
            bgcolor: alpha('#B71C1C', 0.1),
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          <FuseSvgIcon sx={{ color: '#B71C1C' }} size={24}>heroicons-outline:exclamation-triangle</FuseSvgIcon>
        </Box>
        <Box>
          <Typography variant="h5" fontWeight={700}>Inadimplência</Typography>
          <Typography variant="caption" color="text.secondary">
            Acompanhamento de valores inadimplentes — acumulado mensal, evolução diária e aging
          </Typography>
        </Box>
      </Box>

      {/* Tabs */}
      <Box
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: theme.palette.background.paper,
          borderRadius: '12px 12px 0 0',
          px: 2
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          textColor="inherit"
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          TabIndicatorProps={{
            style: { backgroundColor: activeColor, height: 3, borderRadius: 3 }
          }}
        >
          {TABS.map((tab, i) => (
            <Tab
              key={tab.label}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FuseSvgIcon size={16}>{tab.icon}</FuseSvgIcon>
                  <span>{tab.label}</span>
                </Box>
              }
              sx={{
                fontWeight: 600,
                color: activeTab === i ? tab.color : 'text.secondary',
                minHeight: 48,
                transition: 'color 0.2s'
              }}
            />
          ))}
        </Tabs>
      </Box>

      {/* Tab panels */}
      <TabPanel value={activeTab} index={0}>
        {isFavoritesLoading ? <WidgetLoading height={520} /> : (
          <AccumulatedDelinquencyWidget
            initialIsFavorite={favoriteWidgets?.some(w => w.dashboardWidgetId === 19 && w.isFavorite)}
          />
        )}
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        {isFavoritesLoading ? <WidgetLoading height={480} /> : (
          <DailyDelinquencyWidget
            initialIsFavorite={favoriteWidgets?.some(w => w.dashboardWidgetId === 20 && w.isFavorite)}
          />
        )}
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        {isFavoritesLoading ? <WidgetLoading height={480} /> : (
          <DelinquencyAgingWidget
            initialIsFavorite={favoriteWidgets?.some(w => w.dashboardWidgetId === 21 && w.isFavorite)}
          />
        )}
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
        {isFavoritesLoading ? <WidgetLoading height={480} /> : (
          <DelinquencySummaryWidget
            initialIsFavorite={favoriteWidgets?.some(w => w.dashboardWidgetId === 22 && w.isFavorite)}
          />
        )}
      </TabPanel>
    </Box>
  );
}

export default InadimplenciaDashboard;
