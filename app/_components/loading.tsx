import clsx from 'clsx';
import { LucideLoader2 } from 'lucide-react';
import React from 'react';

export const ContentLoading = ({
  loading,
  loadingContent,
  children,
  className,
}: {
  loading: boolean;
  loadingContent?: string | React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) => {
  if (!loading) {
    return children;
  }
  return (
    <div className="flex items-center justify-center gap-2">
      {typeof loadingContent === 'string' || !loadingContent ? (
        <div className={clsx('text-xs flex gap-1 items-center', className)}>
          <LucideLoader2 className="animate-spin" size={16} />
          {loadingContent || 'Loading...'}
        </div>
      ) : (
        <>{loadingContent}</>
      )}
    </div>
  );
};
