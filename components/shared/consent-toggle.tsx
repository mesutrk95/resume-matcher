'use client';

import { FormControl, FormField, FormItem } from '@/components/ui/form';
import { Control, FieldValues, Path } from 'react-hook-form';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

type ConsentToggleProps<T extends FieldValues> = React.ComponentPropsWithRef<'button'> & {
  control: Control<T>;
  name: Path<T>;
  label: React.ReactNode;
  isPending?: boolean;
};

export const ConsentToggle = <T extends FieldValues>(props: ConsentToggleProps<T>) => {
  const { control, name, label, isPending, className, ...rest } = props;
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn('flex flex-row items-center space-x-2 space-y-0', className)}>
          <FormControl>
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={isPending}
              {...rest}
            />
          </FormControl>
          <label
            htmlFor={name}
            className="text-sm text-muted-foreground cursor-pointer"
            onClick={() => field.onChange(!field.value)}
          >
            {label}
          </label>
        </FormItem>
      )}
    />
  );
};
