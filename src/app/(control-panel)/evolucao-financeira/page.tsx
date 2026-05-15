"use client";

import { useMemo, useState } from "react";
import { styled } from "@mui/material/styles";
import FusePageSimple from "@fuse/core/FusePageSimple";
import {
  Box, Grid, useTheme, Card, CardContent,
  Button, CircularProgress, Alert, Typography,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ptBR } from "date-fns/locale/pt-BR";
import { format } from "date-fns/format";
import { parse } from "date-fns/parse";
import { startOfMonth } from "date-fns/startOfMonth";
import { endOfMonth } from "date-fns/endOfMonth";
import { differenceInMonths } from "date-fns/differenceInMonths";

import ProjectDashboardAppHeader from "../painel/ProjectDashboardAppHeader";
import { ResumoFinanceiroMensalWidget } from "../../components/widgets/EvolucaoFinanceiraWidget";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { useResumoFinanceiroMensal } from "../../hooks/useDashboard";

const Root = styled(FusePageSimple)(({ theme }) => ({
  "& .FusePageSimple-header": { backgroundColor: theme.palette.background.default },
  "& .FusePageSimple-content": { padding: 0 },
}));

const MAX_MONTHS = 12;

function getDefaultStartMonth(): string {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  return `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}`;
}

function getDefaultEndMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function monthStrToDate(monthStr: string): Date {
  const [year, month] = monthStr.split("-").map(Number);
  return new Date(year, month - 1, 1);
}

function ResumoFinanceiroMensalPage() {
  const theme = useTheme();

  const [startMonth, setStartMonth] = useState<string>(getDefaultStartMonth());
  const [endMonth, setEndMonth] = useState<string>(getDefaultEndMonth());

  const [appliedStart, setAppliedStart] = useState<string>(getDefaultStartMonth());
  const [appliedEnd, setAppliedEnd] = useState<string>(getDefaultEndMonth());

  const rangeError = useMemo<string | null>(() => {
    if (!startMonth || !endMonth) return null;
    const start = monthStrToDate(startMonth);
    const end = monthStrToDate(endMonth);
    if (end < start) return "O período final deve ser igual ou posterior ao período inicial.";
    if (differenceInMonths(end, start) >= MAX_MONTHS) {
      return `O período máximo permitido é de ${MAX_MONTHS} meses.`;
    }
    return null;
  }, [startMonth, endMonth]);

  const handleSearch = () => {
    if (rangeError) return;
    setAppliedStart(startMonth);
    setAppliedEnd(endMonth);
  };

  const apiStartDate = useMemo(() => {
    if (!appliedStart) return undefined;
    return format(startOfMonth(monthStrToDate(appliedStart)), "yyyy-MM-dd");
  }, [appliedStart]);

  const apiEndDate = useMemo(() => {
    if (!appliedEnd) return undefined;
    return format(endOfMonth(monthStrToDate(appliedEnd)), "yyyy-MM-dd");
  }, [appliedEnd]);

  const { data, isLoading, isError } = useResumoFinanceiroMensal(apiStartDate, apiEndDate);

  return (
    <Root
      scroll="content"
      header={<ProjectDashboardAppHeader pageTitle="Evolução Financeira" />}
      content={
        <Box sx={{ width: "100%", px: { xs: 1.5, sm: 2.5, md: 3 }, py: { xs: 1.5, sm: 2, md: 3 } }}>
          <Grid container spacing={{ xs: 2, sm: 3 }}>

            <Grid item xs={12}>
              <Card
                elevation={0}
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  bgcolor: "background.paper",
                  overflow: "visible",
                }}
              >
                <CardContent sx={{ p: { xs: 2, sm: 2.5 }, "&:last-child": { pb: { xs: 2, sm: 2.5 } } }}>
                  <PageHeader
                    title=""
                    subtitle="Visão consolidada de Faturamento, Receita, Despesas e Lucro por mês"
                    icon={
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                      </svg>
                    }
                  />

                  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "flex-start", mt: 1 }}>
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                      <DatePicker
                        views={["year", "month"]}
                        label="Período Inicial"
                        openTo="month"
                        value={startMonth ? parse(startMonth, "yyyy-MM", new Date()) : null}
                        onChange={(v) => setStartMonth(v ? format(v, "yyyy-MM") : "")}
                        slotProps={{
                          textField: {
                            size: "small",
                            sx: { width: { xs: "100%", sm: "14em" } },
                            InputLabelProps: { shrink: true },
                          },
                          popper: { sx: { zIndex: 99999 } },
                        }}
                      />

                      <DatePicker
                        views={["year", "month"]}
                        label="Período Final"
                        openTo="month"
                        value={endMonth ? parse(endMonth, "yyyy-MM", new Date()) : null}
                        onChange={(v) => setEndMonth(v ? format(v, "yyyy-MM") : "")}
                        slotProps={{
                          textField: {
                            size: "small",
                            sx: { width: { xs: "100%", sm: "14em" } },
                            InputLabelProps: { shrink: true },
                          },
                          popper: { sx: { zIndex: 99999 } },
                        }}
                      />
                    </LocalizationProvider>

                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSearch}
                      disabled={isLoading || !startMonth || !endMonth || !!rangeError}
                      startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : undefined}
                      sx={{ height: 40, 
                        px: 3, 
                        whiteSpace: "nowrap",
                        width: { xs: "100%", sm: "auto" }}}
                    >
                      {isLoading ? "Buscando..." : "Pesquisar"}
                    </Button>
                  </Box>

                  {rangeError && (
                    <Alert severity="warning" sx={{ mt: 1.5, py: 0.5 }}>
                      {rangeError}
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {isError && (
              <Grid item xs={12}>
                <Alert severity="error">
                  Erro ao carregar os dados. Verifique o período selecionado e tente novamente.
                </Alert>
              </Grid>
            )}

            <Grid item xs={12}>
              <ResumoFinanceiroMensalWidget data={data} isLoading={isLoading} />
            </Grid>

          </Grid>
        </Box>
      }
    />
  );
}

export default ResumoFinanceiroMensalPage;