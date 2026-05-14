"use client";

import { useMemo, useState } from "react";
import { styled } from "@mui/material/styles";
import FusePageSimple from "@fuse/core/FusePageSimple";
import {
  Box, Grid, useTheme, Card, CardContent,
  InputLabel, Select, FormControl, MenuItem,
  SelectChangeEvent, Button, CircularProgress, Alert,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ptBR } from "date-fns/locale/pt-BR";
import { format } from "date-fns/format";
import { parse } from "date-fns/parse";
import { startOfMonth } from "date-fns/startOfMonth";
import { endOfMonth } from "date-fns/endOfMonth";
import { addMonths } from "date-fns/addMonths";

import ProjectDashboardAppHeader from "../painel/ProjectDashboardAppHeader";
import { PrevisaoFaturamentoVsPagamentoWidget } from "../../components/widgets/PrevisaoFaturamentoVsPagamentoWidget";
import { DetalhamentoPrevisaoFaturamentoDespesaWidget } from "../../components/widgets/DetalhamentoPrevisaoFaturamentoDespesaWidget";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { useDashboardFaturamentoPayload } from '../../hooks/useDashboard';

const Root = styled(FusePageSimple)(({ theme }) => ({
  "& .FusePageSimple-header": { backgroundColor: theme.palette.background.default },
  "& .FusePageSimple-content": { padding: 0 },
}));

function getDefaultStartMonth(): string {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 3, 1);
  return `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}`;
}

function getDefaultEndMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function monthInputToDate(monthStr: string): Date {
  const [year, month] = monthStr.split("-").map(Number);
  return new Date(year, month - 1, 1);
}

