import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DateScrollPickerProps {
  value?: Date;
  onChange: (date: Date) => void;
  minYear?: number;
  maxYear?: number;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function DateScrollPicker({
  value,
  onChange,
  minYear = 1940,
  maxYear = new Date().getFullYear(),
}: DateScrollPickerProps) {
  const day = value?.getDate();
  const month = value ? value.getMonth() + 1 : undefined;
  const year = value?.getFullYear();

  const daysInMonth = month && year ? new Date(year, month, 0).getDate() : 31;

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const years = Array.from(
    { length: maxYear - minYear + 1 },
    (_, i) => maxYear - i
  );

  const update = (d: number, m: number, y: number) => {
    const clampedDay = Math.min(d, new Date(y, m, 0).getDate());
    onChange(new Date(y, m - 1, clampedDay));
  };

  return (
    <div className="flex gap-2">
      {/* Day */}
      <Select
        value={day ? String(day) : undefined}
        onValueChange={(v) => update(Number(v), month || 1, year || 2000)}
      >
        <SelectTrigger className="flex-1">
          <SelectValue placeholder="Day" />
        </SelectTrigger>
        <SelectContent>
          {days.map((d) => (
            <SelectItem key={d} value={String(d)}>
              {String(d).padStart(2, '0')}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Month */}
      <Select
        value={month ? String(month) : undefined}
        onValueChange={(v) => update(day || 1, Number(v), year || 2000)}
      >
        <SelectTrigger className="flex-[2]">
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent>
          {MONTHS.map((m, i) => (
            <SelectItem key={i + 1} value={String(i + 1)}>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Year */}
      <Select
        value={year ? String(year) : undefined}
        onValueChange={(v) => update(day || 1, month || 1, Number(v))}
      >
        <SelectTrigger className="flex-[1.5]">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          {years.map((y) => (
            <SelectItem key={y} value={String(y)}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}