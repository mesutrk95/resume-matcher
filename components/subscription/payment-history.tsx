'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { format, isFuture } from 'date-fns';
import {
  AlertCircle,
  Calendar,
  Check,
  Clock,
  FileText,
  Receipt,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface PaymentHistoryItem {
  id: string;
  amount: number;
  currency: string;
  status: string;
  date: Date;
  description: string;
  invoiceUrl?: string | null;
  receiptUrl?: string | null;
  isUpcoming?: boolean;
  billingPeriod?: string;
}

interface PaymentHistoryProps {
  payments: PaymentHistoryItem[];
  error: string | undefined;
}

export function PaymentHistory({ payments, error }: PaymentHistoryProps) {
  // Helper function to format currency
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  // Helper to get status badge
  const getStatusBadge = (status: string, isUpcoming: boolean = false) => {
    if (isUpcoming) {
      return (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1"
        >
          <Clock className="h-3 w-3" /> Upcoming
        </Badge>
      );
    }

    switch (status) {
      case 'succeeded':
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1"
          >
            <Check className="h-3 w-3" /> Paid
          </Badge>
        );
      case 'pending':
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1"
          >
            <RefreshCw className="h-3 w-3" /> Pending
          </Badge>
        );
      case 'failed':
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1"
          >
            <XCircle className="h-3 w-3" /> Failed
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="bg-gray-50 text-gray-700 border-gray-200 flex items-center gap-1"
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
    }
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center p-4 rounded-md bg-red-50 text-red-800 border border-red-200">
            <AlertCircle className="h-5 w-5 mr-2" />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort payments with upcoming first, then by date (newest to oldest)
  const sortedPayments = [...payments].sort((a, b) => {
    if (a.isUpcoming && !b.isUpcoming) return -1;
    if (!a.isUpcoming && b.isUpcoming) return 1;

    return b.date.getTime() - a.date.getTime();
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <span>Payment History</span>
        </CardTitle>
        <CardDescription>
          View your subscription payment history and upcoming charges
        </CardDescription>
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <div className="text-center py-12 border rounded-md bg-gray-50">
            <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700">
              No payment history
            </h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto mt-2">
              Your payment history will appear here once you have an active
              subscription.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Billing Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedPayments.map(payment => {
                  const isFuturePayment = isFuture(payment.date);

                  return (
                    <TableRow
                      key={payment.id}
                      className={cn(payment.isUpcoming && 'bg-blue-50/30')}
                    >
                      <TableCell>
                        <div className="flex flex-col">
                          <div className="font-medium">
                            {format(payment.date, 'MMM d, yyyy')}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(payment.date, 'h:mm a')}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{payment.description}</div>
                      </TableCell>
                      <TableCell>
                        {payment.billingPeriod ? (
                          <div className="text-sm text-muted-foreground">
                            {payment.billingPeriod}
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">-</div>
                        )}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(payment.status, payment.isUpcoming)}
                      </TableCell>
                      <TableCell>
                        <div
                          className={cn(
                            'font-medium flex items-center',
                            payment.status === 'failed' ? 'text-red-600' : '',
                          )}
                        >
                          {formatCurrency(payment.amount, payment.currency)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        {payment.invoiceUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2"
                            asChild
                          >
                            <a
                              href={payment.invoiceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center"
                            >
                              <FileText className="h-3.5 w-3.5 mr-1" />
                              Invoice
                            </a>
                          </Button>
                        )}
                        {payment.receiptUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2"
                            asChild
                          >
                            <a
                              href={payment.receiptUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center"
                            >
                              <Receipt className="h-3.5 w-3.5 mr-1" />
                              Receipt
                            </a>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
