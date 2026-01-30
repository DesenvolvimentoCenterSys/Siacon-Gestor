import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { TextField } from '@mui/material';

type MonthYearFilterProps = {
  value: Date | null;
  onChange: (date: Date | null) => void;
  label?: string;
};

export default function MonthYearFilter({ value, onChange, label = "Período" }: MonthYearFilterProps) {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <DatePicker
        views={['year', 'month']}
        label={label}
        value={value}
        onChange={onChange}
        slotProps={{ textField: { size: 'small', sx: { width: 180 } } }}
      />
    </LocalizationProvider>
  );
}
