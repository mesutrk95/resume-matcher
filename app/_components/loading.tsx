import { LucideLoader2 } from "lucide-react";
import React from "react";

export const ContentLoading = ({
  loading,
  loadingContent,
  children,
}: {
  loading: boolean;
  loadingContent?: string | React.ReactNode;
  children: React.ReactNode;
}) => {
  if (!loading) {
    return children;
  }
  return (
    <div className="flex items-center justify-center gap-2">
      {typeof loadingContent === "string" || !loadingContent ? (
        <>
          <LucideLoader2 className="animate-spin" />
          {loadingContent || "Loading..."}
        </>
      ) : (
        <>{loadingContent}</>
      )}
    </div>
  );
};
