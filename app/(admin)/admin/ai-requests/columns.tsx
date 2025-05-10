'use client';

import { AIRequestStatus } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

// Define the type for the data we'll display in the table
export type AIRequestRow = {
  id: string;
  variationId: string;
  userId: string | null;
  contentId: string;
  clientId: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  responseTime: number;
  status: AIRequestStatus;
  errorMessage: string | null;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
  variation: {
    prompt: {
      key: string;
      name: string;
    };
  };
};

// Status badge component
export const StatusBadge = ({ status }: { status: AIRequestStatus }) => {
  const statusConfig = {
    COMPLETED: { color: 'bg-green-100 text-green-800', label: 'Completed' },
    FAILED: { color: 'bg-red-100 text-red-800', label: 'Failed' },
    RATE_LIMITED: { color: 'bg-yellow-100 text-yellow-800', label: 'Rate Limited' },
    PROCESSING: { color: 'bg-blue-100 text-blue-800', label: 'Processing' },
  };

  const config = statusConfig[status];

  return (
    <Badge variant="outline" className={`${config.color}`}>
      {config.label}
    </Badge>
  );
};

// Format the user display
export const formatUser = (user: AIRequestRow['user']) => {
  return user ? (
    <div className="max-w-[200px] truncate">
      {user.name || user.email || user.id.substring(0, 8)}
    </div>
  ) : (
    <div className="text-muted-foreground">Anonymous</div>
  );
};

// Format the prompt display
export const formatPrompt = (variation: AIRequestRow['variation']) => {
  const { key, name } = variation.prompt;
  return (
    <div className="max-w-[200px] truncate">
      <div className="font-medium">{name}</div>
      <div className="text-xs text-muted-foreground">{key}</div>
    </div>
  );
};

// Format the tokens display
export const formatTokens = (totalTokens: number) => {
  return <div className="text-right">{totalTokens.toLocaleString()}</div>;
};

// Format the response time display
export const formatResponseTime = (responseTime: number) => {
  return <div className="text-right">{responseTime}ms</div>;
};

// Format the created at display
export const formatCreatedAt = (createdAt: Date) => {
  return (
    <div className="text-right" title={createdAt.toLocaleString()}>
      {formatDistanceToNow(createdAt, { addSuffix: true })}
    </div>
  );
};
