import { useState, useCallback } from "react";
import { startOfMonth, endOfMonth } from "date-fns";

export type DateFilterTab = "vencimento" | "competencia";

export type FiltroOption = {
  id: string | number;
  nome: string;
};

export type ConvenioOption = FiltroOption & {
  idOperadora: string | number;
}

export interface DateFilter {
  startDate: Date | null;
  endDate: Date | null;
  tab: DateFilterTab;
  convenios: ConvenioOption[];
  operadoras: FiltroOption[];
}

export interface UseDateFilterReturn extends DateFilter {
  setStartDate: (date: Date | null) => void;
  setEndDate: (date: Date | null) => void;
  setTab: (tab: DateFilterTab) => void;
  setConvenios: (val: FiltroOption[]) => void;
  setOperadoras: (val: FiltroOption[]) => void;
  reset: () => void;
}

const getDefaults = (): DateFilter => ({
  startDate: startOfMonth(new Date()),
  endDate: endOfMonth(new Date()),
  tab: "competencia",
  convenios: [],
  operadoras: []
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

  const setConvenios = useCallback((val: ConvenioOption[]) => {
    setFilter((prev) => ({ ...prev, convenios: val }));
  }, []);

  const setOperadoras = useCallback((val: FiltroOption[]) => {
    setFilter((prev) => ({ ...prev, operadoras: val }));
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
    setOperadoras, 
    reset 
  };
}