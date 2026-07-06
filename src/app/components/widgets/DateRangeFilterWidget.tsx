"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Autocomplete,
  Checkbox,
  Chip,
  TextField,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { RestartAlt } from "@mui/icons-material";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ptBR } from "date-fns/locale";
import type { FiltroOption } from "../../hooks/useDateFilter";
import { useFilterOptions } from "../../hooks/useDashboard";

type Props = {
  startDate: Date | null;
  endDate: Date | null;
  tab: string;
  convenios?: FiltroOption[];
  servicos?: FiltroOption[];
  centrosCusto?: FiltroOption[];
  planosContas?: FiltroOption[];
  setStartDate: (date: Date | null) => void;
  setEndDate: (date: Date | null) => void;
  setTab: (tab: string) => void;
  setConvenios?: (val: FiltroOption[]) => void;
  setServicos?: (val: FiltroOption[]) => void;
  setCentrosCusto?: (val: FiltroOption[]) => void;
  setPlanosContas?: (val: FiltroOption[]) => void;
  reset: () => void;
};

export function DateRangeFilterWidget({
  startDate,
  endDate,
  tab,
  convenios = [],
  servicos = [],
  centrosCusto = [],
  planosContas = [],
  setStartDate,
  setEndDate,
  setTab,
  setConvenios,
  setServicos,
  setCentrosCusto,
  setPlanosContas,
  reset,
}: Props) {
  const [tempStart, setTempStart] = useState<Date | null>(startDate);
  const [tempEnd, setTempEnd] = useState<Date | null>(endDate);
  const [tempTab, setTempTab] = useState<string>(tab || "competencia");
  const [tempConvenios, setTempConvenios] = useState<FiltroOption[]>(convenios);
  const [tempServicos, setTempServicos] = useState<FiltroOption[]>(servicos);
  const [tempCentrosCusto, setTempCentrosCusto] = useState<FiltroOption[]>(centrosCusto);
  const [tempPlanosContas, setTempPlanosContas] = useState<FiltroOption[]>(planosContas);

  const { data: filterOptionsData, isLoading } = useFilterOptions();

  const opcoesConvenios = filterOptionsData?.convenios || [];
  const opcoesServicos = filterOptionsData?.servicos || [];
  const opcoesCentrosCusto = filterOptionsData?.centrosCusto || [];
  const opcoesPlanosContas = filterOptionsData?.planosConta || [];

  useEffect(() => {
    setTempStart(startDate);
    setTempEnd(endDate);
    setTempTab(tab || "competencia");
    setTempConvenios(convenios);
    setTempServicos(servicos);
    setTempCentrosCusto(centrosCusto);
    setTempPlanosContas(planosContas);
  }, [startDate, endDate, tab, convenios, servicos, centrosCusto, planosContas]);

  const handlePesquisar = () => {
    setStartDate(tempStart);
    setEndDate(tempEnd);
    setTab(tempTab);
    if (setConvenios) setConvenios(tempConvenios);
    if (setServicos) setServicos(tempServicos);
    if (setCentrosCusto) setCentrosCusto(tempCentrosCusto);
    if (setPlanosContas) setPlanosContas(tempPlanosContas);
  };

  const renderMultiSelect = (
    label: string,
    value: FiltroOption[],
    setter: (val: FiltroOption[]) => void,
    opcoesFuturasDaAPI: FiltroOption[] = [],
  ) => (
    <Autocomplete
      multiple
      size="small"
      limitTags={2}
      disableCloseOnSelect
      options={opcoesFuturasDaAPI}
      getOptionLabel={(option) => option.nome}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      value={value}
      onChange={(_, newValue) => setter(newValue)}
      loading={isLoading}
      renderOption={(props, option, { selected }) => {
        const { key, ...restProps } = props as any;
        return (
          <li
            key={option.id || option.nome}
            {...restProps}
            style={{ padding: "6px 10px" }}
          >
            <Checkbox style={{ marginRight: 8 }} checked={selected} size="small" />
            <Typography
              variant="body2"
              sx={{
                lineHeight: 1.4,
                whiteSpace: "normal",
                overflowWrap: "anywhere",
                wordBreak: "break-word",
              }}
            >
              {option.nome}
            </Typography>
          </li>
        );
      }}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => (
          <Chip
            {...getTagProps({ index })}
            key={option.id || option.nome}
            label={option.nome}
            size="small"
            sx={{
              height: "auto",
              minHeight: 24,
              maxWidth: "100%",
              alignItems: "flex-start",
              py: 0.25,
              "& .MuiChip-label": {
                whiteSpace: "normal",
                lineHeight: 1.25,
                overflowWrap: "anywhere",
                wordBreak: "break-word",
                py: 0.25,
              },
            }}
          />
        ))
      }
      renderInput={(params) => (
        <TextField {...params} label={label} placeholder="Buscar..." />
      )}
      sx={{
        flex: { xs: "1 1 100%", sm: "0 1 auto" },
        minWidth: { sm: "180px" },
        maxWidth: { xs: "100%", sm: "260px", md: "300px" },
        width: { xs: "100%", sm: "auto" },
        "& .MuiAutocomplete-inputRoot": {
          flexWrap: "wrap",
          alignItems: "flex-start",
          minHeight: 40,
          py: 0.25,
        },
        "& .MuiAutocomplete-input": {
          minHeight: 20,
          paddingTop: 0,
          paddingBottom: 0,
        },
        "& .MuiAutocomplete-tag": {
          margin: 0.25,
          maxWidth: "100%",
        },
      }}
    />
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: { xs: 1.5, sm: 2 },
        p: { xs: 1.5, sm: 2 },
        mb: 3,
        borderRadius: 2,
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
        Filtros Globais
      </Typography>

      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 1, sm: 1.5, md: 2 },
            alignItems: { xs: "stretch", sm: "center" },
            flexWrap: "wrap",
          }}
        >
          {/* Data inicial */}
          <DatePicker
            label="Data inicial"
            value={tempStart}
            onChange={(val) => setTempStart(val)}
            maxDate={tempEnd ?? undefined}
            slotProps={{
              textField: {
                size: "small",
                sx: { 
                  width: { xs: "100%", sm: "auto" },
                  minWidth: { sm: "140px" },
                  flex: { xs: "1 1 100%", sm: "0 1 auto" },
                },
              },
            }}
          />

          {/* Data final */}
          <DatePicker
            label="Data final"
            value={tempEnd}
            onChange={(val) => setTempEnd(val)}
            minDate={tempStart ?? undefined}
            slotProps={{
              textField: {
                size: "small",
                sx: { 
                  width: { xs: "100%", sm: "auto" },
                  minWidth: { sm: "140px" },
                  flex: { xs: "1 1 100%", sm: "0 1 auto" },
                },
              },
            }}
          />

          {/* Toggle Competência / Vencimento */}
          <ToggleButtonGroup
            value={tempTab}
            exclusive
            onChange={(_, val) => { if (val) setTempTab(val); }}
            size="small"
            aria-label="Filtrar por"
            sx={{
              minHeight: 44,
              flex: { xs: "1 1 100%", sm: "0 1 auto" },
              bgcolor: "#111111",
              border: "1px solid #333",
              borderRadius: "5px !important",
              overflow: "hidden",
              "& .MuiToggleButtonGroup-grouped": {
                border: "none !important",
                borderRadius: "0 !important",
                margin: "0 !important",
              },
              "& .MuiToggleButton-root": {
                flex: { xs: 1, sm: "initial" },
                px: { xs: 1.5, sm: 2 },
                py: 1,
                color: "#a3a3a3",
                bgcolor: "transparent",
                fontSize: { xs: "0.95rem", sm: "1rem" },
                fontWeight: 500,
                letterSpacing: "0.02em",
                transition: "all 0.15s ease",
                "&:hover": {
                  bgcolor: "#222222",
                  color: "#cccccc",
                },
              },
              "& .MuiToggleButton-root.Mui-selected": {
                bgcolor: "#ffffff !important",
                color: "#1976d2 !important",
                fontWeight: 700,
                boxShadow: "inset 0 0 0 2px #1976d2",
                outline: "2px solid #1976d2",
                outlineOffset: "-2px",
                "&:hover": {
                  bgcolor: "#f0f0f0 !important",
                  color: "#1565c0 !important",
                },
              },
            }}
          >
            <ToggleButton value="competencia">Competência</ToggleButton>
            <ToggleButton value="vencimento">Vencimento</ToggleButton>
          </ToggleButtonGroup>

          {renderMultiSelect("Convênios", tempConvenios, setTempConvenios, opcoesConvenios)}
          {renderMultiSelect("Serviços", tempServicos, setTempServicos, opcoesServicos)}

          <Button
            variant="outlined"
            size="small"
            startIcon={<RestartAlt />}
            onClick={reset}
            sx={{
              flex: { xs: "1 1 100%", sm: "0 1 auto" },
              height: 40,
              color: "text.secondary",
              whiteSpace: "nowrap",
              borderColor: "divider",
              minWidth: { sm: "120px" },
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            Limpar Filtros
          </Button>

          <Button
            variant="contained"
            onClick={handlePesquisar}
            startIcon={
              <FuseSvgIcon size={18}>heroicons-outline:magnifying-glass</FuseSvgIcon>
            }
            sx={{
              flex: { xs: "1 1 100%", sm: "0 1 auto" },
              height: 40,
              bgcolor: "#000000",
              color: "#ffffff",
              boxShadow: "none",
              minWidth: { sm: "110px" },
              whiteSpace: "nowrap",
              "&:hover": { bgcolor: "#333333", boxShadow: "none" },
            }}
          >
            Pesquisar
          </Button>
        </Box>
      </LocalizationProvider>
    </Box>
  );
}