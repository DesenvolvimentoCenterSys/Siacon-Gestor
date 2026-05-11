import { useState, useCallback } from "react";
import { startOfMonth, endOfMonth } from "date-fns";

export type DateFilterTab = "vencimento" | "competencia";

export type FiltroOption = {
  id: string | number;
  nome: string;
};

export interface DateFilter {
  startDate: Date | null;
  endDate: Date | null;
  tab: DateFilterTab;
  convenios: FiltroOption[];
  servicos: FiltroOption[];
  centrosCusto: FiltroOption[];
  planosContas: FiltroOption[];
}

export interface UseDateFilterReturn extends DateFilter {
  setStartDate: (date: Date | null) => void;
  setEndDate: (date: Date | null) => void;
  setTab: (tab: DateFilterTab) => void;
  setConvenios: (val: FiltroOption[]) => void;
  setServicos: (val: FiltroOption[]) => void;
  setCentrosCusto: (val: FiltroOption[]) => void;
  setPlanosContas: (val: FiltroOption[]) => void;
  reset: () => void;
}

const getDefaults = (): DateFilter => ({
  startDate: startOfMonth(new Date()),
  endDate: endOfMonth(new Date()),
  tab: "competencia",
  convenios: [],
  servicos: [],
  centrosCusto: [],
  planosContas: [],
});

export function useDateFilter(): UseDateFilterReturn {
  const [filter, setFilter] = useState<DateFilter>(getDefaults);

  const setStartDate = useCallback((date: Date | null) => {
    setFilter((prev) => ({ ...prev, startDate: date }));
  }, []);

  const setEndDate = useCallback((date: Date | null) => {
    setFilter((prev) => ({ ...prev, endDate: date }));
  }, []);

  const setTab = useCallback((tab: DateFilterTab) => {
    setFilter((prev) => ({ ...prev, tab }));
  }, []);

  const setConvenios = useCallback((val: FiltroOption[]) => {
    setFilter((prev) => ({ ...prev, convenios: val }));
  }, []);

  const setServicos = useCallback((val: FiltroOption[]) => {
    setFilter((prev) => ({ ...prev, servicos: val }));
  }, []);

  const setCentrosCusto = useCallback((val: FiltroOption[]) => {
    setFilter((prev) => ({ ...prev, centrosCusto: val }));
  }, []);

  const setPlanosContas = useCallback((val: FiltroOption[]) => {
    setFilter((prev) => ({ ...prev, planosContas: val }));
  }, []);

  const reset = useCallback(() => {
    setFilter(getDefaults());
  }, []);

  return { 
    ...filter, 
    setStartDate, 
    setEndDate, 
    setTab, 
    setConvenios, 
    setServicos, 
    setCentrosCusto, 
    setPlanosContas, 
    reset 
  };
}