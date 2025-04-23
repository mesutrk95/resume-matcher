'use client';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Dispatch, SetStateAction, useState } from 'react';
import { cn } from '@/lib/utils';
import { CATEGORIES, INDUSTRIES } from './constants';
import { CareerProfileGalleryItem } from './career-profile-gallery-item';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

const IndustriesSelect = ({
  onChange,
  value,
}: {
  onChange?: Dispatch<SetStateAction<string>>;
  value?: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[220px] justify-between "
        >
          {value ? (
            INDUSTRIES.find(i => i.value === value)?.label
          ) : (
            <span className="text-muted-foreground">All Industries</span>
          )}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-0">
        <Command>
          <CommandInput placeholder="Search industry..." className="h-9" />
          <CommandList>
            <CommandEmpty>Not found.</CommandEmpty>
            <CommandGroup>
              {INDUSTRIES.map(industry => (
                <CommandItem
                  className="text-sm"
                  key={industry.value}
                  value={industry.value}
                  onSelect={currentValue => {
                    onChange?.(currentValue === value ? '' : currentValue);
                    setOpen(false);
                  }}
                >
                  {industry.label}
                  <Check
                    className={cn(
                      'ml-auto',
                      value === industry.value ? 'opacity-100' : 'opacity-0',
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
};
const CategoriesSelect = ({
  industry,
  onChange,
  value,
}: {
  industry: string;
  onChange?: Dispatch<SetStateAction<string>>;
  value?: string;
}) => {
  const [open, setOpen] = useState(false);

  const items = CATEGORIES[industry as keyof typeof CATEGORIES];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[220px] justify-between "
          disabled={!items}
        >
          {value ? (
            items?.find(item => item.value === value)?.label
          ) : (
            <span className="text-muted-foreground">All Categories</span>
          )}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-0">
        <Command>
          <CommandInput placeholder="Search industry..." className="h-9" />
          <CommandList>
            <CommandEmpty>Not found.</CommandEmpty>
            <CommandGroup>
              {items?.map(item => (
                <CommandItem
                  className="text-sm"
                  key={item.value}
                  value={item.value}
                  onSelect={currentValue => {
                    onChange?.(currentValue === value ? '' : currentValue);
                    setOpen(false);
                  }}
                >
                  {item.label}
                  <Check
                    className={cn('ml-auto', value === item.value ? 'opacity-100' : 'opacity-0')}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export const CareerProfileGallery = () => {
  const [industry, setIndustry] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Get filtered items based on industry
  const items = industry
    ? CATEGORIES[industry as keyof typeof CATEGORIES]
    : Object.values(CATEGORIES).flat();

  // Calculate pagination values
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);

  // Handle page changes
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Generate page numbers array
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="">
      <div className="mt-5 flex justify-between">
        <div>
          <h2 className="text-xl font-bold">Featured Templates</h2>
          <p className="text-muted-foreground">Choose one of our designed templates</p>
        </div>
        <div className="flex gap-2 self-end">
          <IndustriesSelect value={industry} onChange={setIndustry} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
        {currentItems.map(template => (
          <CareerProfileGalleryItem
            key={template.value}
            label={template.label}
            caption={template.caption}
            url={template.url}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>

              {pageNumbers.map(number => (
                <PaginationItem key={number}>
                  <PaginationLink
                    onClick={() => handlePageChange(number)}
                    isActive={currentPage === number}
                  >
                    {number}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};
