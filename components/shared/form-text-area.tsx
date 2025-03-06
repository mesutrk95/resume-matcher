"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Control } from "react-hook-form";

interface FormTextareaProps {
  control: Control<any>;
  name: string;
  label: string;
  placeholder?: string;
  isPending?: boolean;
  disabled?: boolean;
}

export const FormTextarea = ({
  control,
  name,
  label,
  placeholder,
  isPending,
  disabled,
}: FormTextareaProps) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Textarea
              {...field}
              placeholder={placeholder}
              disabled={isPending || disabled}
              className="resize-y min-h-24"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};