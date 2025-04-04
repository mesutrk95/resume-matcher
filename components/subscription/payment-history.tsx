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
import { format } from 'date-fns';
import { ExternalLink, FileText, Receipt } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

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
}

interface PaymentHistoryProps {
  payments: PaymentHistoryItem[];
  error: string | null;
}

export function PaymentHistory({ payments, error }: PaymentHistoryProps) {
  // Helper function to format currency
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  // Helper to get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  // Separate upcoming payments and past payments
  const upcomingPayments = payments.filter(payment => payment.isUpcoming);
  const pastPayments = payments.filter(payment => !payment.isUpcoming);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment History</CardTitle>
        <CardDescription>
          Your recent and upcoming subscription payments
        </CardDescription>
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <p className="text-center py-6 text-muted-foreground">
            No payment history available
          </p>
        ) : (
          <div className="overflow-x-auto">
            {upcomingPayments.length > 0 && (
              <>
                <h3 className="font-medium mb-2">Upcoming Payments</h3>
                <Table className="mb-6">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {upcomingPayments.map(payment => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          {format(payment.date, 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(payment.amount, payment.currency)}
                        </TableCell>
                        <TableCell>{payment.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            )}

            <h3 className="font-medium mb-2">Past Payments</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pastPayments.map(payment => (
                  <TableRow key={payment.id}>
                    <TableCell>{format(payment.date, 'MMM d, yyyy')}</TableCell>
                    <TableCell>
                      {formatCurrency(payment.amount, payment.currency)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                          payment.status,
                        )}`}
                      >
                        {payment.status.charAt(0).toUpperCase() +
                          payment.status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell>{payment.description}</TableCell>
                    <TableCell className="text-right space-x-2">
                      {payment.invoiceUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="px-2"
                          asChild
                        >
                          <a
                            href={payment.invoiceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            Invoice
                          </a>
                        </Button>
                      )}
                      {payment.receiptUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="px-2"
                          asChild
                        >
                          <a
                            href={payment.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Receipt className="h-4 w-4 mr-1" />
                            Receipt
                          </a>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
