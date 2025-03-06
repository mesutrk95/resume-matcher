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
      toolbar:false,
      toolbarSticky: false,
      // toolbarButtonSize: 'small',
      ...config,
    }),
    [config, disabled]
  );

  return (
    <div>
      <label>{label}</label>
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
  );
};
