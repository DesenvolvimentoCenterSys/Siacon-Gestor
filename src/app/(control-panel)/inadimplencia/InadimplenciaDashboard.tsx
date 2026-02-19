'use client';

import { useState } from 'react';
import { Box, Tab, Tabs, Typography } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { useUserFavoriteWidgets } from '../../hooks/useDashboard';
import WidgetLoading from '../../components/ui/WidgetLoading';
import useUser from '@auth/useUser';
import { AccumulatedDelinquencyWidget } from '../../components/widgets/AccumulatedDelinquencyWidget';
import { DailyDelinquencyWidget } from '../../components/widgets/DailyDelinquencyWidget';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

function TabPanel({ children, value, index }: { children: React.ReactNode; value: number; index: number }) {
  return (
    <Box role="tabpanel" hidden={value !== index} sx={{ pt: 3 }}>
      {value === index && children}
    </Box>
  );
}

function InadimplenciaDashboard() {
  const theme = useTheme();
  const { data: user } = useUser();
  const { data: favoriteWidgets, isLoading: isFavoritesLoading } = useUserFavoriteWidgets(
    user?.id ? Number(user.id) : undefined
  );

  const [activeTab, setActiveTab] = useState(0);

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
            Acompanhamento de valores inadimplentes — acumulado mensal e evolução diária
          </Typography>
        </Box>
      </Box>

      {/* Tabs */}
      <Box
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          mb: 0,
          bgcolor: theme.palette.background.paper,
          borderRadius: '12px 12px 0 0',
          px: 2
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          textColor="inherit"
          TabIndicatorProps={{
            style: { backgroundColor: '#B71C1C', height: 3, borderRadius: 3 }
          }}
        >
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FuseSvgIcon size={16}>heroicons-outline:chart-bar</FuseSvgIcon>
                <span>Acumulada Mensal</span>
              </Box>
            }
            sx={{
              fontWeight: 600,
              color: activeTab === 0 ? '#B71C1C' : 'text.secondary',
              minHeight: 48
            }}
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FuseSvgIcon size={16}>heroicons-outline:calendar-days</FuseSvgIcon>
                <span>Diária</span>
              </Box>
            }
            sx={{
              fontWeight: 600,
              color: activeTab === 1 ? '#1565C0' : 'text.secondary',
              minHeight: 48
            }}
          />
        </Tabs>
      </Box>

      {/* Tab panels */}
      <TabPanel value={activeTab} index={0}>
        {isFavoritesLoading ? (
          <WidgetLoading height={520} />
        ) : (
          <AccumulatedDelinquencyWidget
            initialIsFavorite={favoriteWidgets?.some(w => w.dashboardWidgetId === 19 && w.isFavorite)}
          />
        )}
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        {isFavoritesLoading ? (
          <WidgetLoading height={480} />
        ) : (
          <DailyDelinquencyWidget
            initialIsFavorite={favoriteWidgets?.some(w => w.dashboardWidgetId === 20 && w.isFavorite)}
          />
        )}
      </TabPanel>
    </Box>
  );
}

export default InadimplenciaDashboard;
