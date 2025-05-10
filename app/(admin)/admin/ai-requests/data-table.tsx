'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AIRequestStatus } from '@prisma/client';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  AIRequestRow,
  StatusBadge,
  formatUser,
  formatPrompt,
  formatTokens,
  formatResponseTime,
  formatCreatedAt,
} from './columns';
import Link from 'next/link';

interface DataTableProps {
  data: AIRequestRow[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

export function AIRequestDataTable({ data, pagination }: DataTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [userId, setUserId] = useState(searchParams.get('userId') || '');
  const [promptKey, setPromptKey] = useState(searchParams.get('promptKey') || '');
  const [status, setStatus] = useState(searchParams.get('status') || 'ALL');

  // Function to update URL with new search params
  const updateSearchParams = (params: Record<string, string | null>) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());

    // Update or remove each parameter
    Object.entries(params).forEach(([key, value]) => {
      if (value === null) {
        newSearchParams.delete(key);
      } else {
        newSearchParams.set(key, value);
      }
    });

    router.push(`${pathname}?${newSearchParams.toString()}`);
  };

  // Handle status filter change
  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    updateSearchParams({
      status: newStatus === 'ALL' ? null : newStatus,
      page: '1', // Reset to first page when filter changes
    });
  };

  // Handle user ID filter change
  const handleUserIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUserId = e.target.value.trim();
    setUserId(newUserId);
    updateSearchParams({
      userId: newUserId || null,
      page: '1', // Reset to first page when filter changes
    });
  };

  // Handle prompt key filter change
  const handlePromptKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPromptKey = e.target.value.trim();
    setPromptKey(newPromptKey);
    updateSearchParams({
      promptKey: newPromptKey || null,
      page: '1', // Reset to first page when filter changes
    });
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    updateSearchParams({ page: page.toString() });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 py-4">
        <Input
          placeholder="Filter by User ID..."
          className="max-w-sm"
          value={userId}
          onChange={handleUserIdChange}
        />
        <Input
          placeholder="Filter by Prompt Key..."
          className="max-w-sm"
          value={promptKey}
          onChange={handlePromptKeyChange}
        />
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
            <SelectItem value="RATE_LIMITED">Rate Limited</SelectItem>
            <SelectItem value="PROCESSING">Processing</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Prompt</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Tokens</TableHead>
              <TableHead className="text-right">Response Time</TableHead>
              <TableHead className="text-right">Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            ) : (
              data.map(request => (
                <TableRow
                  key={request.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => router.push(`/admin/ai-requests/${request.id}`)}
                >
                  <TableCell className="font-mono text-xs">
                    {request.id.substring(0, 8)}...
                  </TableCell>
                  <TableCell>{formatUser(request.user)}</TableCell>
                  <TableCell>{formatPrompt(request.variation)}</TableCell>
                  <TableCell>
                    <StatusBadge status={request.status} />
                  </TableCell>
                  <TableCell className="text-right">{formatTokens(request.totalTokens)}</TableCell>
                  <TableCell className="text-right">
                    {formatResponseTime(request.responseTime)}
                  </TableCell>
                  <TableCell className="text-right">{formatCreatedAt(request.createdAt)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-sm text-muted-foreground">
          Showing {pagination.pageSize * (pagination.page - 1) + 1} to{' '}
          {Math.min(pagination.pageSize * pagination.page, pagination.totalCount)} of{' '}
          {pagination.totalCount} entries
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
