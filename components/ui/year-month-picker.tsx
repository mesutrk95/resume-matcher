'use client';

import * as React from 'react';
import { getYear } from 'date-fns';
import { Calendar as CalendarIcon, Delete, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

interface DatePickerProps {
  date: string | undefined;
  setDate: (date: string | undefined) => void;
  startYear?: number;
  endYear?: number;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const parseDate = (date: string) => {
  const d = date.split('/');

  return `${d[0]}/01/${d[1]}`;
};

export function YearMonthPicker({
  className = 'w-full',
  date,
  setDate,
  startYear = getYear(new Date()) - 20,
  endYear = getYear(new Date()) + 10,
  placeholder = 'Pick a date',
  disabled,
}: DatePickerProps) {
  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);

  const selectedDate = React.useMemo(() => {
    const dateComponents = date?.split('/');
    const year = dateComponents?.[1] || getYear(new Date()).toString();
    const month = Number(dateComponents?.[0]);
    return {
      year,
      month: Number(month),
      monthName: month ? months[month - 1] : undefined,
    };
  }, [date]);

  const handleMonthChange = (month: string) => {
    const monthNumber = months.indexOf(month) + 1;
    const year = selectedDate.year || new Date().getFullYear().toString();
    setDate(`${monthNumber.toString().padStart(2, '0')}/${year}`);
  };

  const handleYearChange = (year: string) => {
    const month = selectedDate.month || new Date().getMonth() + 1;
    setDate(`${month.toString().padStart(2, '0')}/${year}`);
  };

  const handleClear = () => {
    setDate(undefined);
  };

  const getText = () => {
    if (date === 'Present') return date;

    if (date) return `${selectedDate.monthName || ''} ${selectedDate.year}`;

    return placeholder;
  };

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={'outline'}
            className={cn(
              className,
              'justify-start text-left font-normal',
              !date && 'text-muted-foreground',
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {getText()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <div className="flex flex-col items-center gap-2 p-2">
            <div className="flex justify-between gap-5 w-full">
              <Select
                onValueChange={handleYearChange}
                value={selectedDate.year}
                defaultValue={getYear(new Date()).toString()}
              >
                <SelectTrigger className="flex-grow">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent className="max-h-44">
                  {years.map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {date && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 p-0"
                  onClick={handleClear}
                  aria-label="Clear date"
                >
                  <Delete size={16} />
                </Button>
              )}
            </div>
            {/* <Select onValueChange={handleMonthChange} value={selectedDate.monthName}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent className="max-h-44">
                {months.map((month, index) => (
                  <SelectItem key={month} value={month}>
                    {index + 1} - {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select> */}
            <div className="grid grid-cols-3 gap-2">
              {months.map((month, index) => (
                <Button
                  variant={selectedDate.monthName !== month ? 'outline' : 'default-outline'}
                  className=""
                  key={month}
                  onClick={() => handleMonthChange(month)}
                >
                  {month}
                </Button>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
