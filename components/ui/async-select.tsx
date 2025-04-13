import { useState, useEffect, useCallback, useRef } from 'react';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useDebounce } from '@/app/hooks/use-debounce';

export interface Option {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
  icon?: React.ReactNode;
}

export interface AsyncSelectProps<T> {
  /** Async function to fetch options */
  fetcher: (query?: string) => Promise<T[]>;
  /** Preload all data ahead of time */
  preload?: boolean;
  /** Function to filter options */
  filterFn?: (option: T, query: string) => boolean;
  /** Function to render each option */
  renderOption: (option: T) => React.ReactNode;
  /** Function to get the value from an option */
  getOptionValue: (option: T) => string;
  /** Function to get the display value for the selected option */
  getDisplayValue: (option: T) => React.ReactNode;
  /** Custom not found message */
  notFound?: React.ReactNode;
  /** Custom loading skeleton */
  loadingSkeleton?: React.ReactNode;
  /** Currently selected value */
  value: string;
  /** Callback when selection changes */
  onChange: (value: string) => void;
  /** Label for the select field */
  label: string;
  /** Placeholder text when no selection */
  placeholder?: string;
  /** Disable the entire select */
  disabled?: boolean;
  /** Custom width for the popover */
  width?: string | number;
  /** Custom class names */
  className?: string;
  /** Custom trigger button class names */
  triggerClassName?: string;
  /** Custom no results message */
  noResultsMessage?: string;
  /** Allow clearing the selection */
  clearable?: boolean;
}

