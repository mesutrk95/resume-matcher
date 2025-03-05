import { LucideLoader2 } from "lucide-react";
import React from "react";

export const ContentLoading = ({
  loading,
  children,
}: {
  loading: boolean;
  children: React.ReactNode;
}) => {
  if (!loading) {
    return children;
  }
  return (
    <div className="flex items-center justify-center gap-2">
      <LucideLoader2 className="animate-spin" />
      Loading...
    </div>
  );
};