function PrevisaoFaturamentoVsPagamentoPage() {
  const theme = useTheme();

  const [dataType, setDataType] = useState<"simulacao" | "previsto_realizado">("simulacao");
  const [searchBy, setSearchBy] = useState("C");
  const [startMonth, setStartMonth] = useState<string>(getDefaultStartMonth());
  const [endMonth, setEndMonth] = useState<string>(getDefaultEndMonth());

  const [appliedDataType, setAppliedDataType] = useState<"simulacao" | "previsto_realizado">(dataType);
  const [appliedSearchBy, setAppliedSearchBy] = useState(searchBy);
  const [appliedStartMonth, setAppliedStartMonth] = useState(startMonth);
  const [appliedEndMonth, setAppliedEndMonth] = useState(endMonth);

  const handleDataTypeChange = (event: SelectChangeEvent) => {
    const newType = event.target.value as "simulacao" | "previsto_realizado";
    setDataType(newType);
    if (newType === "simulacao") setSearchBy("C");
  };

  const handleDateModeFilterChange = (event: SelectChangeEvent) => {
    setSearchBy(event.target.value);
  };

  const handleSearchClick = () => {
    setAppliedDataType(dataType);
    setAppliedSearchBy(searchBy);
    setAppliedStartMonth(startMonth);
    setAppliedEndMonth(endMonth);
  };

  const appliedStartDate = useMemo(() => {
    if (!appliedStartMonth) return undefined;
    return format(startOfMonth(monthInputToDate(appliedStartMonth)), "yyyy-MM-dd");
  }, [appliedStartMonth]);

  const appliedEndDate = useMemo(() => {
    if (!appliedEndMonth) return undefined;
    return format(endOfMonth(monthInputToDate(appliedEndMonth)), "yyyy-MM-dd");
  }, [appliedEndMonth]);

  const isSearchByDisabled = dataType === "simulacao";

  const { data: payload, isLoading, isError } = useDashboardFaturamentoPayload(
    appliedStartDate,
    appliedEndDate,
    appliedDataType,
    appliedSearchBy,
  );

  const parsedStartDateObj = startMonth ? parse(startMonth, "yyyy-MM", new Date()) : null;
  const parsedEndDateObj = endMonth ? parse(endMonth, "yyyy-MM", new Date()) : null;

  return (
    <Root
      scroll="content"
      header={<ProjectDashboardAppHeader pageTitle="Previsão Faturamento VS Pagamento" />}
      content={
        <Box sx={{ width: "100%", px: { xs: 1.5, sm: 2.5, md: 3 }, py: { xs: 1.5, sm: 2, md: 3 } }}>
          <Grid container spacing={{ xs: 2, sm: 3 }}>

            <Grid item xs={12}>
              <Card
                elevation={0}
                sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, overflow: "visible", bgcolor: "background.paper" }}
              >
                <CardContent sx={{ p: { xs: 2, sm: 2.5 }, "&:last-child": { pb: { xs: 2, sm: 2.5 } } }}>
                  <PageHeader
                    title=""
                    subtitle="Comparativo Receita x Despesas (Simulado/Previsto)"
                    icon={
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
                      </svg>
                    }
                  />

                  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
                    <FormControl sx={{ minWidth: "18em", maxWidth: { xs: "none", sm: "18em" }, width: { xs: "100%", sm: "18em" } }}>
                      <InputLabel id="menu-data-type-select">Tipo de dados</InputLabel>
                      <Select labelId="menu-data-type-select" value={dataType} label="Tipo de dados" onChange={handleDataTypeChange}>
                        <MenuItem value="simulacao">Faturamento - Simulação</MenuItem>
                        <MenuItem value="previsto_realizado">Faturamento Previsto/Realizado</MenuItem>
                      </Select>
                    </FormControl>

                    <FormControl sx={{ minWidth: "12em", maxWidth: { xs: "none", sm: "13em" }, width: { xs: "100%", sm: "13em" } }}>
                      <InputLabel id="menu-data-select">Pesquisar por:</InputLabel>
                      <Select labelId="menu-data-select" value={searchBy} label="Pesquisar por:" disabled={isSearchByDisabled} onChange={handleDateModeFilterChange}>
                        <MenuItem value="C">Competência</MenuItem>
                        <MenuItem value="V">Vencimento</MenuItem>
                      </Select>
                    </FormControl>

                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                      <DatePicker
                        views={["year", "month"]}
                        label="Início"
                        openTo="month"
                        value={parsedStartDateObj}
                        maxDate={parsedEndDateObj || undefined}
                        onChange={(v) => setStartMonth(v ? format(v, "yyyy-MM") : "")}
                        slotProps={{ textField: { size: "small", sx: { width: { xs: "100%", sm: "13em" } }, InputLabelProps: { shrink: true } }, popper: { sx: { zIndex: 99999 } } }}
                      />
                      <DatePicker
                        views={["year", "month"]}
                        label="Fim"
                        openTo="month"
                        value={parsedEndDateObj}
                        minDate={parsedStartDateObj || undefined}
                        maxDate={parsedStartDateObj ? addMonths(parsedStartDateObj, 12) : undefined}
                        onChange={(v) => setEndMonth(v ? format(v, "yyyy-MM") : "")}
                        slotProps={{ textField: { size: "small", sx: { width: { xs: "100%", sm: "13em" } }, InputLabelProps: { shrink: true } }, popper: { sx: { zIndex: 99999 } } }}
                      />
                    </LocalizationProvider>

                    {/* Botão de pesquisa ajustado para ocupar 100% no mobile (xs) */}
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSearchClick}
                      disabled={isLoading}
                      startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : undefined}
                      sx={{
                        height: 40,
                        whiteSpace: "nowrap",
                        px: 3,
                        width: { xs: "100%", sm: "auto" },
                      }}
                    >
                      {isLoading ? "Buscando..." : "Pesquisar"}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {isError && (
              <Grid item xs={12}>
                <Alert severity="error">Erro ao carregar os dados. Verifique os filtros e tente novamente.</Alert>
              </Grid>
            )}

            <Grid item xs={12}>
              <PrevisaoFaturamentoVsPagamentoWidget
                data={payload?.resumoGrafico ?? []}
              />
            </Grid>

            <Grid item xs={12}>
              {appliedDataType === 'simulacao' ? (
                <DetalhamentoPrevisaoFaturamentoDespesaWidget
                  dataType="simulacao"
                  data={payload?.tabelaSimulacao ?? null}
                  startDate={appliedStartDate}
                  endDate={appliedEndDate}
                />
              ) : (
                <DetalhamentoPrevisaoFaturamentoDespesaWidget
                  dataType="previsto_realizado"
                  data={payload?.tabelaPrevistoRealizado ?? null}
                  startDate={appliedStartDate}
                  endDate={appliedEndDate}
                />
              )}
            </Grid>

          </Grid>
        </Box>
      }
    />
  );
}

export default PrevisaoFaturamentoVsPagamentoPage;