export function AsyncSelect<T>({
  fetcher,
  preload = false,
  filterFn,
  renderOption,
  getOptionValue,
  getDisplayValue,
  notFound,
  loadingSkeleton,
  label,
  placeholder = 'Select...',
  value,
  onChange,
  disabled = false,
  width = '200px',
  className,
  triggerClassName,
  noResultsMessage,
  clearable = true,
}: AsyncSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedValue, setSelectedValue] = useState(value);
  const [selectedOption, setSelectedOption] = useState<T | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, preload ? 0 : 300);

  // Use refs to track fetch status and prevent duplicate fetches
  const initialFetchRef = useRef(false);
  const searchFetchRef = useRef(false);
  const lastSearchTermRef = useRef(debouncedSearchTerm);
  const fetchInProgressRef = useRef(false);

  // Update selectedValue when external value changes
  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  // Handle initial fetch - only if preload is true
  useEffect(() => {
    if (!preload) return; // Skip if preload is false

    const doInitialFetch = async () => {
      if (initialFetchRef.current || fetchInProgressRef.current) {
        return; // Skip if initial fetch already done or fetch in progress
      }

      fetchInProgressRef.current = true;
      try {
        setLoading(true);
        setError(null);

        const data = await fetcher();
        setOptions(data);

        initialFetchRef.current = true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch options');
      } finally {
        setLoading(false);
        fetchInProgressRef.current = false;
      }
    };

    doInitialFetch();
  }, [fetcher, preload]);

  // Handle search term changes (only when dropdown is open)
  useEffect(() => {
    if (!open) return; // Skip if dropdown is closed
    if (debouncedSearchTerm === lastSearchTermRef.current) return; // Skip if same search term
    lastSearchTermRef.current = debouncedSearchTerm;

    const doSearch = async () => {
      if (fetchInProgressRef.current) return; // Skip if fetch already in progress

      fetchInProgressRef.current = true;
      searchFetchRef.current = true;

      try {
        setLoading(true);
        setError(null);

        if (preload) {
          // Local filtering if preload is true
          const data = await fetcher();
          setOptions(
            debouncedSearchTerm && filterFn
              ? data.filter(option => filterFn(option, debouncedSearchTerm))
              : data,
          );
        } else {
          // Remote search
          const data = await fetcher(debouncedSearchTerm);
          setOptions(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch options');
      } finally {
        setLoading(false);
        fetchInProgressRef.current = false;
      }
    };

    doSearch();
  }, [debouncedSearchTerm, open, fetcher, preload, filterFn]);

  // Find selected option when options or value changes
  useEffect(() => {
    if (value && options.length > 0) {
      const option = options.find(opt => getOptionValue(opt) === value);
      if (option) {
        setSelectedOption(option);
      } else if (initialFetchRef.current && !loading) {
        // If value not found in options after initial fetch, fetch it specifically
        const fetchValueOption = async () => {
          if (fetchInProgressRef.current) return;
          fetchInProgressRef.current = true;

          try {
            setLoading(true);
            const data = await fetcher(value);
            if (data && data.length > 0) {
              const option = data.find(opt => getOptionValue(opt) === value);
              if (option) {
                setSelectedOption(option);
                setOptions(prevOptions => {
                  const newOptions = [...prevOptions];
                  // Add only if not already in options
                  if (!newOptions.some(opt => getOptionValue(opt) === value)) {
                    newOptions.push(option);
                  }
                  return newOptions;
                });
              }
            }
          } catch (error) {
            console.error('Error fetching specific value:', error);
          } finally {
            setLoading(false);
            fetchInProgressRef.current = false;
          }
        };

        fetchValueOption();
      }
    } else if (!value) {
      setSelectedOption(null);
    }
  }, [value, options, getOptionValue, fetcher]);

  const handleSelect = useCallback(
    (currentValue: string) => {
      const newValue = clearable && currentValue === selectedValue ? '' : currentValue;
      setSelectedValue(newValue);
      setSelectedOption(options.find(option => getOptionValue(option) === newValue) || null);
      onChange(newValue);
      setOpen(false);
    },
    [selectedValue, onChange, clearable, options, getOptionValue],
  );

  // When opening the dropdown, ensure we have options
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);

    // If opening and (preload is false OR no options loaded yet)
    if (newOpen && (!initialFetchRef.current || !preload) && !fetchInProgressRef.current) {
      // If not preloaded, always fetch on open
      if (!preload) {
        initialFetchRef.current = true;
      }

      fetchInProgressRef.current = true;

      setLoading(true);
      fetcher(searchTerm)
        .then(data => {
          setOptions(data);
        })
        .catch(err => {
          setError(err instanceof Error ? err.message : 'Failed to fetch options');
        })
        .finally(() => {
          setLoading(false);
          fetchInProgressRef.current = false;
        });
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'justify-between',
            disabled && 'opacity-50 cursor-not-allowed',
            triggerClassName,
          )}
          style={{ width: width }}
          disabled={disabled}
        >
          {selectedOption ? getDisplayValue(selectedOption) : placeholder}
          <ChevronsUpDown className="opacity-50" size={10} />
        </Button>
      </PopoverTrigger>
      <PopoverContent style={{ width: width }} className={cn('p-0', className)}>
        <Command shouldFilter={false}>
          <div className="relative border-b w-full">
            <CommandInput
              placeholder={`Search ${label.toLowerCase()}...`}
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            {loading && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            )}
          </div>
          <CommandList>
            {error && <div className="p-4 text-destructive text-center">{error}</div>}
            {loading && options.length === 0 && (loadingSkeleton || <DefaultLoadingSkeleton />)}
            {!loading &&
              !error &&
              options.length === 0 &&
              (notFound || (
                <CommandEmpty>
                  {noResultsMessage ?? `No ${label.toLowerCase()} found.`}
                </CommandEmpty>
              ))}
            <CommandGroup>
              {options.map(option => (
                <CommandItem
                  key={getOptionValue(option)}
                  value={getOptionValue(option)}
                  onSelect={handleSelect}
                >
                  {renderOption(option)}
                  <Check
                    className={cn(
                      'ml-auto h-3 w-3',
                      selectedValue === getOptionValue(option) ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function DefaultLoadingSkeleton() {
  return (
    <CommandGroup>
      {[1, 2, 3].map(i => (
        <CommandItem key={i} disabled>
          <div className="flex items-center gap-2 w-full">
            <div className="h-6 w-6 rounded-full animate-pulse bg-muted" />
            <div className="flex flex-col flex-1 gap-1">
              <div className="h-4 w-24 animate-pulse bg-muted rounded" />
              <div className="h-3 w-16 animate-pulse bg-muted rounded" />
            </div>
          </div>
        </CommandItem>
      ))}
    </CommandGroup>
  );
}
