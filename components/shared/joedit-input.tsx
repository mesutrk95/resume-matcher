import dynamic from "next/dynamic";
import React, { useMemo } from "react";
import { Control, useController } from "react-hook-form";
const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

interface JoeditInputProps {
  control: Control<any>;
  name: string;
  label: string;
  placeholder?: string;
  isPending?: boolean;
  disabled?: boolean;
  config: {
    height: number | string;
  };
}

export const JoeditInput = ({
  control,
  name,
  label,
  placeholder,
  isPending,
  disabled,
  config,
}: JoeditInputProps) => {
  const {
    field: { value, onChange },
  } = useController({
    name,
    control,
    defaultValue: "", // Set a default value if needed
  });

  const conf = useMemo(
    () => ({
      readonly: disabled,
      toolbar: false,
      toolbarSticky: false,
      // toolbarButtonSize: 'small',
      ...config,
    }),
    [config, disabled]
  );

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {label}
      </label>
      <div className="pt-2">
        <JoditEditor
          value={value}
          config={conf}
          tabIndex={1} // tabIndex of textarea
          onBlur={(newContent) => {
            onChange(newContent);
          }}
          onChange={(newContent) => {
            onChange(newContent);
          }}
        />
      </div>
    </div>
  );
};
