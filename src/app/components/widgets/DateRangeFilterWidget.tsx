"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Autocomplete,
  Checkbox,
  TextField,
  Grid,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { RestartAlt } from "@mui/icons-material";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ptBR } from "date-fns/locale";
import type { ConvenioOption, FiltroOption } from "../../hooks/useDateFilter";
import { useFilterOptions } from "../../hooks/useDashboard";

type Props = {
  startDate: Date | null;
  endDate: Date | null;
  tab: string;
  convenios?: ConvenioOption[];
  operadoras?: FiltroOption[];
  setStartDate: (date: Date | null) => void;
  setEndDate: (date: Date | null) => void;
  setTab: (tab: string) => void;
  setConvenios?: (val: ConvenioOption[]) => void;
  setOperadoras?: (val: FiltroOption[]) => void;
  reset: () => void;
};

export function DateRangeFilterWidget({
  startDate,
  endDate,
  tab,
  convenios = [],
  operadoras = [],
  setStartDate,
  setEndDate,
  setTab,
  setConvenios,
  setOperadoras,
  reset,
}: Props) {
  const [tempStart, setTempStart] = useState<Date | null>(startDate);
  const [tempEnd, setTempEnd] = useState<Date | null>(endDate);
  const [tempTab, setTempTab] = useState<string>(tab || "competencia");
  const [tempConvenios, setTempConvenios] = useState<ConvenioOption[]>(convenios);
  const [tempOperadoras, setTempOperadoras] = useState<FiltroOption[]>(operadoras);

  const { data: filterOptionsData, isLoading } = useFilterOptions();

  const opcoesConvenios: ConvenioOption[] = filterOptionsData?.convenios || [];
  const opcoesOperadoras: FiltroOption[] = filterOptionsData?.operadoras || [];

  useEffect(() => {
    setTempStart(startDate);
    setTempEnd(endDate);
    setTempTab(tab || "competencia");
    setTempConvenios(convenios);
    setTempOperadoras(operadoras);
  }, [startDate, endDate, tab, convenios, operadoras]);

  const handlePesquisar = () => {
    setStartDate(tempStart);
    setEndDate(tempEnd);
    setTab(tempTab);
    if (setConvenios) setConvenios(tempConvenios);
    if (setOperadoras) setOperadoras(tempOperadoras);
  };

  const opcoesConveniosFiltradas = useMemo(() => {
    if (tempOperadoras.length === 0) return opcoesConvenios;
    
    return opcoesConvenios.filter((conv: ConvenioOption) => 
      tempOperadoras.some((op) => String(op.id) === String(conv.idOperadora))
    );
  }, [opcoesConvenios, tempOperadoras]);

  const handleOperadorasChange = (novasOperadoras: FiltroOption[]) => {
    setTempOperadoras(novasOperadoras);
    
    if (novasOperadoras.length > 0) {
      setTempConvenios((prev) => 
        prev.filter((conv: ConvenioOption) => 
          novasOperadoras.some((op) => String(op.id) === String(conv.idOperadora))
        )
      );
    }
  };

  const renderMultiSelect = <T extends FiltroOption>(
    label: string,
    value: T[],
    setter: (val: T[]) => void,
    opcoesFuturasDaAPI: T[] = [],
  ) => (
    <Autocomplete
      multiple
      size="small"
      limitTags={1} // Limita para 1 tag visível (+ "x mais") para não esticar a caixa verticalmente
      disableCloseOnSelect
      noOptionsText="Nenhuma opção encontrada"
      options={opcoesFuturasDaAPI}
      getOptionLabel={(option) => option.nome}
      isOptionEqualToValue={(option, val) => String(option.id) === String(val.id)}
      value={value}
      onChange={(_, newValue) => setter(newValue as T[])}
      loading={isLoading}
      renderOption={(props, option, { selected }) => {
        const { key, ...restProps } = props as any;
        return (
          <li key={key} {...restProps} style={{ padding: "4px 8px" }}>
            <Checkbox style={{ marginRight: 8, padding: 4 }} checked={selected} size="small" />
            <Typography
              variant="body2"
              sx={{
                lineHeight: 1.2,
                whiteSpace: "normal",
                wordBreak: "break-word",
              }}
            >
              {option.nome}
            </Typography>
          </li>
        );
      }}
      // Removemos customizações problemáticas de Tags e InputRoot para deixar o MUI fazer o redimensionamento fluido
      renderInput={(params) => (
        <TextField {...params} label={label} placeholder="Buscar..." />
      )}
      sx={{ width: "100%" }}
    />
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        p: 2,
        mb: 3,
        borderRadius: 2,
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
        Filtros Globais
      </Typography>

      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
        {/* Utilizamos flex-start para que, se algum elemento crescer (como a seleção múltipla), os outros não estiquem estranhamente */}
        <Grid container spacing={2} alignItems="flex-start">
          
          <Grid item xs={12} sm={6} md={2}>
            <DatePicker
              label="Data inicial"
              value={tempStart}
              onChange={(val) => setTempStart(val)}
              maxDate={tempEnd ?? undefined}
              slotProps={{
                textField: { size: "small", fullWidth: true },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <DatePicker
              label="Data final"
              value={tempEnd}
              onChange={(val) => setTempEnd(val)}
              minDate={tempStart ?? undefined}
              slotProps={{
                textField: { size: "small", fullWidth: true },
              }}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <ToggleButtonGroup
              value={tempTab}
              exclusive
              onChange={(_, val) => { if (val) setTempTab(val); }}
              size="small"
              fullWidth
              aria-label="Filtrar por"
              sx={{
                height: 40,
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
                  color: "#a3a3a3",
                  bgcolor: "transparent",
                  fontSize: { xs: "0.85rem", sm: "0.9rem" },
                  fontWeight: 500,
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
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            {renderMultiSelect("Operadoras", tempOperadoras, handleOperadorasChange, opcoesOperadoras)}
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            {renderMultiSelect("Convênios", tempConvenios, setTempConvenios, opcoesConveniosFiltradas)}
          </Grid>

          {/* Botões - Forçados para a próxima linha e alinhados à direita */}
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, pt: { xs: 1, md: 0 } }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<RestartAlt />}
              onClick={reset}
              sx={{
                height: 38,
                color: "text.secondary",
                borderColor: "divider",
                minWidth: "120px",
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              Limpar Filtros
            </Button>

            <Button
              variant="contained"
              size="small"
              onClick={handlePesquisar}
              startIcon={
                <FuseSvgIcon size={18}>heroicons-outline:magnifying-glass</FuseSvgIcon>
              }
              sx={{
                height: 38,
                bgcolor: "#000000",
                color: "#ffffff",
                boxShadow: "none",
                minWidth: "120px",
                "&:hover": { bgcolor: "#333333", boxShadow: "none" },
              }}
            >
              Pesquisar
            </Button>
          </Grid>

        </Grid>
      </LocalizationProvider>
    </Box>
  );
}