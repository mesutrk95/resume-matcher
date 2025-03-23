import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import React, { ReactNode } from "react";

export const ResumeBuilderCard = ({
  children,
  onAdd,
  isAdding,
  addButtonText,
  title,
  buttons,
}: {
  children: ReactNode;
  onAdd?: () => void;
  isAdding?: boolean;
  addButtonText?: string;
  buttons?: ReactNode;
  title: string;
}) => {
  return (
    <Card className="">
      <CardHeader className="flex flex-row items-center justify-between px-4 py-3">
        <CardTitle className="text-lg">{title}</CardTitle>
        {buttons}
        {typeof isAdding !== "undefined" && !isAdding ? (
          <Button onClick={onAdd}>
            <Plus className="h-4 w-4 mr-1" />
            {addButtonText}
          </Button>
        ) : null}
      </CardHeader>

      <div className="p-4 pt-0">{children}</div>
    </Card>
  );
};
